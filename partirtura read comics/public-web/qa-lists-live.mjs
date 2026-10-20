import { chromium } from 'playwright'

/**
 * QA of the in-place update of a personal list.
 *
 * Removing a work or changing its place must not reload the page, must not
 * empty the screen while the backend answers, and must show the confirmed
 * state.
 */

const BASE = 'http://localhost:5173'
const log = (...a) => console.log(...a)

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const pageErrors = []
let fullReloads = 0

page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 200)))
page.on('load', () => {
  fullReloads += 1
})

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
await page.fill('input[name="email"]', 'fede.piedrasanta@gmail.com')
await page.fill('input[name="password"]', 'CHANGE_ME_ADMIN_PASSWORD')
await page.click('button[type="submit"]')
await page.waitForURL(/\/index/, { timeout: 20000 })

const token = await page.evaluate(async () => {
  const res = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fede.piedrasanta@gmail.com', password: 'CHANGE_ME_ADMIN_PASSWORD' }),
  })
  return (await res.json()).payload.accessToken
})
const auth = { Authorization: `Bearer ${token}` }
const api = `${BASE}/api`

const created = await (await page.request.post(`${api}/users/me/lists`, { headers: auth, data: { name: 'QA En vivo' } })).json()
const listId = created.payload.id
const works = await (await page.request.get(`${api}/works?pageSize=3`, { headers: auth })).json()
for (const work of works.payload.items) {
  await page.request.post(`${api}/users/me/lists/${listId}/works`, { headers: auth, data: { workId: work.id } })
}

await page.goto(`${BASE}/lists/${listId}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
const reloadsBefore = fullReloads

// --- Quitar una obra: la fila desaparece sin vaciar la pantalla -------------
const titleBefore = await page.locator('h1').first().textContent()
const worksBefore = await page.locator('article h3').count()
await page.locator('button[aria-label^="Quitar"]').first().click()

// Durante la operacion el encabezado y las filas siguen en pantalla.
let titleVisibleDuring = true
let worksDuring = worksBefore
for (let i = 0; i < 12; i += 1) {
  await page.waitForTimeout(60)
  if (!(await page.locator('h1').first().isVisible())) titleVisibleDuring = false
  const current = await page.locator('article h3').count()
  if (current < worksDuring) worksDuring = current
}
await page.waitForTimeout(1500)
const worksAfter = await page.locator('article h3').count()

log(`quitar obra: ${worksBefore} -> ${worksAfter} obras`)
log(`el encabezado sigue visible durante la operacion: ${titleVisibleDuring}`)
log(`el encabezado no cambio: ${(await page.locator('h1').first().textContent()) === titleBefore}`)
log(`la pantalla nunca quedo vacia: ${worksDuring > 0}`)
log(`solo desaparecio la obra quitada: ${worksDuring === worksBefore - 1}`)

// --- Reordenar: el orden cambia en el lugar ---------------------------------
const orderBefore = (await page.locator('article h3').allTextContents()).map((t) => t.trim())
await page.locator('button[aria-label^="Subir"]').nth(1).click()
let orderDuring = orderBefore
let rowsDuring = orderBefore.length
for (let i = 0; i < 12; i += 1) {
  await page.waitForTimeout(60)
  const current = (await page.locator('article h3').allTextContents()).map((t) => t.trim())
  if (current.join('|') !== orderDuring.join('|')) orderDuring = current
  rowsDuring = Math.min(rowsDuring, current.length)
}
await page.waitForTimeout(1500)
const orderAfter = (await page.locator('article h3').allTextContents()).map((t) => t.trim())

log(`reordenar: ${orderBefore.join(' | ')} -> ${orderAfter.join(' | ')}`)
log(`el orden cambio al instante: ${orderDuring.join('|') !== orderBefore.join('|')}`)
log(`las filas nunca desaparecieron: ${rowsDuring === orderBefore.length}`)

log(`recargas de pagina: ${fullReloads - reloadsBefore} (debe ser 0)`)
log(`errores de pagina: ${pageErrors.length === 0 ? 'ninguno' : JSON.stringify(pageErrors.slice(0, 4))}`)

await page.request.delete(`${api}/users/me/lists/${listId}`, { headers: auth })
await browser.close()
