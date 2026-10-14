import { chromium } from 'playwright'

const login = { email: 'fede.piedrasanta@gmail.com', password: 'CHANGE_ME_ADMIN_PASSWORD' }
const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()
await page.request.post('http://localhost:5131/api/users/login', { data: login })
await page.goto('http://localhost:5173/index', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)

await page.goto('http://localhost:5173/lists', { waitUntil: 'networkidle' })
await page.waitForSelector('a[href^="/lists/"]', { timeout: 20000 })
await page.waitForTimeout(800)

const cards = page.locator('a[href^="/lists/"]')
const count = await cards.count()
console.log(`Total cards: ${count}`)

for (let i = 0; i < count; i++) {
  const text = await cards.nth(i).innerText()
  console.log(`=== CARD ${i} ===`)
  console.log(text)
  console.log('---')
}

await browser.close()