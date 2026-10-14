import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const login = { email: 'fede.piedrasanta@gmail.com', password: 'CHANGE_ME_ADMIN_PASSWORD' }
const log = (...a) => console.log(...a)
let failures = 0
const check = (ok, label, detail = '') => {
  if (!ok) failures++
  log(`${ok ? 'OK   ' : 'FALLA'} ${label}${detail ? ` | ${detail}` : ''}`)
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
page.on('pageerror', (e) => {
  failures++
  console.log('PAGEERROR:', String(e).slice(0, 200))
})

await page.request.post('http://localhost:5131/api/users/login', { data: login })
await page.goto(`${BASE}/index`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)

const requests = []
page.on('request', (r) => {
  if (r.url().includes('/api/catalog/')) requests.push(r.url().replace(/^https?:\/\/[^/]+/, ''))
})

const card = () => page.locator('article').first()

const pillLinks = () => page.locator('article a[title^="Editorial:"], article a[title^="Franquicia:"]')
const cardLinks = () => page.locator('article a[aria-label]')

// ---------------------------------------------------------------- publishers
await page.goto(`${BASE}/publishers`, { waitUntil: 'networkidle' })
await page.waitForSelector('article', { timeout: 20000 })
await page.waitForTimeout(800)
const pubCards = await page.locator('article').count()
const pubH1 = await page.locator('h1').innerText()
const pubCount = await page.locator('p:has-text("elementos registrados")').innerText()
check(pubCards > 0 && pubH1 === 'Editoriales', '/publishers lista cards', `${pubCards} cards, h1="${pubH1}"`)
check(/Mostrando\s+\d+/.test(pubCount), '/publishers muestra el conteo', pubCount)
check((await pillLinks().count()) === 0, '/publishers sin pills (nada sobre una editorial)')
check((await cardLinks().count()) === pubCards, '/publishers cada card es navegable', `${await cardLinks().count()} de ${pubCards}`)
const firstPubHref = await cardLinks().first().getAttribute('href')
log(`      card -> ${firstPubHref}`)

// publisher card navigates to its detail
await card().click()
await page.waitForURL('**/publishers/*', { timeout: 15000 })
await page.waitForTimeout(1200)
check(/\/publishers\/\d+$/.test(new URL(page.url()).pathname), '/publishers card navega al detalle', new URL(page.url()).pathname)

// ---------------------------------------------------------------- franchises
await page.goto(`${BASE}/franchises`, { waitUntil: 'networkidle' })
await page.waitForSelector('article', { timeout: 20000 })
await page.waitForTimeout(800)
const frCards = await page.locator('article').count()
const frPills = await pillLinks().count()
check(frCards > 0, '/franchises lista cards', `${frCards} cards`)
check(frPills === frCards, '/franchises: una pill de Editorial por card', `${frPills} pills`)
const pillTitle = await pillLinks().first().getAttribute('title')
check(pillTitle?.startsWith('Editorial: '), '/franchises pill de Editorial con title', pillTitle)

// franchise pill navigates to the publisher
await pillLinks().first().click()
await page.waitForURL('**/publishers/*', { timeout: 15000 })
await page.waitForTimeout(1000)
check(/\/publishers\/\d+$/.test(new URL(page.url()).pathname), '/franchises pill navega a /publishers/:id', new URL(page.url()).pathname)

// franchise card navigates to its own detail (not the pill target)
await page.goto(`${BASE}/franchises`, { waitUntil: 'networkidle' })
await page.waitForSelector('article', { timeout: 20000 })
await page.waitForTimeout(800)
const frCardHref = await cardLinks().first().getAttribute('href')
check(/^\/franchises\/\d+$/.test(frCardHref), '/franchises card -> /franchises/:id', frCardHref)

// --------------------------------------------------------------------- series
await page.goto(`${BASE}/series`, { waitUntil: 'networkidle' })
await page.waitForSelector('article', { timeout: 20000 })
await page.waitForTimeout(800)
const seCards = await page.locator('article').count()
const sePills = await pillLinks().count()
check(seCards > 0, '/series lista cards', `${seCards} cards`)
check(sePills === seCards * 2, '/series: dos pills por card', `${sePills} pills`)
const seTitles = await pillLinks().evaluateAll((els) => els.slice(0, 2).map((e) => e.getAttribute('title')))
check(seTitles[0]?.startsWith('Editorial: ') && seTitles[1]?.startsWith('Franquicia: '), '/series pills con title', JSON.stringify(seTitles))

await pillLinks().nth(1).click()
await page.waitForURL('**/franchises/*', { timeout: 15000 })
await page.waitForTimeout(1000)
check(/\/franchises\/\d+$/.test(new URL(page.url()).pathname), '/series pill Franquicia -> /franchises/:id', new URL(page.url()).pathname)

await page.goto(`${BASE}/series`, { waitUntil: 'networkidle' })
await page.waitForSelector('article', { timeout: 20000 })
await page.waitForTimeout(800)
const seCardHref = await cardLinks().first().getAttribute('href')
check(/^\/series\/\d+$/.test(seCardHref), '/series card -> /series/:id', seCardHref)

// ------------------------------------------------------------------- search
requests.length = 0
await page.goto(`${BASE}/series`, { waitUntil: 'networkidle' })
await page.waitForSelector('article', { timeout: 20000 })
await page.waitForTimeout(800)
const before = await page.locator('article').count()

// Scoped by placeholder: the header also renders a search box, and taking the
// first input in the DOM typed into the wrong one.
const input = page.locator('input[placeholder*="Buscar Serie"]')
await input.click()
await input.pressSequentially('marv', { delay: 40 })
await page.waitForTimeout(2500)
const typedRequests = requests.filter((u) => u.includes('/api/catalog/series') && u.includes('search=')).length
check(typedRequests === 1, 'búsqueda con debounce: 1 request con search', `${typedRequests} requests`)
check(new URL(page.url()).searchParams.get('search') === 'marv', 'búsqueda escrita en la URL', page.url())
const afterSearch = await page.locator('article').count()
check(afterSearch > 0 && afterSearch <= before, 'búsqueda reinicia el listado', `${before} -> ${afterSearch} cards`)
// "marv" matches no series by name, so every hit came from the publisher OR.
const searchedPublishers = await pillLinks().evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute('title')))])
const searchedPublishersOnly = searchedPublishers.filter((t) => t.startsWith('Editorial: '))
check(
  searchedPublishersOnly.length > 0 && searchedPublishersOnly.every((t) => /marvel/i.test(t)),
  'búsqueda por nombre de editorial trae sus series',
  JSON.stringify(searchedPublishers),
)

// empty state
await input.fill('zzzzz-no-existe')
await page.waitForTimeout(2000)
check(await page.locator('h3:has-text("No se encontraron coincidencias")').isVisible(), 'estado vacío con búsqueda sin resultados')
await page.locator('button:has-text("Restablecer búsqueda")').click()
await page.waitForTimeout(1500)
check(new URL(page.url()).searchParams.get('search') === null, 'restablecer búsqueda limpia la URL', page.url())
check((await page.locator('article').count()) > 0, 'restablecer búsqueda repuebla el listado')

// ----------------------------------------------------------- infinite scroll
// The dev database holds fewer than one page of each entity, so a real scroll
// would never reach page 2. The endpoint is intercepted with the same contract
// (pageSize 24, totalCount 72, three pages) to exercise accumulation,
// deduplication and the stop condition against the real client code.
const TOTAL = 72
const PAGE = 24
const PAGES = TOTAL / PAGE
// Two ids repeated on purpose: page 2 re-serves id 0, page 3 re-serves id 24,
// so 74 items arrive for 72 distinct cards and the dedupe has to drop 2.
const SERVED_ITEMS = TOTAL + 2

const DUPLICATES = { 2: [0], 3: [24] }
const scrolled = await context.newPage()
const pageRequests = []
const consoleErrors = []
scrolled.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
await scrolled.route('**/api/catalog/series**', async (route) => {
  const url = new URL(route.request().url())
  const currentPage = Number(url.searchParams.get('currentPage') ?? 1)
  const pageSize = Number(url.searchParams.get('pageSize') ?? 24)
  pageRequests.push(currentPage)

  const count = currentPage <= PAGES ? pageSize : 0
  const start = (currentPage - 1) * pageSize
  const items = Array.from({ length: count }, (_, index) => ({
    id: start + index,
    name: `Serie ${start + index}`,
    color: '#38bdf8',
    urlImage: null,
    franchise: { id: 900 + currentPage, name: `Franquicia ${currentPage}`, color: '#f5c518' },
    publisher: { id: 800 + currentPage, name: `Editorial ${currentPage}`, color: '#ec1d24' },
  }))
  for (const duplicateId of DUPLICATES[currentPage] ?? []) {
    items.push({ ...items[0], id: duplicateId, name: `Serie ${duplicateId}` })
  }

  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      message: 'OK',
      code: 200,
      payload: {
        currentPage,
        hasNextPage: currentPage < PAGES,
        hasPriorPage: currentPage > 1,
        totalPages: PAGES,
        pageSize,
        nextPage: currentPage < PAGES ? currentPage + 1 : null,
        priorPage: currentPage > 1 ? currentPage - 1 : null,
        totalCount: TOTAL,
        items,
      },
    }),
  })
})

await scrolled.goto(`${BASE}/series`, { waitUntil: 'networkidle' })
await scrolled.waitForSelector('article', { timeout: 20000 })
await scrolled.waitForTimeout(700)
const page1Cards = await scrolled.locator('article').count()
check(page1Cards >= PAGE && page1Cards < TOTAL, 'infinite scroll: arranca con la primera página', `${page1Cards} cards`)

for (let i = 0; i < 8; i++) {
  await scrolled.mouse.wheel(0, 3000)
  await scrolled.waitForTimeout(450)
}
await scrolled.waitForTimeout(1200)

const accumulated = await scrolled.locator('article h3').allInnerTexts()
check(accumulated.length === TOTAL, 'infinite scroll acumula todas las páginas', `${accumulated.length} cards, esperado ${TOTAL}`)
check(SERVED_ITEMS > accumulated.length, 'infinite scroll dedupica los ids repetidos', `${SERVED_ITEMS} servidos -> ${accumulated.length} renderizados`)
check(new Set(accumulated).size === accumulated.length, 'infinite scroll sin duplicados', `${new Set(accumulated).size} únicos`)
check(pageRequests.length === PAGES, 'infinite scroll pide cada página una vez', JSON.stringify(pageRequests))
check(pageRequests.every((p, i) => i === 0 || p > pageRequests[i - 1]), 'infinite scroll sin páginas fuera de orden', JSON.stringify(pageRequests))
check(await scrolled.locator('p:has-text("Fin del listado")').isVisible(), 'infinite scroll detiene al terminar')
check((await scrolled.locator('p:has-text("Mostrando")').innerText()).includes(String(TOTAL)), 'conteo muestra el total del backend')

const requestsBeforeIdle = pageRequests.length
for (let i = 0; i < 6; i++) {
  await scrolled.mouse.wheel(0, 3000)
  await scrolled.waitForTimeout(350)
}
check(pageRequests.length === requestsBeforeIdle, 'sin requests extra al no haber más páginas', `${requestsBeforeIdle} -> ${pageRequests.length}`)
check(consoleErrors.length === 0, 'sin errores de consola (incluye claves React duplicadas)', JSON.stringify(consoleErrors.slice(0, 2)))
await scrolled.close()

// ------------------------------------------------------------- menu dropdown
// Exact match: /index also has an "Explorar todo el catálogo" button.
const menuButton = () => page.getByRole('button', { name: 'Catálogo', exact: true })

await page.goto(`${BASE}/index`, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
await menuButton().click()
await page.waitForTimeout(400)
const menuLinks = await page.locator('a:visible').evaluateAll((els) => els.map((e) => ({ t: e.textContent.trim(), h: e.getAttribute('href') })))
const enabled = menuLinks.filter((l) => ['/catalog', '/publishers', '/franchises', '/series', '/lists'].includes(l.h))
const disabled = await page.locator('span[aria-disabled]:visible').allInnerTexts()
check(enabled.length === 5, 'dropdown: 5 secciones navegables', JSON.stringify(enabled))
check(disabled.length === 3, 'dropdown: 3 secciones deshabilitadas', JSON.stringify(disabled))
const hasDivider = await page.locator('div.border-t.border-neps-border').first().isVisible()
check(hasDivider, 'dropdown: separador entre grupos')

// outside click closes it
await page.mouse.click(200, 600)
await page.waitForTimeout(400)
check((await page.locator('span[aria-disabled]:visible').count()) === 0, 'dropdown se cierra al hacer click fuera')

for (const [label, path] of [['Editoriales', '/publishers'], ['Franquicias', '/franchises'], ['Series', '/series']]) {
  await page.goto(`${BASE}/index`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await menuButton().click()
  await page.waitForTimeout(300)
  await page.locator(`a:has-text("${label}")`).first().click()
  await page.waitForURL(`**${path}`, { timeout: 15000 })
  await page.waitForTimeout(900)
  check(new URL(page.url()).pathname === path, `dropdown navega a ${label}`, new URL(page.url()).pathname)
  check((await page.locator('article').count()) > 0, `${label} lista cards al llegar desde el menú`)
}

// ------------------------------------------------------------------- mobile
// One page resized in place rather than a new one, to avoid tripping the
// refresh-token rate limit with a burst of session bootstraps.
await page.setViewportSize({ width: 390, height: 844 })
await page.goto(`${BASE}/index`, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
const burger = page.locator('button[aria-label="Menú de navegación"]')
check(await burger.isVisible(), 'mobile: hamburguesa visible')
check(!(await page.getByRole('button', { name: 'Catálogo', exact: true }).isVisible()), 'mobile: nav desktop oculta')
await burger.click()
await page.waitForTimeout(400)
const mLinks = await page.locator('a:visible').evaluateAll((els) => els.map((e) => e.getAttribute('href')))
const mDisabled = await page.locator('span[aria-disabled]:visible').allInnerTexts()
check(mLinks.includes('/series'), 'mobile: menú con las 4 secciones', JSON.stringify(mLinks))
check(mDisabled.length === 3, 'mobile: 3 secciones deshabilitadas')
await page.locator('a:has-text("Series")').first().click()
await page.waitForURL('**/series', { timeout: 15000 })
await page.waitForTimeout(900)
check(new URL(page.url()).pathname === '/series', 'mobile: navega a /series')
// The toggle stays on screen; what has to disappear is the panel it opens.
check((await page.locator('span[aria-disabled]:visible').count()) === 0, 'mobile: el menú se cierra al navegar')

// --------------------------------------------------------------- responsive
// The responsive sweep lives in qa-entity-responsive.mjs: it needs several full
// page loads and running it in the same minute as everything above trips the
// refresh-token rate limit (30/min), which lands the page on the login screen.

await browser.close()
log(failures === 0 ? '\nTODO VERDE' : `\n${failures} FALLAS`)
process.exit(failures === 0 ? 0 : 1)
