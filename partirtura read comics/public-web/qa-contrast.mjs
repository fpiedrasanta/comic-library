import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const log = (...a) => console.log(...a)

function relLum([r, g, b]) {
  const f = (v) => {
    v /= 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
function ratio(fg, bg) {
  const a = relLum(fg), b = relLum(bg)
  return ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2)
}
const parse = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number)

// Resolve the real backdrop: composite the element's own background over the
// nearest ancestor that is opaque. Comparing against a transparent color makes
// every pill look broken, because the contrast is then measured against
// nothing rather than against the card surface.
const resolveBg = (el) => {
  const layers = []
  let node = el
  while (node) {
    const c = getComputedStyle(node).backgroundColor
    const m = (c.match(/[\d.]+/g) || []).map(Number)
    if (m.length >= 3) {
      const a = m.length === 4 ? m[3] : 1
      if (a > 0) {
        layers.push({ rgb: m.slice(0, 3), a })
        if (a >= 1) break
      }
    }
    node = node.parentElement
  }
  let out = [0, 0, 0]
  for (const layer of layers.reverse()) {
    out = out.map((c, i) => c * (1 - layer.a) + layer.rgb[i] * layer.a)
  }
  return out.map(Math.round).join(',')
}

const browser = await chromium.launch()

for (const [w, h, label] of [[1440, 1100, 'Desktop'], [834, 1112, 'Tablet'], [390, 844, 'Mobile']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => log('  PAGEERROR:', String(e).slice(0, 160)))
  await page.request.post('http://localhost:5131/api/users/login', {
    data: { email: 'fede.piedrasanta@gmail.com', password: 'CHANGE_ME_ADMIN_PASSWORD' },
  })
  await page.goto(`${BASE}/index`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)

  log(`\n===== ${label} ${w}x${h} =====`)
  for (const id of [8, 3, 14]) {
    await page.goto(`${BASE}/series/${id}`, { waitUntil: 'networkidle' })
    await page.waitForSelector('h1', { timeout: 20000 })
    // The header renders a skeleton until the detail resolves, and the skeleton
    // has no pills. Waiting only for the h1 measures whatever is on screen at
    // that instant, which is sometimes the placeholder.
    await page.waitForSelector('div.relative.overflow-hidden a[href^="/publishers/"]', { timeout: 20000 })
    await page.waitForTimeout(600)
    const pills = await page.locator('div.relative.overflow-hidden > div > div > div:first-child span, div.relative.overflow-hidden > div > div > div:first-child a').evaluateAll(
      (els, resolveSrc) => {
        const resolve = eval(`(${resolveSrc})`)
        return els
          .filter((e) => ['SPAN', 'A'].includes(e.tagName))
          .map((e) => {
            const s = getComputedStyle(e)
            return {
              text: e.textContent.trim().slice(0, 22),
              color: (s.color.match(/[\d.]+/g) || []).slice(0, 3).map(Number).join(','),
              bg: resolve(e),
              font: Number.parseFloat(s.fontSize),
              weight: s.fontWeight,
            }
          })
      },
      resolveBg.toString(),
    )
    log(` /series/${id}`)
    for (const p of pills) {
      const r = ratio(parse(p.color), parse(p.bg))
      const large = p.font >= 18.66 || (p.font >= 14 && Number(p.weight) >= 700)
      const bar = large ? 3 : 4.5
      const verdict = Number(r) >= bar ? (large ? 'AA-large' : 'AA') : 'FALLA'
      log(`   ${p.text.padEnd(22)} ratio=${r.padStart(6)} min=${bar} ${verdict}`)
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    log(`   overflow horizontal: ${overflow}px ${overflow <= 0 ? 'OK' : 'FALLA'}`)
  }
  await ctx.close()
}
await browser.close()