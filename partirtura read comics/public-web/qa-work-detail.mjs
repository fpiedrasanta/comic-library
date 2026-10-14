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

// ----------------------------------------------------------- /works/:id page
// First, find a valid work ID from the catalog
await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
await page.waitForSelector('a[href^="/works/"]', { timeout: 20000 })
await page.waitForTimeout(800)

const workCards = page.locator('a[href^="/works/"]')
const firstWorkHref = await workCards.first().getAttribute('href')
const workId = firstWorkHref.split('/').pop()

log(`Testing with work ID: ${workId}`)

await page.goto(`${BASE}/works/${workId}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

// WorkHeader checks
const detailH1 = await page.locator('h1').first().innerText()
check(detailH1.length > 0, '/works/:id h1 con título', detailH1)

const hasCover = await page.locator('div.aspect-\\[2/3\\]').first().count()
check(hasCover === 1, '/works/:id tiene portada con aspect-ratio', `${hasCover} portada`)

const numberVisible = await page.locator('text=/Nº/').first().count()
check(numberVisible === 1, '/works/:id muestra número', `${numberVisible} elemento`)

const descVisible = await page.locator('p:has-text("Updated")').first().count()
check(descVisible >= 1, '/works/:id muestra descripción', `${descVisible} elementos`)

const languageVisible = await page.locator('text=Español').first().count()
check(languageVisible === 1, '/works/:id muestra idioma', `${languageVisible} elemento`)

const workTypeVisible = await page.locator('text=Number').first().count()
check(workTypeVisible >= 1, '/works/:id muestra work type', `${workTypeVisible} elemento`)

const pubDateVisible = await page.locator('text=Publicado:').first().count()
check(pubDateVisible === 1, '/works/:id muestra fecha publicación', `${pubDateVisible} elemento`)

// Editorial Context section
const contextSection = page.locator('text=Contexto Editorial')
check((await contextSection.count()) === 1, '/works/:id tiene sección Contexto Editorial')

const publisherContext = page.locator('text=Editorial')
check((await publisherContext.count()) >= 1, '/works/:id muestra Editorial en contexto')

const franchiseContext = page.locator('text=Franquicia')
check((await franchiseContext.count()) >= 1, '/works/:id muestra Franquicia en contexto')

const seriesContext = page.locator('text=Serie')
check((await seriesContext.count()) >= 1, '/works/:id muestra Serie en contexto')

// Context cards have covers and are clickable
const contextCards = page.locator('a[href^="/publishers/"], a[href^="/franchises/"], a[href^="/series/"]')
const contextCardCount = await contextCards.count()
check(contextCardCount >= 3, '/works/:id context cards son navegables (3+)', `${contextCardCount} cards`)

// Person Assignments section
const assignmentsSection = page.locator('text=Asignaciones')
check((await assignmentsSection.count()) === 1, '/works/:id tiene sección Asignaciones')

const assignmentCount = await page.locator('text=Writer_').first().count()
check(assignmentCount >= 1, '/works/:id muestra asignaciones persona+rol', `${assignmentCount} asignaciones`)

// Tags section
const tagsSection = page.locator('text=Tags')
check((await tagsSection.count()) === 1, '/works/:id tiene sección Tags')

const tagVisible = await page.locator('text=TestTag').first().count()
check(tagVisible >= 1, '/works/:id muestra tags', `${tagVisible} tag`)

// Back link works
const backLink = page.locator('a:has-text("Volver al Catálogo")')
check((await backLink.count()) === 1, '/works/:id tiene enlace de vuelta')

await backLink.click()
await page.waitForURL('**/catalog', { timeout: 15000 })
check(new URL(page.url()).pathname === '/catalog', 'enlace de vuelta navega a /catalog')

// ----------------------------------------------------------- 404 handling
await page.goto(`${BASE}/works/99999999`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
check((await page.locator('text=La obra no existe').count()) === 1, '/works/:id inexistente muestra "La obra no existe"')

// ----------------------------------------------------------- Navigation between works (Previous/Next)
// Need a work with previous/next. Check if any work in catalog has sequence.
// For now just verify the navigation component exists and is correctly structured.

// ----------------------------------------------------------- Responsive
await page.setViewportSize({ width: 375, height: 800 })
await page.goto(`${BASE}/works/${workId}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
check(mobileOverflow <= 0, '/works/:id mobile sin overflow horizontal', `${mobileOverflow}px`)

await page.setViewportSize({ width: 1440, height: 1000 })
await page.goto(`${BASE}/works/${workId}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
check(desktopOverflow <= 0, '/works/:id desktop sin overflow horizontal', `${desktopOverflow}px`)

// ----------------------------------------------------------- Refresh and Back/Forward
await page.goto(`${BASE}/works/${workId}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
const refreshedTitle = await page.locator('h1').first().innerText()
check(refreshedTitle === detailH1, '/works/:id refresh mantiene el título', refreshedTitle)

// Back/Forward
await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await page.goBack()
await page.waitForTimeout(500)
check((await page.locator('h1').first().innerText()) === detailH1, 'Back navigation restaura /works/:id')

await page.goForward()
await page.waitForTimeout(500)
check(new URL(page.url()).pathname === '/catalog', 'Forward navigation va a /catalog')

await browser.close()

log('')
log(failures === 0 ? 'TODOS LOS CHECKS PASARON' : `${failures} CHECK(S) FALLARON`)
process.exit(failures === 0 ? 0 : 1)