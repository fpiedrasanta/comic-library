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

for (const path of ['/publishers/3', '/franchises/6', '/series/8']) {
  const works = []
  const listener = (r) => {
    const u = r.url()
    if (u.includes('/api/works?')) works.push(u.replace(/^.*\/api/, '/api'))
  }
  page.on('response', listener)
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)
  page.off('response', listener)

  const unfiltered = works.filter((u) => !/[?&](publisher|franchise|series)Id=/.test(u))
  log(`\n${path}`)
  for (const u of works) log(`  ${u}`)
  log(`  requests de works: ${works.length} | sin filtrar: ${unfiltered.length} ${unfiltered.length === 0 ? 'OK' : 'FALLA'}`)
}
await browser.close()
