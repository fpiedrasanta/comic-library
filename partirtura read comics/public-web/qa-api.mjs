import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const log = (...a) => console.log(...a)

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()

let auth = null
page.on('request', (r) => {
  if (r.url().includes('/api/series') && r.headers()['authorization']) auth = r.headers()['authorization']
})

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
await page.fill('input[name="email"]', 'fede.piedrasanta@gmail.com')
await page.fill('input[name="password"]', 'CHANGE_ME_ADMIN_PASSWORD')
await page.click('button[type="submit"]')
await page.waitForURL(/\/index/, { timeout: 20000 })
await page.goto(`${BASE}/catalog`, { waitUntil: 'networkidle' })
await page.waitForTimeout(3000)
await page.locator('input[placeholder="Buscar serie..."]').click()
await page.waitForTimeout(2500)
log('token capturado:', auth ? 'si' : 'no')

const out = await page.evaluate(async (a) => {
  const res = await fetch('/api/series?pageSize=3&orderBy=Name&orderDir=asc', { headers: { Authorization: a } })
  const body = await res.json()
  return { status: res.status, payload: body.payload }
}, auth)
log('GET /api/series:', JSON.stringify(out, null, 1))
await browser.close()
