import { chromium } from 'playwright'

const login = { email: 'fede.piedrasanta@gmail.com', password: 'CHANGE_ME_ADMIN_PASSWORD' }
const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()
await page.request.post('http://localhost:5131/api/users/login', { data: login })
await page.goto('http://localhost:5173/index', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)

const requests = []
page.on('request', (r) => {
  if (r.url().includes('/api/catalog/lists')) console.log('REQUEST:', r.url())
})
page.on('response', (r) => {
  if (r.url().includes('/api/catalog/lists')) console.log('RESPONSE:', r.status(), r.url())
})

await page.goto('http://localhost:5173/lists/1', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

const cards = page.locator('div[class*="aspect-[2/3]"]')
const count = await cards.count()
console.log('Cards found:', count)

for (let i = 0; i < count; i++) {
  const root = cards.nth(i).locator('..')
  const text = await root.innerText()
  console.log(`=== CARD ${i} ===`)
  console.log(text)
  console.log(`=== END ${i} ===`)
}

await browser.close()