import { colorWithAlpha, parseHexColor, toHex } from './entity-color'
import type { MyReadingProgressDto } from '../types/work-detail'

/** Amber of the visual reference, at the start of the reading. */
const READING_START_COLOR = '#fbbf24'
/** Orange of the visual reference, reached at the end of the reading. */
const READING_END_COLOR = '#f97316'
/** Emerald, reserved for a completed reading so it is spotted at a glance. */
const COMPLETED_COLOR = '#34d399'
const MIN_PERCENTAGE = 0
const FULL_PERCENTAGE = 100
const GLOW_ALPHA = 0.6

export interface ReadingProgressAppearance {
  /** Bar and badge color. */
  color: string
  /** `box-shadow` color that goes with `color`. */
  glow: string
  /** Percentage already clamped to 0-100: bar width and badge label. */
  percentage: number
}

function clampPercentage(percentage: number): number {
  return Math.min(FULL_PERCENTAGE, Math.max(MIN_PERCENTAGE, percentage))
}

function mixHex(from: string, to: string, ratio: number): string {
  const fromRgb = parseHexColor(from)
  const toRgb = parseHexColor(to)

  if (!fromRgb || !toRgb) return from

  const channel = (start: number, end: number) => Math.round(start + (end - start) * ratio)

  return toHex({
    r: channel(fromRgb.r, toRgb.r),
    g: channel(fromRgb.g, toRgb.g),
    b: channel(fromRgb.b, toRgb.b),
  })
}

/**
 * Appearance of the reading scale of a `WorkCard`.
 *
 * While the Work is being read the color travels continuously from amber to
 * orange with the persisted percentage, so no progress threshold is invented.
 * A completed Work is always emerald: that state comes from the backend
 * `status` and is the one that has to be spotted at a glance.
 */
export function readingProgressAppearance(progress: MyReadingProgressDto): ReadingProgressAppearance {
  const percentage = clampPercentage(progress.percentage)
  const ratio = percentage / FULL_PERCENTAGE

  const color =
    progress.status === 'Completed'
      ? COMPLETED_COLOR
      : mixHex(READING_START_COLOR, READING_END_COLOR, ratio)

  return { color, glow: colorWithAlpha(color, GLOW_ALPHA), percentage }
}

/**
 * Appearance of the reading scale of a `ListCard`.
 *
 * Mirrors the colors of `readingProgressAppearance` (amber→orange while in
 * progress, emerald when completed) so the visual language of `WorkCard` is
 * shared with the list cards on `/lists` without duplicating it.
 *
 * Unlike `WorkCard`, a list has no `ReadingProgressStatus`: `100%` is the only
 * signal of completion, and any value strictly between `0` and `100` is
 * "partial" reading.
 */
export function listReadingProgressAppearance(percentage: number): ReadingProgressAppearance {
  const clamped = clampPercentage(percentage)
  const ratio = clamped / FULL_PERCENTAGE

  const color =
    clamped >= FULL_PERCENTAGE
      ? COMPLETED_COLOR
      : mixHex(READING_START_COLOR, READING_END_COLOR, ratio)

  return { color, glow: colorWithAlpha(color, GLOW_ALPHA), percentage: clamped }
}
