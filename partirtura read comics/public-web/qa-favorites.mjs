import { chromium } from 'playwright'

/**
 * QA of the favorites of the public web.
 *
 * Checks that the star is available in every listing that shows works, that
 * it never navigates, that it works with the keyboard, that the page
 * /favorites is the catalog with `isFavorite=true`, that removing a favorite
 * takes its card out of the results and that a failed request leaves the
 * state as it was.
 */

const BASE = 'http://localhost:5173'
const log = (...a) => console.log(...a)

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const pageErrors = []
const failedResponses = []
const favoriteCalls = []
const workQueries = []

page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)))
page.on('response', (r) => {
  if (r.status() >= 400) failedResponses.push(`${r.status()} ${r.url()}`)
  if (r.url().includes('/api/favorites/')) {
    favoriteCalls.push(`${r.request().method()} ${r.url().split('/api')[1]} ${r.status()}`)
  }
})
page.on('request', (r) => {
  if (r.url().includes('/api/works?')) workQueries.push(r.url().split('/api/works?')[1])
})

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
await page.fill('input[name="email"]', 'fede.piedrasanta@gmail.com')
await page.fill('input[name="password"]', 'CHANGE_ME_ADMIN_PASSWORD')
await page.click('button[type="submit"]')
await page.waitForURL(/\/index/, { timeout: 20000 })
log('login: ok')

const star = page.locator('button[aria-pressed]')

const styles = async (button) =>
  button.evaluate((el) => {
    const s = getComputedStyle(el)
    return { color: s.color, background: s.backgroundColor }
  })

async function countStars(path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  const count = await star.count()
  log(`  ${path}: ${count} estrellas`)
  return count
}

log('estrellas por pagina:')
await countStars('/index')
await countStars('/catalog')
await countStars('/publishers/5')
await countStars('/franchises/5')
await countStars('/series/7')
await countStars('/my-collection')
await countStars('/favorites')

// --- Alta y baja en el catalogo -------------------------------------------
await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)

const card = page.locator('article').first()
const workTitle = (await card.locator('h3').textContent())?.trim()
const button = card.locator('button[aria-pressed]')
const initialPressed = (await button.getAttribute('aria-pressed')) === 'true'
log(`obra de prueba: "${workTitle}" | favoriteada al inicio: ${initialPressed}`)

const styleBefore = await styles(button)
const urlBefore = page.url()
await button.click()
await page.waitForTimeout(2000)
const styleAfter = await styles(button)
log(`estilo inicial: ${JSON.stringify(styleBefore)} -> ${JSON.stringify(styleAfter)}`)
log(`la pagina no navego: ${page.url() === urlBefore ? 'ok' : 'FALLO'}`)

// --- La estrella con el teclado --------------------------------------------
await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
await star.first().focus()
const focusedLabel = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
await page.keyboard.press('Enter')
await page.waitForTimeout(2000)
const pressedAfterKeyboard = await star.first().getAttribute('aria-pressed')
log(`teclado: foco "${focusedLabel}" | aria-pressed tras Enter: ${pressedAfterKeyboard}`)

// --- La pagina /favorites ---------------------------------------------------
await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
const favoriteButton = page
  .locator('article')
  .filter({ hasText: workTitle ?? '' })
  .first()
  .locator('button[aria-pressed]')
if ((await favoriteButton.getAttribute('aria-pressed')) === 'false') {
  await favoriteButton.click()
  await page.waitForTimeout(2000)
}

await page.goto(`${BASE}/favorites`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
log(`/favorites -> ${(await page.locator('text=/Mostrando/').first().textContent())?.trim()}`)

const cardsBefore = await page.locator('article').count()
if (cardsBefore > 0) {
  const removedTitle = (await page.locator('article h3').first().textContent())?.trim()
  await star.first().click()
  await page.waitForTimeout(2500)
  const cardsAfter = await page.locator('article').count()
  const countAfter = await page.locator('text=/Mostrando/').first().textContent()
  log(`quitar "${removedTitle}" en /favorites: tarjetas ${cardsBefore} -> ${cardsAfter} | ${countAfter?.trim()}`)

  await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  const sameCard = page.locator('article').filter({ hasText: removedTitle ?? '' }).first()
  const pressedInCatalog = await sameCard.locator('button[aria-pressed]').getAttribute('aria-pressed')
  log(`en el catalogo "${removedTitle}" sigue favouriteada: ${pressedInCatalog}`)

  await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  const restoreButton = page
    .locator('article')
    .filter({ hasText: removedTitle ?? '' })
    .first()
    .locator('button[aria-pressed]')
  if ((await restoreButton.getAttribute('aria-pressed')) === 'false') {
    await restoreButton.click()
    await page.waitForTimeout(2000)
    log(`restaurado: "${removedTitle}" vuelve a estar favouriteada`)
  }
} else {
  log('/favorites sin resultados: no hay nada que quitar')
}

// --- La consulta de /favorites ---------------------------------------------
await page.goto(`${BASE}/favorites`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
await page.fill('input[placeholder*="Buscar por título"]', 'zzz-no-existe-zzz')
await page.waitForTimeout(2500)
log(`consulta de /favorites con busqueda: ${workQueries[workQueries.length - 1]}`)
log(`estado vacio de /favorites: ${(await page.locator('text=/No hay obras favoritas/').count()) > 0 ? 'ok' : 'no aparece'}`)

// --- Scroll infinito --------------------------------------------------------
await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
const firstPageCount = await page.locator('article').count()
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(2500)
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(2500)
log(`scroll infinito en /catalog: ${firstPageCount} -> ${await page.locator('article').count()} tarjetas`)

// --- Error de la API --------------------------------------------------------
await page.route('**/api/favorites/*', (route) =>
  route.fulfill({
    status: 500,
    contentType: 'application/json',
    body: JSON.stringify({ success: false, message: 'Error de prueba', code: 500, payload: null }),
  }),
)

await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
const errorButton = star.first()
const pressedBeforeError = await errorButton.getAttribute('aria-pressed')
await errorButton.click()
await page.waitForTimeout(2000)
const pressedAfterError = await errorButton.getAttribute('aria-pressed')
const errorMessage = await page.locator('[role="alert"]').first().textContent()
log(`error de API: estado ${pressedBeforeError} -> ${pressedAfterError} | mensaje: "${errorMessage?.trim()}"`)
await page.unroute('**/api/favorites/*')

// --- Restaurar el estado original ------------------------------------------
await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
const probeButton = page
  .locator('article')
  .filter({ hasText: workTitle ?? '' })
  .first()
  .locator('button[aria-pressed]')
const pressedNow = (await probeButton.getAttribute('aria-pressed')) === 'true'
if (pressedNow !== initialPressed) {
  await probeButton.click()
  await page.waitForTimeout(2000)
  log(`estado original restaurado en "${workTitle}": favoriteada ${pressedNow} -> ${initialPressed}`)
}

log(`llamadas a /api/favorites: ${JSON.stringify(favoriteCalls)}`)
log(`respuestas con error: ${failedResponses.length === 0 ? 'ninguna' : JSON.stringify([...new Set(failedResponses)].slice(0, 8))}`)
log(`errores de pagina: ${pageErrors.length === 0 ? 'ninguno' : JSON.stringify(pageErrors.slice(0, 5))}`)

await browser.close()
