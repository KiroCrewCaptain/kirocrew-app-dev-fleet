/**
 * Dev Fleet API client, over the host's permission-scoped client (`useAppApi`).
 *
 * Most routes are served by the SPAWNED backend, reverse-proxied at
 * `/apps/dev-fleet/api/...`, which this app's `permissions.api` declares. Three are
 * served by the gateway process itself under `/api/apps/dev-fleet/...`:
 * `make-live` and `restart-gateway` touch the live-target pointer (or its cutover
 * latch), which is masked from the sandboxed backend and everything it spawns, and
 * `pod-token` mints a pod's dashboard token, which the pod refuses to issue to the
 * sandboxed backend. `postGateway` targets that namespace. The built-in's compiled
 * page called it as dashboard code; this bundle calls it through the scoped
 * client, which refuses it until the app's grant covers it (see PORTING.md).
 *
 * A refusal is a `DevFleetApiError` carrying the status, the raw body and the
 * backend's own sentence (`{"error": ...}`), so the page can tell a state to act
 * on (the sync single-flight 409) from a failure to report.
 */
import type { AppApi } from '@kirocrew/app-sdk'
import { i18nT } from './i18n'

const BASE = '/apps/dev-fleet/api'
export const GATEWAY_BASE = '/api/apps/dev-fleet'

let bound: AppApi | null = null

/** Bind the host's scoped client. The root component calls it on every render. */
export function bindAppApi(api: AppApi): void {
  bound = api
}

function client(): AppApi {
  if (!bound) throw new Error('Dev Fleet API used before the page bound the host client')
  return bound
}

export class DevFleetApiError extends Error {
  readonly status: number
  readonly body: string
  /** The refusal came from an access proxy in front of the gateway, not the gateway. */
  readonly edgeChallenge: boolean
  constructor(status: number, message: string, body: string, edgeChallenge = false) {
    super(message)
    this.name = 'DevFleetApiError'
    this.status = status
    this.body = body
    this.edgeChallenge = edgeChallenge
  }
}

const HTML_DOCUMENT_START = /^<(?:!doctype\s|html[\s>])/i
const looksLikeHtmlDocument = (body: string): boolean => HTML_DOCUMENT_START.test(body.trim())

/**
 * An access proxy's sign-in page: a 401/403 whose body is an HTML document. The
 * dashboard's own client also reads the content type; the host's scoped-client
 * error carries only the status and the body, so the body decides here.
 */
const isEdgeChallenge = (status: number, body: string): boolean =>
  (status === 401 || status === 403) && looksLikeHtmlDocument(body)

/** The dashboard's `friendlyErrText` / `statusErrText` order, for this app's refusals. */
function messageOf(status: number, body: string): string {
  if (isEdgeChallenge(status, body)) return i18nT('api.client.proxy_challenge_reload')
  const trimmed = body.trim()
  try {
    const parsed = JSON.parse(trimmed) as { error?: unknown; detail?: unknown; message?: unknown }
    for (const field of [parsed?.error, parsed?.detail, parsed?.message]) {
      if (typeof field === 'string' && field) return field
    }
  } catch { /* not JSON */ }
  if (trimmed && !looksLikeHtmlDocument(trimmed)) return body
  return (status === 502 || status === 503) && looksLikeHtmlDocument(body)
    ? i18nT('api.client.server_temporarily_unavailable_http_status', { status })
    : `HTTP ${status}`
}

function translate(e: unknown): never {
  const err = e as { name?: string; status?: unknown; body?: unknown }
  if (err && err.name === 'AppApiError' && typeof err.status === 'number') {
    const body = typeof err.body === 'string' ? err.body : ''
    throw new DevFleetApiError(err.status, messageOf(err.status, body), body, isEdgeChallenge(err.status, body))
  }
  throw e
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function request<T = any>(path: string, opts?: RequestInit, base: string = BASE): Promise<T> {
  try {
    return await client().request<T>(base + path, { credentials: 'same-origin', ...opts })
  } catch (e) {
    return translate(e)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function get<T = any>(path: string): Promise<T> {
  return request<T>(path)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function post<T = any>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/** POST to a route the GATEWAY process serves (`/api/apps/dev-fleet/...`). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function postGateway<T = any>(path: string, body: unknown): Promise<T> {
  return request<T>(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    GATEWAY_BASE,
  )
}

/** The backend's restart-handshake health (`/apps/dev-fleet/api/health`), unparsed. */
export function rawHealth(signal: AbortSignal): Promise<Response> {
  return client().raw(`${BASE}/health`, { credentials: 'same-origin', signal })
}

/** This app's backend status from the host's app list, or null when it cannot be read. */
export async function backendStatus(): Promise<unknown> {
  const apps = await request<Array<{ name?: string; backend_status?: unknown }>>('', undefined, '/api/apps')
  const self = Array.isArray(apps) ? apps.find((a) => a.name === 'dev-fleet') : undefined
  return self?.backend_status ?? null
}
