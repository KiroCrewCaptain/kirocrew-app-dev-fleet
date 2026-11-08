/**
 * The two overlay helpers the row menu took from the dashboard's
 * `components/overlayRoot`. A bundle cannot reach the dashboard's overlay root, so
 * the menu portals into `document.body`, which is where that root lives too. The
 * "crew overlay hidden" close signal has no bundle-side source, so it never fires.
 */
import { type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export function OverlayPortal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body)
}

export function useCloseWhenCrewHidden(_open: boolean, _close: () => void): void {}
