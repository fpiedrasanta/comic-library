import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const log = (...a) => console.log(...a)

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
const page = await context.newPage()
page.on('pageerror', (e) => log('PAGEERROR:', String(e).slice(0, 200)))

await page.request.post('http://localhost:5131/api/users/login', {
  data: { email: 'fede.piedrasanta@gmail.com', password: 'CHANGE_ME_ADMIN_PASSWORD' },
})
await page.goto(`${BASE}/index`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

const grid = page.locator('div.grid')
const cardPills = (level) => grid.locator(`button[title^="${level}:"]`).count()
const row = (label) =>
  page.locator('div.relative.overflow-hidden').first().locator('span.font-mono, button.font-mono, a').evaluateAll((els) =>
    els.map((e) => ({ tag: e.tagName, text: e.textContent, title: e.getAttribute('title'), href: e.getAttribute('href'), color: getComputedStyle(e).color, bg: e.tagName === 'SPAN' ? getComputedStyle(e).backgroundColor : undefined }))
  )

for (const id of [8, 3, 5, 14, 99999999, 0]) {
  await page.goto(`${BASE}/series/${id}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('h1, h2', { timeout: 20000 })
  await page.waitForTimeout(1800)
  const titulo = (await page.locator('h1').count()) ? await page.locator('h1').innerText() : `h2: ${await page.locator('h2').innerText()}`
  log(`\n=== /series/${id} ===`)
  log('titulo:', titulo)
  for (const r of await row()) log('  ', JSON.stringify(r))
  log('  descripcion:', await page.locator('p.max-w-3xl').count())
  log('  ID visible:', await page.locator('text=/ID:/').count())
  log('  logo:', await page.locator('div.w-28').first().evaluate((b) => {
    const img = b.querySelector('img'); const r = b.getBoundingClientRect()
    if (!img) return `fallback "${b.textContent.trim()}"`
    const i = img.getBoundingClientRect()
    return `${((i.width / r.width) * 100).toFixed(0)}% caja, natural ${img.naturalWidth}x${img.naturalHeight}, object-fit ${getComputedStyle(img).objectFit}`
  }).catch(() => 'n/a (estado de error, sin logo)'))
  log('  cards — Editorial:', await cardPills('Editorial'), '| Franquicia:', await cardPills('Franquicia'), '| Serie:', await cardPills('Serie'), '| WorkType:', await page.locator('span.uppercase.tracking-wider').count())
}

// navegacion desde el header
await page.goto(`${BASE}/series/8`, { waitUntil: 'networkidle' })
await page.waitForSelector('h1', { timeout: 20000 })
await page.waitForTimeout(1800)
log('\n=== navegacion ===')
log('URL inicial:', new URL(page.url()).search || '(sin query)')
await page.locator('div.relative.overflow-hidden a[href="/franchises/6"]').click()
await page.waitForURL(/\/franchises\/6/, { timeout: 15000 })
await page.waitForTimeout(2000)
log('click Franquicia ->', new URL(page.url()).pathname, '| h1:', await page.locator('h1').innerText())

await page.goto(`${BASE}/series/8`, { waitUntil: 'networkidle' })
await page.waitForSelector('h1', { timeout: 20000 })
await page.waitForTimeout(1800)
await page.locator('div.relative.overflow-hidden a[href="/publishers/3"]').click()
await page.waitForURL(/\/publishers\/3/, { timeout: 15000 })
await page.waitForTimeout(2000)
log('click Editorial ->', new URL(page.url()).pathname, '| h1:', await page.locator('h1').innerText())
await browser.close()
