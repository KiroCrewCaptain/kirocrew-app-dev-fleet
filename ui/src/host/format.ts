/**
 * Locale formatting. `fmtNumber`, `fmtRelative` and `compareText` are the host's
 * own, from the App SDK. `fmtUnit`, `fmtBytes` and `fmtPercent` are the
 * dashboard's (`i18n/format.ts`), which the SDK does not export; they are built
 * here on the SDK's `fmtNumber`, with the same rules.
 */
import { fmtNumber, type NumberOptions } from '@kirocrew/app-sdk'

export { compareText, fmtNumber, fmtRelative } from '@kirocrew/app-sdk'

export type FormatUnit =
  | 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'
  | 'byte' | 'kilobyte' | 'megabyte' | 'gigabyte' | 'terabyte'
  | 'percent'

/** A ratio as a percentage (`0.42` -> `42%`). */
export function fmtPercent(ratio: number, options?: NumberOptions): string {
  if (!Number.isFinite(ratio)) return '—'
  return fmtNumber(ratio, { style: 'percent', maximumFractionDigits: 0, ...options })
}

/**
 * A quantity with its unit, never broken across lines: every plain space in the
 * formatted value becomes U+00A0, so all 12 locales wrap the same way.
 */
export function fmtUnit(value: number, unit: FormatUnit, options?: NumberOptions): string {
  if (!Number.isFinite(value)) return '—'
  return fmtNumber(value, { style: 'unit', unit, unitDisplay: 'narrow', ...options }).replace(/ /g, '\u00A0')
}

function roundToDigits(value: number, digits: number): number {
  const step = 10 ** digits
  return Math.sign(value) * Math.round(Math.abs(value) * step) / step
}

/** Bytes in base-1000 units (`1.2 GB`), as the dashboard shows them. */
export function fmtBytes(bytes: number, options?: NumberOptions): string {
  if (!Number.isFinite(bytes)) return '—'
  const digits = options?.maximumFractionDigits
  const b = roundToDigits(bytes, digits ?? 0)
  if (Math.abs(b) < 1000) return fmtUnit(b, 'byte', { maximumFractionDigits: 0, ...options })
  const kb = roundToDigits(bytes / 1000, digits ?? 1)
  if (Math.abs(kb) < 1000) return fmtUnit(kb, 'kilobyte', { maximumFractionDigits: 1, ...options })
  const mb = roundToDigits(bytes / 1000 ** 2, digits ?? 1)
  if (Math.abs(mb) < 1000) return fmtUnit(mb, 'megabyte', { maximumFractionDigits: 1, ...options })
  const gb = roundToDigits(bytes / 1000 ** 3, digits ?? 1)
  if (Math.abs(gb) < 1000) return fmtUnit(gb, 'gigabyte', { maximumFractionDigits: 1, ...options })
  return fmtUnit(bytes / 1000 ** 4, 'terabyte', { maximumFractionDigits: 1, ...options })
}
