import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const API = 'http://localhost:5131'
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

await page.request.post(`${API}/api/users/login`, { data: login })
await page.goto(`${BASE}/index`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)

const requests = []
page.on('request', (r) => {
  if (r.url().includes('/api/catalog/lists')) requests.push(r.url().replace(/^https?:\/\/[^/]+/, ''))
})

// ------------------------------------------------------- menu: Listas enabled
const catalogButtonSelector = 'button[aria-haspopup="true"]'

await page.goto(`${BASE}/index`, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
await page.locator(catalogButtonSelector).click()
await page.waitForTimeout(300)
const listasLink = page.locator('a:has-text("Listas")')
check((await listasLink.count()) === 1, 'menú Catálogo tiene Listas habilitado')
const listasHref = await listasLink.first().getAttribute('href')
check(listasHref === '/lists', 'Listas apunta a /lists', listasHref)
await listasLink.first().click()
await page.waitForURL('**/lists', { timeout: 15000 })
await page.waitForTimeout(1000)
check(new URL(page.url()).pathname === '/lists', 'click en Listas navega a /lists')

// --------------------------------------------------------------- /lists page
await page.goto(`${BASE}/lists`, { waitUntil: 'networkidle' })
await page.waitForSelector('a[href^="/lists/"]', { timeout: 20000 })
await page.waitForTimeout(800)

const h1 = await page.locator('h1').innerText()
check(h1 === 'Listas de Lectura', '/lists h1', h1)

const countLine = await page.locator('p:has-text("listas encontradas")').innerText()
check(/Mostrando\s+\d+/.test(countLine), '/lists muestra el conteo', countLine)

const cards = page.locator('a[href^="/lists/"]')
const cardCount = await cards.count()
check(cardCount > 0, '/lists renderiza cards', `${cardCount} cards`)

const firstCard = cards.first()
const firstCardText = await firstCard.innerText()
check(/origenes/i.test(firstCardText), '/lists card muestra el tipo de lista', firstCardText.split('\n')[0])
check(/Origenes/.test(firstCardText), '/lists card muestra el nombre')
check(/obras/.test(firstCardText), '/lists card muestra la cantidad de obras', firstCardText)

// The description must not appear on the card.
const descriptionProbe = await page
  .locator('a[href^="/lists/"]')
  .first()
  .innerText()
check(!/guía definitiva|preludios|Hickman/i.test(descriptionProbe), '/lists card NO muestra la descripción')

const firstCardHref = await firstCard.getAttribute('href')
check(/^\/lists\/\d+$/.test(firstCardHref), '/lists card enlaza a /lists/:id', firstCardHref)

// ------------------------------------------------------- search with debounce
requests.length = 0
const searchInput = page.locator('input[placeholder*="Buscar listas"]')
await searchInput.click()
await searchInput.pressSequentially('messiah', { delay: 40 })
await page.waitForTimeout(2500)
const searchRequests = requests.filter((u) => u.includes('search='))
check(searchRequests.length === 1, 'búsqueda con debounce: 1 request con search=', `${searchRequests.length} requests`)
check(new URL(page.url()).searchParams.get('search') === 'messiah', 'búsqueda escrita en la URL', page.url())
check((await page.locator('a[href^="/lists/"]').count()) > 0, 'búsqueda "messiah" mantiene resultados')

// ------------------------------------------------------------- empty + clear
await searchInput.click()
await searchInput.fill('')
await searchInput.pressSequentially('zzz', { delay: 40 })
await page.waitForTimeout(2500)
check((await page.locator('text=No se encontraron listas').count()) === 1, 'búsqueda sin resultados muestra el empty state')
const clearBtn = page.locator('button:has-text("Limpiar filtros y búsqueda")')
check((await clearBtn.count()) === 1, 'empty state ofrece limpiar filtros')
await clearBtn.click()
await page.waitForTimeout(1500)
check(new URL(page.url()).searchParams.get('search') === null, 'limpiar borra la búsqueda de la URL', page.url())
check((await page.locator('a[href^="/lists/"]').count()) > 0, 'limpiar restaura el listado')

// ------------------------------------------------------- editorial filter
requests.length = 0
// The Editorial autocomplete is the first EntityAutocomplete in the filter panel.
const editorialInput = page.locator('input[placeholder="Buscar editorial..."]')
await editorialInput.click()
await editorialInput.pressSequentially('marv', { delay: 40 })
await page.waitForTimeout(1500)
const option = page.locator('div[role="option"]:has-text("Marvel Comics")').first()
check((await option.count()) === 1, 'autocomplete de Editorial ofrece opciones backend-driven')
await option.click()
await page.waitForTimeout(1500)
check(new URL(page.url()).searchParams.get('idPublisher') != null, 'selección de Editorial escribe idPublisher en la URL', page.url())
const filteredRequests = requests.filter((u) => u.includes('publisherId='))
check(filteredRequests.length >= 1, 'el request lleva publisherId', filteredRequests[0] ?? 'ninguno')
check((await page.locator('a[href^="/lists/"]').count()) > 0, 'el filtro por Editorial mantiene la lista que contiene esa editorial')

// clear the publisher filter via the X on the label
await page.locator('button[title="Limpiar"]').first().click()
await page.waitForTimeout(1200)
check(new URL(page.url()).searchParams.get('idPublisher') === null, 'limpiar Editorial borra idPublisher', page.url())

// ------------------------------------------------------- list type filter
const listTypeInput = page.locator('input[placeholder="Buscar tipo de lista..."]')
await listTypeInput.click()
await page.waitForTimeout(800)
const typeOption = page.locator('div[role="option"]:has-text("Crossover")').first()
check((await typeOption.count()) === 1, 'autocomplete de Tipo de Lista ofrece los tipos vistos en las cards')
await typeOption.click()
await page.waitForTimeout(1200)
check(new URL(page.url()).searchParams.get('listTypeId') != null, 'selección de Tipo de Lista escribe listTypeId en la URL', page.url())
const typeRequests = requests.filter((u) => u.includes('listTypeId='))
check(typeRequests.length >= 1, 'el request lleva listTypeId', typeRequests[0] ?? 'ninguno')

// --------------------------------------------------------------- /lists/:id
// Use list 1 (Messiah Complex) which has the expected test data:
// 13 works, numbered works, series, publisher/franchise/series colors.
const testListId = 1
const firstListId = testListId
await page.goto(`${BASE}/lists/${firstListId}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)

const detailH1 = await page.locator('h1').innerText()
check(detailH1 === 'Messiah Complex', '/lists/:id h1 con el nombre', detailH1)
check((await page.locator('text=Crossover').count()) >= 1, '/lists/:id muestra el tipo de lista')
check((await page.locator('text=13 obras').count()) >= 1, '/lists/:id muestra la cantidad de obras')

// The stored list has no description, so the header omits it.
// The description itself is verified against a synthetic payload below.

// The description renders when the list carries one.
const loginJson = await page.request.post(`${API}/api/users/login`, { data: login }).then((r) => r.json())
const realDetail = await page.request
  .get(`${API}/api/catalog/lists/${testListId}`, {
    headers: { Authorization: `Bearer ${loginJson.payload.accessToken}` },
  })
  .then((r) => r.json())
await page.route('**/api/catalog/lists/' + testListId, (route) =>
  route.fulfill({
    json: {
      success: true,
      message: 'OK',
      code: 200,
      payload: {
        ...realDetail.payload,
        description: 'Guía sintética de lectura para verificar la descripción.',
      },
    },
  }),
)
await page.goto(`${BASE}/lists/${testListId}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
const detailWithDescription = await page.locator('main').innerText()
check(/Guía sintética de lectura/.test(detailWithDescription), '/lists/:id muestra la descripción cuando la tiene')
await page.unroute('**/api/catalog/lists/' + testListId)

const worksHeading = page.locator('h2:has-text("Obras de la Lista")')
check((await worksHeading.count()) === 1, '/lists/:id sección de obras con título')
check((await page.locator('text=Orden Secuencial').count()) === 1, '/lists/:id muestra la insignia de orden secuencial')

// WorkCards: the section scoped by its heading, so the cover of the
// header itself is not counted. Work cards have the aspect div.
const worksSection = page.locator('section', { has: page.locator('h2:has-text("Obras de la Lista")') })
const workCards = worksSection.locator('div[class*="aspect-[2/3]"]')
const workCount = await workCards.count()
check(workCount === 13, '/lists/:id renderiza las 13 obras con WorkCard', `${workCount} cards`)

// The first work of the list (position 0) renders first.
const firstWorkRoot = workCards.first().locator('..')
const firstWorkTitle = await firstWorkRoot.locator('h3').first().innerText().catch(() => '')
check(/Messiah Complex: Capitulo uno/.test(firstWorkTitle), '/lists/:id respeta el orden de la lista (primera obra)', firstWorkTitle)

// The second work carries a number and a series, so the
// card shows the number and the pills carry their colors.
const secondWorkRoot = workCards.nth(1).locator('..')
const secondWorkText = await secondWorkRoot.innerText().catch(() => '')
check(/REGULAR - 0492/.test(secondWorkText), '/lists/:id WorkCard muestra el número de la obra', secondWorkText.split('\n')[0])
check(/SUBIDO[\s\S]*?\d{1,2}\/\d{1,2}\/\d{4}/.test(secondWorkText), '/lists/:id WorkCard muestra la fecha de subida')

// The pills carry the entity color as their background.
const publisherPillStyle = await secondWorkRoot.locator('button[title^="Editorial:"]').first().getAttribute('style').catch(() => '')
check(/245,\s*27,\s*0/.test(publisherPillStyle ?? ''), 'pill de Editorial con el color de la entidad', (publisherPillStyle ?? '').slice(0, 80))
const franchisePillStyle = await secondWorkRoot.locator('button[title^="Franquicia:"]').first().getAttribute('style').catch(() => '')
check(/153,\s*14,\s*20/.test(franchisePillStyle ?? ''), 'pill de Franquicia con el color de la entidad', (franchisePillStyle ?? '').slice(0, 80))
const seriesPillStyle = await secondWorkRoot.locator('button[title^="Serie:"]').first().getAttribute('style').catch(() => '')
check(/224,\s*157,\s*11/.test(seriesPillStyle ?? ''), 'pill de Serie con el color de la entidad', (seriesPillStyle ?? '').slice(0, 80))

// The work card pills navigate to the entity pages.
const publisherPill = page.locator('button[title^="Editorial:"]').first()
check((await publisherPill.count()) === 1, '/lists/:id WorkCard con pill de Editorial')
await publisherPill.click()
await page.waitForURL('**/publishers/*', { timeout: 15000 })
await page.waitForTimeout(1000)
check(/\/publishers\/\d+$/.test(new URL(page.url()).pathname), 'pill de Editorial de una obra navega a /publishers/:id', new URL(page.url()).pathname)

// No work filters on the detail page.
await page.goto(`${BASE}/lists/${firstListId}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
check((await page.locator('input[placeholder="Buscar editorial..."]').count()) === 0, '/lists/:id sin filtro de Editorial')
check((await page.locator('input[placeholder="Buscar listas"]').count()) === 0, '/lists/:id sin búsqueda de listas')
check((await page.locator('button:has-text("Limpiar filtros y búsqueda")').count()) === 0, '/lists/:id sin controles de filtro')

// Back link returns to /lists.
const backLink = page.locator('a:has-text("Volver a Exploración de Listas")')
check((await backLink.count()) === 1, '/lists/:id tiene enlace de vuelta')
await backLink.click()
await page.waitForURL('**/lists', { timeout: 15000 })
check(new URL(page.url()).pathname === '/lists', 'enlace de vuelta navega a /lists')

// ------------------------------------------------------------- 404 handling
await page.goto(`${BASE}/lists/99999999`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
check((await page.locator('text=La lista no existe').count()) === 1, '/lists/:id inexistente muestra "La lista no existe"')

// --------------------------------------------- infinite scroll (synthetic pages)
const syntheticLists = (pageNum) => ({
  success: true,
  message: 'OK',
  code: 200,
  payload: {
    currentPage: pageNum,
    hasNextPage: pageNum < 3,
    hasPriorPage: pageNum > 1,
    totalPages: 3,
    pageSize: 24,
    nextPage: pageNum < 3 ? pageNum + 1 : null,
    priorPage: pageNum > 1 ? pageNum - 1 : null,
    totalCount: 72,
    items: Array.from({ length: 24 }, (_, i) => ({
      id: (pageNum - 1) * 24 + i + 1000,
      name: `Lista sintética ${(pageNum - 1) * 24 + i + 1}`,
      listTypeId: 2,
      listTypeName: 'Sintética',
      color: null,
      urlCover: null,
      workCount: (pageNum - 1) * 24 + i + 1,
    })),
  },
})

let servedPages = []
await page.route('**/api/catalog/lists**', (route) => {
  const url = new URL(route.request().url())
  const currentPage = Number(url.searchParams.get('currentPage') ?? '1')
  servedPages.push(currentPage)
  return route.fulfill({ json: syntheticLists(currentPage) })
})

await page.goto(`${BASE}/lists`, { waitUntil: 'networkidle' })
await page.waitForSelector('a[href^="/lists/"]', { timeout: 20000 })
await page.waitForTimeout(800)
check((await page.locator('a[href^="/lists/"]').count()) === 24, 'scroll infinito: primera página de 24', `${await page.locator('a[href^="/lists/"]').count()} cards`)

// Scroll to the sentinel to trigger the next pages.
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(1500)
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(1500)
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(2000)

const syntheticCards = await page.locator('a[href^="/lists/"]').count()
const syntheticHrefs = await page.locator('a[href^="/lists/"]').evaluateAll((els) => els.map((e) => e.getAttribute('href')))
const uniqueHrefs = new Set(syntheticHrefs)
check(syntheticCards === 72, 'scroll infinito: acumula las 3 páginas (72 cards)', `${syntheticCards} cards`)
check(uniqueHrefs.size === syntheticCards, 'scroll infinito: sin duplicados', `${uniqueHrefs.size} únicos de ${syntheticCards}`)
check(JSON.stringify(servedPages) === JSON.stringify([1, 2, 3]), 'scroll infinito: solicita páginas 1, 2 y 3 una vez', JSON.stringify(servedPages))
check((await page.locator('text=Fin del listado.').count()) === 1, 'scroll infinito: muestra el fin del listado')

await page.unroute('**/api/catalog/lists**')

// ------------------------------------------------------------------ responsive
await page.setViewportSize({ width: 375, height: 800 })
await page.goto(`${BASE}/lists`, { waitUntil: 'networkidle' })
await page.waitForSelector('a[href^="/lists/"]', { timeout: 20000 })
await page.waitForTimeout(800)
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
check(overflow <= 0, '/lists mobile sin overflow horizontal', `${overflow}px`)
const gridCols = await page
  .locator('a[href^="/lists/"]')
  .first()
  .evaluate((el) => getComputedStyle(el.parentElement).gridTemplateColumns)
check(gridCols.split(' ').length === 2, '/lists mobile: grilla de 2 columnas', gridCols)

await page.goto(`${BASE}/lists/1`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
check(mobileOverflow <= 0, '/lists/:id mobile sin overflow horizontal', `${mobileOverflow}px`)

// Mobile menu offers Listas.
await page.setViewportSize({ width: 375, height: 800 })
await page.goto(`${BASE}/index`, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
await page.locator('button[aria-label="Menú de navegación"]').click()
await page.waitForTimeout(300)
const mobileListas = page.locator('a:has-text("Listas")')
check((await mobileListas.count()) === 1, 'menú móvil tiene Listas')
await mobileListas.first().click()
await page.waitForURL('**/lists', { timeout: 15000 })
check(new URL(page.url()).pathname === '/lists', 'menú móvil navega a /lists')

// Menu active state on /lists.
await page.setViewportSize({ width: 1440, height: 1000 })
await page.goto(`${BASE}/lists`, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
const catalogButton = page.locator(catalogButtonSelector)
const catalogButtonClass = await catalogButton.getAttribute('class')
check(/text-neps-primary/.test(catalogButtonClass), 'Catálogo activo estando en /lists')

await browser.close()

log('')
log(failures === 0 ? 'TODOS LOS CHECKS PASARON' : `${failures} CHECK(S) FALLARON`)
process.exit(failures === 0 ? 0 : 1)
