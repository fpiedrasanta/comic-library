// Checks readablePillTextColor against the real colors in the database, using
// the same WCAG formula the browser uses. Independent of the API so the
// contrast rule can be verified while the login rate limit is exhausted.
import { readFileSync, writeFileSync } from 'node:fs'

// The helper lives in a .ts module. Node strips the types on import, but only
// for real files, not for a data: URL, so it is copied next to this script and
// imported as .ts. The copy is left on disk on purpose: deleting it while the
// module handle is still open trips a libuv assertion on Windows.
const target = new URL('./qa-pill-color-target.ts', import.meta.url)
writeFileSync(target, readFileSync(new URL('./public-web/features/catalog/utils/entity-color.ts', import.meta.url)))

const { readablePillTextColor } = await import(target.href)

const CARD_SURFACE = '#131a26'
const ALPHA = 0.85

function relLum([r, g, b]) {
  const f = (v) => {
    v /= 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const ratio = (a, b) => {
  const [x, y] = [relLum(a), relLum(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}
const toRgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]
const surfaceRgb = toRgb(CARD_SURFACE)

// Mirrors compositedPillBackground: the white/black pill at 0.85 over the card.
function pillBackground(color) {
  const isLight = (0.299 * toRgb(color)[0] + 0.587 * toRgb(color)[1] + 0.114 * toRgb(color)[2]) / 255 > 0.5
  const base = isLight ? [0, 0, 0] : [255, 255, 255]
  return base.map((c, i) => Math.round(c * ALPHA + surfaceRgb[i] * (1 - ALPHA)))
}

const colors = [
  ['#f51b00', 'Marvel Comics'],
  ['#f10d04', 'Spiderman'],
  ['#d93b28', 'The amazing spiderman'],
  ['#990e14', 'X-men'],
  ['#40373f', 'Fly Vol.1'],
  ['#00B4D8', 'Fly Vol.1'],
  ['#7209B7', 'Fly'],
  ['#231f20', 'Zenescope'],
  ['#020601', 'New X-men'],
  ['#0000FF', 'Test Series'],
  ['#00FF00', 'Test Franchise'],
  ['#FF0000', 'Test Publisher'],
  ['#FCD202', 'amarillo claro'],
  ['#0d4a84', 'azul oscuro'],
  ['#ffffff', 'blanco'],
  ['#000000', 'negro'],
]

let failed = 0
for (const [color, name] of colors) {
  const text = readablePillTextColor(color, ALPHA, CARD_SURFACE)
  const bg = pillBackground(color)
  const before = ratio(toRgb(color), bg)
  const after = ratio(toRgb(text), bg)
  const ok = after >= 4.5
  if (!ok) failed++
  const moved = text.toLowerCase() === color.toLowerCase() ? 'sin ajustar' : `ajustado a ${text}`
  console.log(
    `${ok ? 'OK  ' : 'FALLA'} ${color} ${name.padEnd(22)} ${moved.padEnd(26)} ${before.toFixed(2)} -> ${after.toFixed(2)}`,
  )
}

const noColor = readablePillTextColor(null, ALPHA, CARD_SURFACE)
console.log(`\nsin color -> ${noColor === undefined ? 'undefined (hereda)' : noColor}`)
console.log(failed === 0 ? '\nTodas las pills alcanzan 4.5:1' : `\n${failed} pills por debajo de 4.5:1`)
process.exit(failed === 0 ? 0 : 1)