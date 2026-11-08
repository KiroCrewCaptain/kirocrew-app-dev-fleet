/**
 * A light stand-in for the host's `@kirocrew/app-sdk`.
 *
 * Only the names the bundle uses, with the host's documented behaviour where a
 * test depends on it. The scoped client goes through `globalThis.fetch`, the way
 * the host's does, so the page tests moved from Kiro Crew keep answering requests
 * by stubbing `fetch`; like the host's, it throws an `AppApiError` (status and
 * unparsed body) on a non-2xx. It does NOT apply the path fence: that is the
 * host's, and `permissions.test.ts` pins what this app's grant covers. The
 * `stub*` / `resetStubSdk` exports are test controls; no host module has them.
 */

import { vi } from 'vitest'
import type { AppApi, ChatLaunchOptions, NumberOptions } from '@kirocrew/app-sdk'

let locale = 'en'

/** The host's active language for the next lookups. */
export function stubLocale(next: string): void {
  locale = next
}

export const stubOpenChat = vi.fn<(opts?: ChatLaunchOptions) => void>()
export const stubNavigate = vi.fn<(path: string) => void>()
export const stubNotify = vi.fn<(message: string, opts?: { type?: 'info' | 'success' | 'error' }) => void>()

class StubAppApiError extends Error {
  readonly status: number
  readonly body: string
  constructor(status: number, body: string) {
    super(`API ${status}: ${body}`)
    this.name = 'AppApiError'
    this.status = status
    this.body = body
  }
}

async function raw(path: string, init?: RequestInit): Promise<Response> {
  const res = await globalThis.fetch(path, init)
  if (!res.ok) throw new StubAppApiError(res.status, await res.text().catch(() => ''))
  return res
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await raw(path, init)
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export const stubApi: AppApi = {
  raw,
  request,
  get: (path, init) => request(path, { ...init, method: 'GET' }),
  post: (path, body, init) => request(path, {
    ...init,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    body: JSON.stringify(body),
  }),
}

export function resetStubSdk(): void {
  locale = 'en'
  stubOpenChat.mockReset()
  stubNavigate.mockReset()
  stubNotify.mockReset()
}

export function activeLocale(): string {
  return locale
}

export function useLanguageGeneration(): number {
  return 0
}

export function fmtNumber(value: number, options?: NumberOptions): string {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat(locale, options).format(value)
}

const RELATIVE_THRESHOLDS: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
  { unit: 'year', seconds: 365 * 86400 },
  { unit: 'month', seconds: 30 * 86400 },
  { unit: 'day', seconds: 86400 },
  { unit: 'hour', seconds: 3600 },
  { unit: 'minute', seconds: 60 },
  { unit: 'second', seconds: 1 },
]

/** The host's relative time: narrow style, `numeric: auto`, truncated toward zero. */
export function fmtRelative(value: Date | string | number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  const delta = (d.getTime() - Date.now()) / 1000
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'narrow' })
  const magnitude = Math.abs(delta)
  if (magnitude < 1) return rtf.format(0, 'second')
  for (const { unit, seconds } of RELATIVE_THRESHOLDS) {
    if (magnitude >= seconds) return rtf.format(Math.trunc(delta / seconds), unit)
  }
  return rtf.format(0, 'second')
}

export function compareText(a: string, b: string): number {
  return new Intl.Collator(locale, { numeric: true, sensitivity: 'base' }).compare(a, b)
}

export function useAppApi(): AppApi {
  return stubApi
}

export function useNavigate(): (path: string) => void {
  return stubNavigate
}

export function useNotify() {
  return stubNotify
}

export function useChatLauncher(): { openChat: (opts?: ChatLaunchOptions) => void } {
  return { openChat: stubOpenChat }
}
