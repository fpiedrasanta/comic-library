export interface Rgb {
  r: number
  g: number
  b: number
}

const MAX_CHANNEL_VALUE = 255
const SHORT_HEX_LENGTH = 3
const HEX_PREFIX = '#'
const RED_WEIGHT = 0.299
const GREEN_WEIGHT = 0.587
const BLUE_WEIGHT = 0.114
const DARK_BACKGROUND_LUMINANCE_THRESHOLD = 0.5

const DARK_PILL_BACKGROUND: Rgb = { r: 0, g: 0, b: 0 }
const LIGHT_PILL_BACKGROUND: Rgb = {
  r: MAX_CHANNEL_VALUE,
  g: MAX_CHANNEL_VALUE,
  b: MAX_CHANNEL_VALUE,
}

function expandShortHex(hex: string): string {
  return hex
    .split('')
    .map((digit) => `${digit}${digit}`)
    .join('')
}

export function parseHexColor(color: string | null | undefined): Rgb | null {
  if (!color) return null

  const hex = color.startsWith(HEX_PREFIX) ? color.slice(1) : color
  const digits = hex.length === SHORT_HEX_LENGTH ? expandShortHex(hex) : hex

  if (digits.length !== 6) return null
  if (!/^[0-9a-f]{6}$/i.test(digits)) return null

  return {
    r: parseInt(digits.slice(0, 2), 16),
    g: parseInt(digits.slice(2, 4), 16),
    b: parseInt(digits.slice(4, 6), 16),
  }
}

function toRgba(color: Rgb, alpha: number): string {
  return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${alpha})`
}

/**
 * Perceived brightness of the entity color, using the classic weighted
 * (0.299, 0.587, 0.114) approximation. Colors above the threshold are light
 * and need a dark pill background; darker ones need a light background.
 */
function isLightColor(color: Rgb): boolean {
  const luminance =
    (RED_WEIGHT * color.r + GREEN_WEIGHT * color.g + BLUE_WEIGHT * color.b) / MAX_CHANNEL_VALUE
  return luminance > DARK_BACKGROUND_LUMINANCE_THRESHOLD
}

/**
 * Picks the black or white pill background for a translucent pill.
 *
 * The pill sits over the cover image, so at low alpha the composited result
 * depends on the artwork and the readable choice flips from card to card:
 * measured at 50%, a mid-tones color like #0a87c8 reached 5.04:1 on a black
 * background and 1.12:1 on a light one. At the opacity used by the cards the
 * backdrop stops mattering and this rule holds for every cover.
 */
export function readableBackgroundColor(color: string | null | undefined, alpha: number): string {
  const rgb = parseHexColor(color)

  if (!rgb) {
    return toRgba(DARK_PILL_BACKGROUND, alpha)
  }

  return toRgba(isLightColor(rgb) ? DARK_PILL_BACKGROUND : LIGHT_PILL_BACKGROUND, alpha)
}

export function colorWithAlpha(color: string | null | undefined, alpha: number): string {
  const rgb = parseHexColor(color)
  return rgb ? toRgba(rgb, alpha) : 'transparent'
}

const WHITE: Rgb = LIGHT_PILL_BACKGROUND
const MIN_ACCENT_TEXT_CONTRAST = 4.5
const LIGHTEN_STEP = 0.1
const MAX_LIGHTEN_STEPS = 20

/**
 * WCAG relative luminance of a color.
 */
function relativeLuminance(color: Rgb): number {
  const channel = (value: number) => {
    const ratio = value / MAX_CHANNEL_VALUE
    return ratio <= 0.03928 ? ratio / 12.92 : Math.pow((ratio + 0.055) / 1.055, 2.4)
  }

  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b)
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const lighter = Math.max(relativeLuminance(a), relativeLuminance(b))
  const darker = Math.min(relativeLuminance(a), relativeLuminance(b))
  return (lighter + 0.05) / (darker + 0.05)
}

function mixTowardWhite(color: Rgb, amount: number): Rgb {
  return {
    r: Math.round(color.r + (WHITE.r - color.r) * amount),
    g: Math.round(color.g + (WHITE.g - color.g) * amount),
    b: Math.round(color.b + (WHITE.b - color.b) * amount),
  }
}

export function toHex(color: Rgb): string {
  return `#${[color.r, color.g, color.b]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`
}

/**
 * The entity color, lightened only as far as needed to be readable as text on
 * the given surface.
 *
 * The luminance rule used by the pills picks a *background* for the entity
 * color. Accent text has no background to move, so the opposite move is made
 * here: a dark entity color is lifted toward white until it clears the
 * contrast bar. Publishers store arbitrary colors, and on the near-black card
 * a dark navy such as #0d4a84 sits at 1.9:1, which is why the raw value cannot
 * be used for text.
 */
export function readableAccentColor(color: string | null | undefined, againstBackground: string): string {
  const rgb = parseHexColor(color)
  const background = parseHexColor(againstBackground)

  if (!rgb) return 'inherit'
  if (!background) return toHex(rgb)

  let candidate = rgb
  for (let step = 0; step < MAX_LIGHTEN_STEPS; step++) {
    if (contrastRatio(candidate, background) >= MIN_ACCENT_TEXT_CONTRAST) {
      return toHex(candidate)
    }
    candidate = mixTowardWhite(candidate, LIGHTEN_STEP)
  }

  return toHex(candidate)
}

const BLACK: Rgb = DARK_PILL_BACKGROUND
const ADJUST_STEP = 0.1
const MAX_ADJUST_STEPS = 20

function mixToward(color: Rgb, target: Rgb, amount: number): Rgb {
  return {
    r: Math.round(color.r + (target.r - color.r) * amount),
    g: Math.round(color.g + (target.g - color.g) * amount),
    b: Math.round(color.b + (target.b - color.b) * amount),
  }
}

/**
 * The pill background as the opaque color the text actually sits on.
 *
 * The pill background is a translucent black or white, so measuring contrast
 * against the literal `rgba(...)` is meaningless. It has to be composited over
 * the card surface first: at the alpha the pills use, a white pill lands around
 * #dcdde4 rather than #ffffff, and against a saturated color such as
 * #f51b00 that difference is the gap between 3.4:1 and 3.0:1.
 */
function compositedPillBackground(color: string | null | undefined, alpha: number, surface: Rgb): Rgb {
  const rgb = parseHexColor(color)
  const base = rgb ? (isLightColor(rgb) ? DARK_PILL_BACKGROUND : LIGHT_PILL_BACKGROUND) : DARK_PILL_BACKGROUND

  return {
    r: Math.round(base.r * alpha + surface.r * (1 - alpha)),
    g: Math.round(base.g * alpha + surface.g * (1 - alpha)),
    b: Math.round(base.b * alpha + surface.b * (1 - alpha)),
  }
}

/**
 * The entity color as pill text, moved away from its own pill background only
 * as far as needed to be readable.
 *
 * `readableAccentColor` only lightens, because accent text has no background of
 * its own and always sits on the dark card. A pill is different: its background
 * is picked as the contrast partner of the color, so a dark entity color lands
 * on a light pill and a light one on a dark pill. The raw color cannot be used
 * for text in both directions at once, measured on real data: #f51b00, #f10d04
 * and #d93b28 reach only 3.01, 3.16 and 3.29 as text on their own pill.
 *
 * So the text moves away from its background: darkening toward black on a light
 * pill, lightening toward white on a dark one, and only until the contrast bar
 * is met, so a color that already reads is left untouched.
 */
export function readablePillTextColor(
  color: string | null | undefined,
  alpha: number,
  surface: string,
): string | undefined {
  const rgb = parseHexColor(color)
  const surfaceRgb = parseHexColor(surface) ?? BLACK
  if (!rgb) return undefined

  const background = compositedPillBackground(color, alpha, surfaceRgb)
  if (contrastRatio(rgb, background) >= MIN_ACCENT_TEXT_CONTRAST) return toHex(rgb)

  const target = relativeLuminance(background) > relativeLuminance(rgb) ? BLACK : WHITE
  let candidate = rgb
  for (let step = 0; step < MAX_ADJUST_STEPS; step++) {
    candidate = mixToward(candidate, target, ADJUST_STEP)
    if (contrastRatio(candidate, background) >= MIN_ACCENT_TEXT_CONTRAST) break
  }

  return toHex(candidate)
}
