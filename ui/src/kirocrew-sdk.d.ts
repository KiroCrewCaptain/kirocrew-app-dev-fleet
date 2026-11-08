/**
 * Types for the two host modules this bundle imports. They are not on npm: the
 * dashboard's import map serves them at runtime (`/vendor/*.mjs`), so only the
 * names this page uses are declared. Every name below exists on a host before App
 * Kit level 1, so each is a plain named import; `tests/test_manifest_contract.py`
 * checks the built bundle for that.
 *
 * The dashboard components are declared with open props: the page passes them the
 * props it passed the dashboard's own copies, which the host owns.
 */

declare module '@kirocrew/app-sdk' {
  export interface AppApi {
    raw(path: string, init?: RequestInit): Promise<Response>
    request<T = unknown>(path: string, init?: RequestInit): Promise<T>
    get<T = unknown>(path: string, init?: RequestInit): Promise<T>
    post<T = unknown>(path: string, body?: unknown, init?: RequestInit): Promise<T>
  }

  /** A scoped non-2xx: `body` is the raw response text. */
  export interface AppApiError extends Error {
    readonly status: number
    readonly body: string
  }

  export interface ChatLaunchOptions {
    agent?: string
    message?: string
    slotKey?: string
    autoSend?: boolean
  }

  export type NumberOptions = Omit<Intl.NumberFormatOptions, 'localeMatcher'>

  export function useAppApi(): AppApi
  export function useNavigate(): (path: string) => void
  export function useNotify(): (message: string, opts?: { type?: 'info' | 'success' | 'error' }) => void
  export function useChatLauncher(): { openChat: (opts?: ChatLaunchOptions) => void }
  export function useLanguageGeneration(): number
  export function activeLocale(): string
  export function fmtNumber(value: number, options?: NumberOptions): string
  export function fmtRelative(value: Date | string | number | null | undefined, options?: Record<string, unknown>): string
  export function compareText(a: string, b: string): number
}

declare module '@kirocrew/app-sdk/ui' {
  import type { ComponentType, ForwardRefExoticComponent, RefAttributes } from 'react'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Open = any

  export const Btn: ForwardRefExoticComponent<Open & RefAttributes<HTMLButtonElement>>
  export const Card: ComponentType<Open>
  export const CardTitle: ComponentType<Open>
  export const Badge: ComponentType<Open>
  export const StatCard: ComponentType<Open>
  export const EmptyState: ComponentType<Open>
  export const ContentSkeleton: ComponentType<Open>
  export const PageHeader: ComponentType<Open>
  export const SearchInput: ComponentType<Open>
  export const InfoTip: ComponentType<Open>
  export const Modal: ComponentType<Open>
  export const ErrorNotice: ComponentType<Open>
  export const Clickable: ForwardRefExoticComponent<Open & RefAttributes<HTMLDivElement>>
}
