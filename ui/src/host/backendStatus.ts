/**
 * Banner copy for an app whose backend is repeatedly failing to restart: the
 * dashboard's `utils/backendStatus`, copied, with its two strings in this app's
 * own catalogs (`apps.backend.*`).
 */
import { i18nT } from '../i18n'

export interface RestartExhausted {
  attempts: number
}

export interface BackendStatus {
  running?: boolean
  port?: number
  healthy?: boolean
  pid?: number
  restart_exhausted?: RestartExhausted | null
}

export interface BackendUnavailableNotice {
  title: string
  message: string
}

export function restartExhaustedNotice(
  appLabel: string,
  status: BackendStatus | null | undefined,
): BackendUnavailableNotice | null {
  const exhausted = status?.restart_exhausted
  if (!exhausted) return null
  const count =
    Number.isFinite(exhausted.attempts) && exhausted.attempts > 0
      ? Math.floor(exhausted.attempts)
      : 1
  return {
    title: i18nT('apps.backend.restart_exhausted_title', { app: appLabel }),
    message: i18nT('apps.backend.restart_exhausted_message', { app: appLabel, count }),
  }
}
