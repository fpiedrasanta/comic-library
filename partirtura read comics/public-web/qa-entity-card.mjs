import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const login = { email: 'fede.piedrasanta@gmail.com', password: 'CHANGE_ME_ADMIN_PASSWORD' }
const log = (...a) => console.log(...a)
let failures = 0
const check = (ok, label, detail = '') => {
  if (!ok) failures++
  log(`${ok ? 'OK   ' : 'FALLA'} ${label}${detail ? ` | ${detail}` : ''}`)
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await context.newPage()
page.on('pageerror', (e) => {
  failures++
  console.log('PAGEERROR:', String(e).slice(0, 200))
})

await page.request.post('http://localhost:5131/api/users/login', { data: login })
await page.goto(`${BASE}/index`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)

const pillLinks = () => page.locator('article a[title^="Editorial:"], article a[title^="Franquicia:"]')

// Narrow viewport on purpose: the two pills only wrap here.
await page.goto(`${BASE}/series`, { waitUntil: 'networkidle' })
await page.waitForSelector('article', { timeout: 20000 })
await page.waitForTimeout(900)

const cards = await page.locator('article').evaluateAll((nodes) =>
  nodes.map((node) => {
    const area = node.querySelector('div')
    const areaBox = area.getBoundingClientRect()
    const pills = [...area.querySelectorAll('a')].map((pill) => {
      const box = pill.getBoundingClientRect()
      return { text: pill.textContent.trim(), top: box.top - areaBox.top, left: box.left - areaBox.left, height: box.height }
    })
    return { areaHeight: areaBox.height, pills }
  }),
)

const wrapping = cards.find((card) => card.pills.length === 2 && card.pills[1].top > card.pills[0].top + 4)
check(Boolean(wrapping), 'mobile: alguna card apila las dos pills', wrapping ? JSON.stringify(wrapping.pills.map((p) => ({ t: p.text, top: Math.round(p.top) }))) : 'ninguna card apila')

if (wrapping) {
  const [first, second] = wrapping.pills
  // Packed against the top edge, not spread over the image height.
  check(first.top <= 12, 'pills pegadas al borde superior', `primera a ${first.top.toFixed(1)}px`)
  const rowGap = second.top - first.top
  check(rowGap <= first.height + 8, 'filas de pills juntas, sin separarse', `separación vertical ${rowGap.toFixed(1)}px (alto ${first.height.toFixed(1)}px)`)
  check(
    second.top < wrapping.areaHeight * 0.4,
    'la segunda pill no cae al medio de la imagen',
    `top ${second.top.toFixed(1)}px de ${wrapping.areaHeight.toFixed(0)}px`,
  )
}

// Clicking the image opens the detail page. Playwright hovers before clicking,
// which is exactly the case that used to swallow the click.
const cardsWithImage = await page.locator('article').evaluateAll((nodes) =>
  nodes.map((node, index) => {
    const area = node.querySelector('div')
    const box = area.getBoundingClientRect()
    // A point in the image that no pill covers: lower half of the area.
    return { index, x: box.left + box.width / 2, y: box.top + box.height * 0.75 }
  }),
)

let imageClicks = 0
for (const point of cardsWithImage.slice(0, 4)) {
  await page.goto(`${BASE}/series`, { waitUntil: 'networkidle' })
  await page.waitForSelector('article', { timeout: 20000 })
  await page.waitForTimeout(700)

  const card = page.locator('article').nth(point.index)
  const box = await card.locator('div').first().boundingBox()
  const expected = await card.locator('a[aria-label]').getAttribute('href')

  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.75)
  await page.waitForTimeout(250)
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.75)

  try {
    await page.waitForURL(new RegExp(`${expected}$`), { timeout: 5000 })
    imageClicks++
  } catch {
    check(false, `click en la imagen navega a ${expected}`, `quedó en ${new URL(page.url()).pathname}`)
  }
}
check(imageClicks === cardsWithImage.slice(0, 4).length, 'click en la imagen navega al detalle', `${imageClicks}/${cardsWithImage.slice(0, 4).length} cards`)

// The pills must still win over the card link.
await page.goto(`${BASE}/series`, { waitUntil: 'networkidle' })
await page.waitForSelector('article', { timeout: 20000 })
await page.waitForTimeout(700)
const pillHref = await pillLinks().first().getAttribute('href')
await pillLinks().first().click()
await page.waitForURL(`**${pillHref}`, { timeout: 15000 })
await page.waitForTimeout(800)
check(new URL(page.url()).pathname === pillHref, 'la pill sigue navegando a su propia entidad', pillHref)

// And the name area of the card too. Clicked by coordinates: the stretched
// link sits over the name on purpose, so Playwright's hit check rejects the
// h3 as a target even though a real click lands on the link.
await page.goto(`${BASE}/series`, { waitUntil: 'networkidle' })
await page.waitForSelector('article', { timeout: 20000 })
await page.waitForTimeout(700)
const nameHref = await page.locator('article a[aria-label]').first().getAttribute('href')
const nameBox = await page.locator('article h3').first().boundingBox()
await page.mouse.click(nameBox.x + nameBox.width / 2, nameBox.y + nameBox.height / 2)
await page.waitForURL(`**${nameHref}`, { timeout: 15000 })
check(new URL(page.url()).pathname === nameHref, 'click en el nombre navega al detalle', nameHref)

await browser.close()
log(failures === 0 ? '\nTODO VERDE' : `\n${failures} FALLAS`)
process.exit(failures === 0 ? 0 : 1)