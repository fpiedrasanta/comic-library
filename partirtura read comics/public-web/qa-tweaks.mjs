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
await page.waitForTimeout(1200)

// The pill row is the header's content column; the logo box is the first child
// of the row above it. Selecting by position rather than by class, because
// every pill also carries a border and a span.
const header = () => page.locator('div.relative.overflow-hidden').first()

const pillRow = async () =>
  header().evaluate((root) => {
    const row = root.querySelector('.relative.z-10 > div:last-child > div:first-child')
    if (!row) return []
    return Array.from(row.children).map((el) => {
      const s = getComputedStyle(el)
      const isPill = ['SPAN', 'A', 'BUTTON'].includes(el.tagName) && s.borderTopWidth !== '0px'
      const nested = el.firstElementChild
      const ns = nested ? getComputedStyle(nested) : null
      return {
        tag: el.tagName,
        text: el.textContent.trim().slice(0, 30),
        title: el.getAttribute('title'),
        href: el.getAttribute('href'),
        pill: isPill,
        color: s.color,
        bg: s.backgroundColor,
        innerText: nested?.textContent.trim().slice(0, 30) ?? null,
        innerTitle: nested?.getAttribute?.('title') ?? null,
        innerBg: ns?.backgroundColor ?? null,
        innerColor: ns?.color ?? null,
        innerHref: nested?.getAttribute?.('href') ?? null,
      }
    })
  })

const logo = async () =>
  header().evaluate((root) => {
    const box = root.querySelector('.relative.z-10 > div:first-child')
    if (!box) return 'sin recuadro'
    const inner = box.firstElementChild
    if (!inner) return 'recuadro vacio'
    const s = getComputedStyle(inner)
    const letter = inner.querySelector('span')
    const ls = letter ? getComputedStyle(letter) : null
    const boxRect = box.getBoundingClientRect()
    const innerRect = inner.getBoundingClientRect()
    return JSON.stringify({
      img: !!box.querySelector('img'),
      recuadro: `${Math.round(boxRect.width)}x${Math.round(boxRect.height)}`,
      innerCubreRecuadro:
        innerRect.width >= boxRect.width - 1 && innerRect.height >= boxRect.height - 1,
      fondoAplicadoAlRecuadro: s.backgroundColor,
      letra: letter?.textContent ?? null,
      fondoEnLaLetra: ls?.backgroundColor ?? null,
      colorLetra: ls?.color ?? null,
    })
  })

for (const id of [8, 3, 14]) {
  await page.goto(`${BASE}/series/${id}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('h1', { timeout: 20000 })
  await page.waitForSelector('div.relative.overflow-hidden a[href^="/publishers/"]', { timeout: 20000 })
  await page.waitForTimeout(600)
  log(`\n=== /series/${id} ===`)
  log('logo:', await logo())
  const items = await pillRow()
  for (const p of items) {
    log(`  ${p.pill ? 'PILL' : 'sep '} ${p.tag.padEnd(7)} ${p.text.padEnd(32)} title=${JSON.stringify(p.title ?? p.innerTitle)} href=${p.href ?? p.innerHref}`)
  }
  const dots = items.filter((p) => p.text === '•').length
  log(`  separadores: ${dots} ${dots <= 1 ? 'OK' : 'FALLA'}`)
}

// sin imagen: una serie sin urlImage
log('\n=== /series/14 (sin imagen) ===')
await page.goto(`${BASE}/series/14`, { waitUntil: 'networkidle' })
await page.waitForSelector('h1', { timeout: 20000 })
await page.waitForSelector('div.relative.overflow-hidden a[href^="/publishers/"]', { timeout: 20000 })
await page.waitForTimeout(600)
log('logo:', await logo())

// franchise/publisher headers, que comparten EntityHeader
for (const path of ['/franchises/6', '/publishers/3']) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('h1', { timeout: 20000 })
  await page.waitForTimeout(1200)
  log(`\n=== ${path} ===`)
  log('logo:', await logo())
  for (const p of await pillRow()) {
    log(`  ${p.pill ? 'PILL' : 'sep '} ${p.tag.padEnd(7)} ${p.text.padEnd(32)} title=${JSON.stringify(p.title ?? p.innerTitle)} href=${p.href ?? p.innerHref}`)
  }
}
await browser.close()