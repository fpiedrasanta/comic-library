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

// Try different selectors
console.log('--- Testing selectors ---')

// Original: div[class*="aspect-[2/3]"]
let cards = worksSection.locator('div[class*="aspect-[2/3]"]')
console.log('div[class*="aspect-[2/3]"]:', await cards.count())

// Try a[href^="/works/"]
cards = worksSection.locator('a[href^="/works/"]')
console.log('a[href^="/works/"]:', await cards.count())

// Try any <a> inside the section
cards = worksSection.locator('a')
console.log('all <a>:', await cards.count())

// Try article
cards = worksSection.locator('article')
console.log('article:', await cards.count())

// Try the section content directly
const sectionText = await worksSection.innerText()
console.log('--- Section text (first 2000 chars) ---')
console.log(sectionText.slice(0, 2000))

await browser.close()