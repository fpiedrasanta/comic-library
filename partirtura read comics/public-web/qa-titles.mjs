import { chromium } from 'playwright'
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1100 } })
const page = await ctx.newPage()
await page.request.post('http://localhost:5131/api/users/login', { data: { email: 'fede.piedrasanta@gmail.com', password: 'CHANGE_ME_ADMIN_PASSWORD' } })
await page.goto('http://localhost:5173/index', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
for (const [id, name] of [[8, 'spiderman'], [14, 'test']]) {
  await page.goto(`http://localhost:5173/series/${id}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('h1', { timeout: 20000 })
  await page.waitForSelector('div.relative.overflow-hidden a[href^="/publishers/"]', { timeout: 20000 })
  await page.waitForTimeout(400)
  const links = await page.locator('div.relative.overflow-hidden a[href^="/franchises/"], div.relative.overflow-hidden a[href^="/publishers/"]').evaluateAll(els =>
    els.map(e => ({ text: e.textContent.trim().slice(0, 24), title: e.getAttribute('title'), href: e.getAttribute('href') })))
  console.log(`/series/${id} ${name}:`, JSON.stringify(links, null, 1))
}
await browser.close()
