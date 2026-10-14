import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const login = { email: 'fede.piedrasanta@gmail.com', password: 'CHANGE_ME_ADMIN_PASSWORD' }
const log = (...a) => console.log(...a)
let failures = 0
const check = (ok, label, detail = '') => {
  if (!ok) failures++
  log(`${ok ? 'OK   ' : 'FALLA'} ${label}${detail ? ` | ${detail}` : ''}`)
}

// Separate from qa-entity-listings.mjs on purpose: this sweep reloads the page
// once per breakpoint, and a burst of full loads in the same minute trips the
// refresh-token rate limit (30/min), which bounces the page to the login screen.
const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()

await page.request.post('http://localhost:5131/api/users/login', { data: login })
await page.goto(`${BASE}/index`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)

const ROUTES = ['/series', '/franchises', '/publishers']
const BREAKPOINTS = [
  [390, 844, 'mobile'],
  [820, 1180, 'tablet'],
  [1920, 1080, 'desktop'],
]

for (const [width, height, label] of BREAKPOINTS) {
  await page.setViewportSize({ width, height })

  for (const route of ROUTES) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
    await page.waitForSelector('article', { timeout: 20000 })
    await page.waitForTimeout(700)

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    const columns = await page
      .locator('article')
      .first()
      .evaluate((el) => getComputedStyle(el.parentElement).gridTemplateColumns.split(' ').length)
    const cards = await page.locator('article').count()

    check(overflow <= 0 && cards > 0 && columns >= 2, `${label} ${route}`, `overflow=${overflow}px, ${columns} columnas, ${cards} cards`)
  }
}

// The image fills its area: no inner padding and object-fit cover.
await page.setViewportSize({ width: 1920, height: 1080 })
await page.goto(`${BASE}/series`, { waitUntil: 'networkidle' })
await page.waitForSelector('article', { timeout: 20000 })
await page.waitForTimeout(700)
const imageBox = await page.locator('article').first().evaluate((el) => {
  const area = el.querySelector('div')
  const img = el.querySelector('img')
  const areaStyle = getComputedStyle(area)
  return {
    areaPadding: areaStyle.padding,
    ratio: area.clientWidth / area.clientHeight,
    imgFit: img ? getComputedStyle(img).objectFit : null,
  }
})
check(imageBox.areaPadding === '0px', 'imagen sin padding interno', `padding=${imageBox.areaPadding}`)
check(Math.abs(imageBox.ratio - 1) < 0.01, 'área de imagen cuadrada', `ratio=${imageBox.ratio.toFixed(3)}`)
check(imageBox.imgFit === 'cover', 'imagen con object-fit cover', `object-fit=${imageBox.imgFit}`)

await browser.close()
log(failures === 0 ? '\nTODO VERDE' : `\n${failures} FALLAS`)
process.exit(failures === 0 ? 0 : 1)