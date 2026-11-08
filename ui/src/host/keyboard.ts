/**
 * Keyboard helpers the built-in page took from the dashboard's own hooks
 * (`hooks/useImeGuard`, `hooks/useMenuKeyboard`, `hooks/useDialogFocusTrap`).
 * A bundle cannot import those, and the App SDK exports only `useImeGuard`, so the
 * parts the page uses are copied here with the same behaviour. The dashboard's
 * "crew overlay hidden" signal has no bundle-side equivalent; a page an app hosts
 * is never under that overlay, so the hooks run whenever they are enabled.
 */
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

const POST_COMPOSITION_MS = 50
const HANGUL = /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]$/

export interface ImeLatch {
  onCompositionStart: () => void
  onCompositionEnd: (data?: string) => void
  isLatched: () => boolean
  reset: () => void
  claimKey: (e: globalThis.KeyboardEvent) => boolean
}

/** True from compositionstart until 50 ms after compositionend (Hangul: at once). */
export function createImeLatch(): ImeLatch {
  let latched = false
  let timer: ReturnType<typeof setTimeout> | undefined
  return {
    onCompositionStart() {
      clearTimeout(timer)
      latched = true
    },
    onCompositionEnd(data?: string) {
      if (data && HANGUL.test(data)) { clearTimeout(timer); latched = false; return }
      latched = true
      timer = setTimeout(() => { latched = false }, POST_COMPOSITION_MS)
    },
    isLatched: () => latched,
    reset() {
      clearTimeout(timer)
      latched = false
    },
    claimKey(e: globalThis.KeyboardEvent) {
      const composing = latched || e.isComposing || e.keyCode === 229
      if (!composing) return true
      if (!e.isComposing && e.keyCode !== 229) e.preventDefault()
      e.stopPropagation()
      return false
    },
  }
}

/** A latch fed by document-level composition events while `enabled`. */
export function useDocumentImeLatch(enabled = true): ImeLatch {
  const latchRef = useRef<ImeLatch>()
  if (!latchRef.current) latchRef.current = createImeLatch()
  const latch = latchRef.current
  useEffect(() => {
    if (!enabled) return
    latch.reset()
    const onCompositionStart = () => latch.onCompositionStart()
    const onCompositionEnd = () => latch.onCompositionEnd()
    const onRecover = () => latch.reset()
    document.addEventListener('compositionstart', onCompositionStart, true)
    document.addEventListener('compositionend', onCompositionEnd, true)
    document.addEventListener('focusout', onRecover, true)
    return () => {
      document.removeEventListener('compositionstart', onCompositionStart, true)
      document.removeEventListener('compositionend', onCompositionEnd, true)
      document.removeEventListener('focusout', onRecover, true)
      latch.reset()
    }
  }, [enabled, latch])
  return latch
}

/** Arrow/Home/End roving focus and Tab wrap for a menu. True when the key was handled. */
export function handleMenuKeydown(
  e: globalThis.KeyboardEvent,
  getItems: () => HTMLElement[],
  imeLatch: ImeLatch,
): boolean {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
    if (e.altKey || e.ctrlKey || e.metaKey) return false
    const focusable = getItems()
    if (focusable.length === 0) return false
    if (!imeLatch.claimKey(e)) return true
    e.preventDefault()
    if (e.key === 'Home') { focusable[0].focus(); return true }
    if (e.key === 'End') { focusable[focusable.length - 1].focus(); return true }
    const idx = focusable.indexOf(document.activeElement as HTMLElement)
    const next = idx === -1
      ? (e.key === 'ArrowDown' ? 0 : focusable.length - 1)
      : (idx + (e.key === 'ArrowDown' ? 1 : -1) + focusable.length) % focusable.length
    focusable[next].focus()
    return true
  }
  if (e.key !== 'Tab') return false
  const focusable = getItems()
  if (focusable.length === 0) return false
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    if (!imeLatch.claimKey(e)) return true
    e.preventDefault()
    last.focus()
    return true
  }
  if (!e.shiftKey && document.activeElement === last) {
    if (!imeLatch.claimKey(e)) return true
    e.preventDefault()
    first.focus()
    return true
  }
  return false
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'

let nextTrapOrder = 0
const armedTabTraps = new Set<number>()
const newestArmedTrap = (): number => Math.max(-1, ...armedTabTraps)

/** Focus the first control, close on Escape, and keep Tab inside `containerRef`. */
export function useDialogFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  onEscape: () => void,
  { enabled = true, handleEscape = true, restoreFocus = true }: {
    enabled?: boolean
    handleEscape?: boolean
    restoreFocus?: boolean
  } = {},
): void {
  useEffect(() => {
    const restoreTo = restoreFocus ? (document.activeElement as HTMLElement | null) : null
    const first = Array.from(containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
      .find((el) => el.tabIndex >= 0)
    ;(first ?? containerRef.current)?.focus({ preventScroll: true })
    return () => restoreTo?.focus?.({ preventScroll: true })
  }, [containerRef, restoreFocus])

  const imeLatch = useDocumentImeLatch(enabled)
  const mountOrderRef = useRef(0)
  useLayoutEffect(() => { mountOrderRef.current = ++nextTrapOrder }, [])

  useLayoutEffect(() => {
    if (!enabled) return
    const order = mountOrderRef.current
    armedTabTraps.add(order)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && handleEscape) {
        if (!imeLatch.claimKey(e)) return
        onEscape()
        return
      }
      const container = containerRef.current
      if (e.key !== 'Tab' || !container) return
      if (newestArmedTrap() !== order) return
      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter((el) => el.offsetParent !== null && el.tabIndex >= 0)
      if (!items.length) return
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      const active = document.activeElement
      const wrapsForward = !e.shiftKey && active === lastEl
      const wrapsBackward = e.shiftKey && (active === firstEl || active === container)
      const refocuses = !wrapsForward && !wrapsBackward && !container.contains(active)
      if (!wrapsForward && !wrapsBackward && !refocuses) return
      if (!imeLatch.claimKey(e)) return
      e.preventDefault()
      ;(wrapsBackward ? lastEl : firstEl).focus()
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      armedTabTraps.delete(order)
    }
  }, [containerRef, onEscape, enabled, handleEscape, imeLatch])
}
