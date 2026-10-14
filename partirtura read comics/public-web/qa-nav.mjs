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

// Anchored on the header box itself. A bare `.relative.overflow-hidden`
// selector also matches the inner `details` panels, so `.first()` can land on
// a node that is not the header and never find the pill.
const header = () => page.locator('div.relative.overflow-hidden').filter({ has: page.locator('h1') }).first()

async function clickPill(path, expectedPath, expectedHeading) {
  if (new URL(page.url()).pathname !== path) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
    await page.waitForSelector('h1', { timeout: 20000 })
    await page.waitForTimeout(1500)
  }

  // Selected by href: both pills are links now, so the href is the stable
  // handle. Text and title are unusable here because the test entity names are
  // long enough that the pill truncates the visible text, and the title is
  // prefixed with the level ("Franquicia: ...").
  const pill = header().locator(`a[href="${expectedPath}"]`).first()
  const before = new URL(page.url())
  log(`  pill: ${JSON.stringify(await pill.getAttribute('title'))} -> ${expectedPath}`)
  await pill.click()
  await page.waitForURL(`**${expectedPath}`, { timeout: 15000 })
  await page.waitForSelector('h1', { timeout: 20000 })
  await page.waitForTimeout(1800)
  const after = new URL(page.url())
  const heading = await page.locator('h1').innerText()
  const ok = after.pathname === expectedPath && heading === expectedHeading
  log(
    `${ok ? 'OK   ' : 'FALLA'} ${path} -> ${after.pathname} | h1: "${heading.slice(0, 44)}"${ok ? '' : ` (esperado ${expectedPath} / ${expectedHeading})`}`,
  )
  log(`      query: "${before.search}" -> "${after.search}"`)
}

// series -> franchise / publisher
await clickPill('/series/8', '/franchises/6', 'Spiderman')
await page.goto(`${BASE}/series/8`, { waitUntil: 'networkidle' })
await page.waitForSelector('h1', { timeout: 20000 })
await page.waitForTimeout(1500)
await clickPill('/series/8', '/publishers/3', 'Marvel Comics')

// a second publisher/franchise pair, to cover ids other than Marvel/Spiderman
await clickPill('/series/7', '/publishers/4', 'Zenescope')

await clickPill('/series/6', '/franchises/3', 'X-men')

// franchise -> publisher
await clickPill('/franchises/6', '/publishers/3', 'Marvel Comics')
await clickPill('/franchises/5', '/publishers/5', 'DC Comics')

// publisher header has no level above: nothing to navigate to
await page.goto(`${BASE}/publishers/3`, { waitUntil: 'networkidle' })
await page.waitForSelector('h1', { timeout: 20000 })
await page.waitForTimeout(1500)
const links = await header().locator('a, button').evaluateAll((els) =>
  els.map((e) => ({ tag: e.tagName, text: e.textContent.trim().slice(0, 30), title: e.getAttribute('title'), href: e.getAttribute('href') })),
)
log(`\n/publishers/3 enlaces/pills en el header: ${JSON.stringify(links)}`)

await browser.close()