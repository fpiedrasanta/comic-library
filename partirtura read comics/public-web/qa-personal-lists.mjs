import { chromium } from 'playwright'

/**
 * QA of the personal lists of the public web (US-0036).
 *
 * Checks that the button is available in every listing that shows works, that
 * the modal lists the personal lists of the user with their membership, that
 * the work can be added and removed, that the lists can be created, renamed
 * and deleted, and that the state of the card follows the operations.
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
log('login: ok')

const listButton = page.locator('button[aria-label^="Administrar las listas"]')

// --- Un favorito, para que /favorites tenga una obra que mostrar -----------
await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
const star = page.locator('button[aria-pressed]').first()
const hadFavorite = (await star.getAttribute('aria-pressed')) === 'true'
if (!hadFavorite) {
  await star.click()
  await page.waitForTimeout(1500)
}

async function countButtons(path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  const count = await listButton.count()
  log(`  ${path}: ${count} botones de listas`)
  return count
}

log('botones de listas por pagina:')
await countButtons('/index')
await countButtons('/catalog')
await countButtons('/publishers/5')
await countButtons('/franchises/5')
await countButtons('/series/7')
await countButtons('/my-collection')
await countButtons('/favorites')

// --- El modal abre y muestra las listas propias ----------------------------
await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
await listButton.first().click()
await page.waitForTimeout(1500)

const dialog = page.locator('[role="dialog"]')
log(`modal abierto: ${(await dialog.count()) > 0}`)
log(`titulo del modal: "${(await dialog.locator('h2, [id*="radix"]').first().textContent().catch(() => ''))?.trim()}"`)
log(`estado vacio: ${(await dialog.locator('text=/Todavía no tenés listas/').count()) > 0 ? 'si' : 'no'}`)

// --- Crear una lista --------------------------------------------------------
await dialog.locator('button:has-text("Nueva")').click()
await page.waitForTimeout(600)
const nameDialog = page.locator('[role="dialog"]').last()
await nameDialog.locator('input[type="text"]').fill('QA Listas')
await nameDialog.locator('button[type="submit"]').click()
await page.waitForTimeout(2000)
const createdRow = dialog.locator('text=QA Listas')
log(`lista creada y visible en el modal: ${(await createdRow.count()) > 0}`)

// --- Agregar la obra a la lista nueva ---------------------------------------
await createdRow.locator('xpath=ancestor::div[contains(@class,"rounded-xl")]').locator('input[type="checkbox"]').click()
await page.waitForTimeout(2000)
const checked = await createdRow
  .locator('xpath=ancestor::div[contains(@class,"rounded-xl")]')
  .locator('input[type="checkbox"]')
  .isChecked()
log(`obra agregada a la lista: ${checked}`)

// El boton de la tarjeta pasa a azul.
await page.keyboard.press('Escape')
await page.waitForTimeout(500)
await page.keyboard.press('Escape')
await page.waitForTimeout(1500)
const cardButton = page.locator('button[aria-label^="Administrar las listas"]').first()
const buttonClass = await cardButton.getAttribute('class')
log(`boton de la tarjeta tras agregar: ${buttonClass?.includes('text-neps-primary') ? 'azul' : 'NO azul'}`)

// --- Quitar la obra de la lista ---------------------------------------------
await cardButton.click()
await page.waitForTimeout(1500)
const dialog2 = page.locator('[role="dialog"]')
await dialog2.locator('text=QA Listas').locator('xpath=ancestor::div[contains(@class,"rounded-xl")]').locator('input[type="checkbox"]').click()
await page.waitForTimeout(2000)
const checkedAfter = await dialog2
  .locator('text=QA Listas')
  .locator('xpath=ancestor::div[contains(@class,"rounded-xl")]')
  .locator('input[type="checkbox"]')
  .isChecked()
log(`obra quitada de la lista: ${checkedAfter === false}`)

// --- Renombrar la lista ------------------------------------------------------
await dialog2
  .locator('text=QA Listas')
  .locator('xpath=ancestor::div[contains(@class,"rounded-xl")]')
  .locator('button[aria-label^="Editar"]')
  .click()
await page.waitForTimeout(600)
const renameDialog = page.locator('[role="dialog"]').last()
await renameDialog.locator('input[type="text"]').fill('QA Listas Renombrada')
await renameDialog.locator('button[type="submit"]').click()
await page.waitForTimeout(2000)
log(`lista renombrada: ${(await dialog2.locator('text=QA Listas Renombrada').count()) > 0}`)

// --- Eliminar la lista -------------------------------------------------------
await dialog2
  .locator('text=QA Listas Renombrada')
  .locator('xpath=ancestor::div[contains(@class,"rounded-xl")]')
  .locator('button[aria-label^="Eliminar"]')
  .click()
await page.waitForTimeout(600)
const confirmDialog = page.locator('[role="dialog"]').last()
log(`modal de confirmacion: ${(await confirmDialog.locator('text=¿Eliminar lista?').count()) > 0}`)
await confirmDialog.locator('button:has-text("Sí, eliminar")').click()
await page.waitForTimeout(2000)
log(`lista eliminada: ${(await dialog2.locator('text=QA Listas Renombrada').count()) === 0}`)

await page.keyboard.press('Escape')
await page.waitForTimeout(800)

// --- Restaurar el favorito de la prueba ------------------------------------
if (!hadFavorite) {
  await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  const restoreStar = page.locator('button[aria-pressed]').first()
  if ((await restoreStar.getAttribute('aria-pressed')) === 'true') {
    await restoreStar.click()
    await page.waitForTimeout(1500)
    log('favorito de la prueba restaurado')
  }
}

log(`llamadas a /api/users/me/lists: ${JSON.stringify([...new Set(listCalls)])}`)
log(`errores de pagina: ${pageErrors.length === 0 ? 'ninguno' : JSON.stringify(pageErrors.slice(0, 5))}`)

await browser.close()
