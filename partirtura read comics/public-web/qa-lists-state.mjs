import { chromium } from 'playwright'

/**
 * QA of the state of a personal list when it is changed from another screen.
 *
 * Reproduces the reported flow: create a list, add works, remove them all
 * from the list, add another work from the catalog, and go back to the list.
 * The list must show what the backend has, without a reload.
 */

const BASE = 'http://localhost:5173'
const log = (...a) => console.log(...a)

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 200)))

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

// --- Una lista con tres obras ----------------------------------------------
const created = await (await page.request.post(`${api}/users/me/lists`, { headers: auth, data: { name: 'QA Estado' } })).json()
const listId = created.payload.id
const works = await (await page.request.get(`${api}/works?pageSize=3`, { headers: auth })).json()
for (const work of works.payload.items) {
  await page.request.post(`${api}/users/me/lists/${listId}/works`, { headers: auth, data: { workId: work.id } })
}
const otherWork = (await (await page.request.get(`${api}/works?pageSize=6`, { headers: auth })).json()).payload.items[4]

// --- Entrar al detalle y borrar todas las obras ----------------------------
await page.goto(`${BASE}/lists/${listId}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
log(`detalle inicial: ${await page.locator('article h3').count()} obras`)
while ((await page.locator('button[aria-label^="Quitar"]').count()) > 0) {
  await page.locator('button[aria-label^="Quitar"]').first().click()
  await page.waitForTimeout(1800)
}
log(`detalle sin obras: ${await page.locator('article h3').count()} obras`)

// --- Agregar otra obra desde el catalogo ------------------------------------
await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
const otherCard = page.locator('article').filter({ hasText: otherWork.title }).first()
await otherCard.locator('button[aria-label^="Administrar las listas"]').click()
await page.waitForTimeout(1500)
const dialog = page.locator('[role="dialog"]')
const row = dialog.locator('text=QA Estado').locator('xpath=ancestor::div[contains(@class,"rounded-xl")]')
await row.locator('input[type="checkbox"]').click()
await page.waitForTimeout(2000)
log(`obra agregada desde el catalogo: ${otherWork.title}`)
await page.keyboard.press('Escape')
await page.waitForTimeout(600)

// --- Volver a la lista: debe mostrarla sin recargar ------------------------
await page.goto(`${BASE}/lists/${listId}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
const titles = (await page.locator('article h3').allTextContents()).map((t) => t.trim())
log(`volviendo a la lista (sin F5): ${titles.length} obras -> ${titles.join(' | ')}`)
log(`la obra agregada aparece: ${titles.includes(otherWork.title.trim())}`)

await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
const titlesAfterReload = (await page.locator('article h3').allTextContents()).map((t) => t.trim())
log(`con F5: ${titlesAfterReload.length} obras -> ${titlesAfterReload.join(' | ')}`)
log(`el estado con y sin recarga es el mismo: ${titles.join('|') === titlesAfterReload.join('|')}`)

log(`errores de pagina: ${pageErrors.length === 0 ? 'ninguno' : JSON.stringify(pageErrors.slice(0, 4))}`)

await page.request.delete(`${api}/users/me/lists/${listId}`, { headers: auth })
await browser.close()
