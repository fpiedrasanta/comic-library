import { chromium } from 'playwright'

const login = { email: 'fede.piedrasanta@gmail.com', password: 'CHANGE_ME_ADMIN_PASSWORD' }
const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()
await page.request.post('http://localhost:5131/api/users/login', { data: login })
await page.goto('http://localhost:5173/index', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)

await page.goto('http://localhost:5173/lists/1', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

const worksSection = page.locator('section', { has: page.locator('h2:has-text("Obras de la Lista")') })

// Test the second work card (has number and series)
const secondWorkRoot = worksSection.locator('div[class*="aspect-[2/3]"]').nth(1).locator('..')
const secondWorkText = await secondWorkRoot.innerText().catch(() => '')
console.log('=== SECOND WORK TEXT ===')
console.log(secondWorkText)
console.log('=== END ===')

// Check for SUBIDO
const hasSubido = secondWorkText.includes('SUBIDO')
console.log('has SUBIDO:', hasSubido)

// Check the exact line
const lines = secondWorkText.split('\n')
lines.forEach((l, i) => {
  if (l.includes('SUBIDO') || l.includes('Subido') || l.includes('subido') || l.includes('10/6/') || l.includes('29/9/')) {
    console.log(`Line ${i}: "${l}"`)
  }
})

await browser.close()