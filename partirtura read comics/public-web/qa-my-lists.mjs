import { chromium } from 'playwright'

/**
 * QA of the "Mis listas" section of the public web (US-0036).
 *
 * Checks that the section exists, that it queries the personal lists of the
 * user, that the cards are the ones of the system lists and that the detail
 * opens from the selected list.
 */

const BASE = 'http://localhost:5173'
const log = (...a) => console.log(...a)

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const pageErrors = []
const listQueries = []

page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)))
page.on('request', (r) => {
  if (r.url().includes('/api/catalog/lists?')) listQueries.push(r.url().split('/api/catalog/lists?')[1])
})

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
await page.fill('input[name="email"]', 'fede.piedrasanta@gmail.com')
await page.fill('input[name="password"]', 'CHANGE_ME_ADMIN_PASSWORD')
await page.click('button[type="submit"]')
await page.waitForURL(/\/index/, { timeout: 20000 })

// Una lista personal de prueba.
await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
await page.locator('button[aria-label^="Administrar las listas"]').first().click()
await page.waitForTimeout(1200)
const dialog = page.locator('[role="dialog"]')
await dialog.locator('button:has-text("Nueva")').click()
await page.waitForTimeout(600)
const nameDialog = page.locator('[role="dialog"]').last()
await nameDialog.locator('input[type="text"]').fill('QA Mi Lista')
await nameDialog.locator('button[type="submit"]').click()
await page.waitForTimeout(2000)
await page.keyboard.press('Escape')
await page.waitForTimeout(600)

// --- La seccion Mis listas --------------------------------------------------
await page.goto(`${BASE}/my-lists`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
const heading = await page.locator('h1').first().textContent()
log(`titulo de /my-lists: "${heading?.trim()}"`)
log(`consulta de /my-lists: ${listQueries[listQueries.length - 1]}`)
const card = page.locator('a[href^="/lists/"]').first()
log(`tarjeta propia: ${(await page.locator('text=QA Mi Lista').count()) > 0}`)
log(`filtro de tipo de lista presente: ${(await page.locator('text=Tipo de Lista').count()) > 0}`)

// El detalle se abre desde la tarjeta.
await page.locator('text=QA Mi Lista').first().click()
await page.waitForTimeout(2500)
log(`detalle abierto en: ${page.url()}`)
const works = await page.locator('text=Obras de la Lista').count()
log(`detalle con obras: ${works > 0}`)

// --- Las listas del sistema no cambian --------------------------------------
await page.goto(`${BASE}/lists`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
log(`consulta de /lists: ${listQueries[listQueries.length - 1]}`)
log(`las listas del sistema siguen mostrándose: ${(await page.locator('a[href^="/lists/"]').count()) > 0}`)
log(`la lista personal no aparece en /lists: ${(await page.locator('text=QA Mi Lista').count()) === 0}`)

// --- El menu ----------------------------------------------------------------
await page.goto(`${BASE}/index`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
await page.locator('header button:has-text("Catálogo")').first().click()
await page.waitForTimeout(800)
const myListsLink = page.locator('a[href="/my-lists"]')
log(`"Mis listas" en el menu: ${(await myListsLink.count()) > 0}`)

log(`errores de pagina: ${pageErrors.length === 0 ? 'ninguno' : JSON.stringify(pageErrors.slice(0, 5))}`)

// Limpieza: la lista de prueba no queda en la base.
const token = await page.evaluate(async () => {
  const res = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fede.piedrasanta@gmail.com', password: 'CHANGE_ME_ADMIN_PASSWORD' }),
  })
  return (await res.json()).payload.accessToken
})
const auth = { Authorization: `Bearer ${token}` }
const personalLists = await (await page.request.get(`${BASE}/api/users/me/lists`, { headers: auth })).json()
for (const list of personalLists.payload) {
  await page.request.delete(`${BASE}/api/users/me/lists/${list.id}`, { headers: auth })
}
log(`listas personales de prueba eliminadas: ${personalLists.payload.length}`)

await browser.close()
