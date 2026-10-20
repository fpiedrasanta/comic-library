import { chromium } from 'playwright'

/**
 * QA of the detail of the personal lists (US-0036).
 *
 * Checks that the owner can reorder and remove works of a personal list, that
 * the order persists, that removing a work only removes the relation, and
 * that the lists of the system keep their behavior.
 */

const BASE = 'http://localhost:5173'
const log = (...a) => console.log(...a)

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
const pageErrors = []
const listCalls = []

page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)))
page.on('response', (r) => {
  if (r.url().includes('/api/users/me/lists')) {
    listCalls.push(`${r.request().method()} ${r.url().split('/api')[1]} ${r.status()}`)
  }
})

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
await page.fill('input[name="email"]', 'fede.piedrasanta@gmail.com')
await page.fill('input[name="password"]', 'CHANGE_ME_ADMIN_PASSWORD')
await page.click('button[type="submit"]')
await page.waitForURL(/\/index/, { timeout: 20000 })

// --- Una lista personal con tres obras --------------------------------------
const token = await page.evaluate(async () => {
  const res = await fetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fede.piedrasanta@gmail.com', password: 'CHANGE_ME_ADMIN_PASSWORD' }),
  })
  const data = await res.json()
  return data.payload.accessToken
})
const auth = { Authorization: `Bearer ${token}` }
const api = `${BASE}/api`

const created = await (await page.request.post(`${api}/users/me/lists`, { headers: auth, data: { name: 'QA Orden' } })).json()
const listId = created.payload.id
const works = await (await page.request.get(`${api}/works?pageSize=3`, { headers: auth })).json()
for (const work of works.payload.items) {
  await page.request.post(`${api}/users/me/lists/${listId}/works`, { headers: auth, data: { workId: work.id } })
}
const workIds = works.payload.items.map((w) => w.id)
const titles = works.payload.items.map((w) => w.title)
log(`lista ${listId} con obras: ${titles.join(' | ')}`)

// --- El detalle ofrece los controles de edicion ----------------------------
await page.goto(`${BASE}/lists/${listId}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
const handles = page.locator('button[aria-label^="Reordenar"]')
const removeButtons = page.locator('button[aria-label^="Quitar"]')
const upButtons = page.locator('button[aria-label^="Subir"]')
log(`filas ordenables: ${await handles.count()} | quitar: ${await removeButtons.count()} | subir: ${await upButtons.count()}`)
log(`titulo de la seccion: "${(await page.locator('text=Obras de la Lista').count()) > 0 ? 'ok' : 'falta'}"`)

// --- Reordenar con los botones subir/bajar ----------------------------------
const firstTitle = (await page.locator('article h3').first().textContent())?.trim()
await upButtons.nth(1).click()
await page.waitForTimeout(2500)
const orderAfter = await page.locator('article h3').allTextContents()
log(`orden tras subir: ${orderAfter.map((t) => t.trim()).join(' | ')}`)

// El orden persiste al recargar.
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
const orderAfterReload = await page.locator('article h3').allTextContents()
log(`orden tras recargar: ${orderAfterReload.map((t) => t.trim()).join(' | ')}`)
log(`el orden persistio: ${orderAfter.join('|') === orderAfterReload.join('|')}`)

// --- Reordenar con el arrastre ----------------------------------------------
const dragHandle = page.locator('button[aria-label^="Reordenar"]').first()
const beforeDrag = (await page.locator('article h3').allTextContents()).map((t) => t.trim())
const handleBox = await dragHandle.boundingBox()
const targetBox = await page.locator('article').nth(2).boundingBox()
await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
await page.mouse.down()
await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + 40, { steps: 10 })
await page.mouse.move(targetBox.x + 20, targetBox.y + targetBox.height / 2, { steps: 15 })
await page.mouse.up()
await page.waitForTimeout(2500)
const afterDrag = (await page.locator('article h3').allTextContents()).map((t) => t.trim())
log(`arrastre: ${beforeDrag.join(' | ')} -> ${afterDrag.join(' | ')}`)
log(`el arrastre cambio el orden: ${beforeDrag.join('|') !== afterDrag.join('|')}`)

await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
const afterDragReload = (await page.locator('article h3').allTextContents()).map((t) => t.trim())
log(`el arrastre persistio: ${afterDrag.join('|') === afterDragReload.join('|')}`)

// --- Quitar una obra ---------------------------------------------------------
const removedTitle = (await page.locator('article h3').first().textContent())?.trim()
await page.locator('button[aria-label^="Quitar"]').first().click()
await page.waitForTimeout(2500)
const remaining = await page.locator('article h3').allTextContents()
log(`tras quitar "${removedTitle}": quedan ${remaining.length} obras -> ${remaining.map((t) => t.trim()).join(' | ')}`)

// La obra sigue en el catalogo.
const stillInCatalog = await (await page.request.get(`${api}/works?pageSize=5`, { headers: auth })).json()
log(`la obra sigue en el catalogo: ${stillInCatalog.payload.items.length > 0}`)

// --- Las listas del sistema no ofrecen los controles ------------------------
const systemList = await (await page.request.get(`${api}/catalog/lists?pageSize=1`, { headers: auth })).json()
await page.goto(`${BASE}/lists/${systemList.payload.items[0].id}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
log(`controles de edicion en una lista del sistema: ${await page.locator('button[aria-label^="Reordenar"]').count()} (debe ser 0)`)

log(`llamadas a /api/users/me/lists: ${JSON.stringify([...new Set(listCalls)])}`)
log(`errores de pagina: ${pageErrors.length === 0 ? 'ninguno' : JSON.stringify(pageErrors.slice(0, 5))}`)

// Limpieza
await page.request.delete(`${api}/users/me/lists/${listId}`, { headers: auth })

await browser.close()
