/**
 * A light stand-in for the host's `@kirocrew/app-sdk/ui`: plain elements with the
 * roles, labels and text the host components render, so a test can find them the
 * way a user would.
 */

import {
  forwardRef,
  useEffect,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'

export const Btn = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean; primary?: boolean; size?: string; variant?: string }
>(function Btn({ danger, primary: _primary, size: _size, variant: _variant, className, ...rest }, ref) {
  // The host colours a destructive label unconditionally (`text-danger`).
  return <button ref={ref} className={[danger ? 'text-danger' : '', className ?? ''].join(' ').trim()} {...rest} />
})

export function Card({ children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest}>{children}</div>
}

export function CardTitle({ children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 {...rest}>{children}</h3>
}

export function Badge({ variant: _variant, children, ...rest }: { variant?: string; children: ReactNode } & HTMLAttributes<HTMLSpanElement>) {
  return <span {...rest}>{children}</span>
}

export function StatCard({
  label,
  value,
  onClick,
  title,
  accent: _accent,
  colorClass: _colorClass,
  delay: _delay,
  active: _active,
  ...rest
}: {
  label: string
  value?: string | number | null
  onClick?: () => void
  title?: string
  accent?: boolean
  colorClass?: string
  delay?: number
  active?: boolean
} & Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onClick'>) {
  return (
    <div title={title} onClick={onClick} {...rest}>
      <div>{label}</div>
      <div>{value === undefined || value === null ? '…' : value}</div>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div data-testid="skeleton" className={className} />
}

export function ContentSkeleton() {
  return <div data-testid="content-skeleton" />
}

export function EmptyState({ title, subtitle, action }: { icon?: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div>
      <div>{title}</div>
      {subtitle ? <div>{subtitle}</div> : null}
      {action}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: string; actions?: ReactNode }) {
  return (
    <div>
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
      {actions}
    </div>
  )
}

export function SearchInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} />
}

export function InfoTip({ text, children, label }: { text?: ReactNode; children?: ReactNode; label?: string }) {
  return <span aria-label={label}>{text ?? children}</span>
}

export function Modal({
  open,
  onClose,
  children,
  title,
  footer,
  ...rest
}: {
  open: boolean
  onClose: () => void
  children?: ReactNode
  title?: ReactNode
  footer?: ReactNode
  [key: string]: unknown
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  const label = typeof rest['aria-label'] === 'string' ? (rest['aria-label'] as string) : undefined
  return (
    <div role="dialog" aria-modal="true" aria-label={label ?? (typeof title === 'string' ? title : undefined)}>
      <span>{title}</span>
      <button type="button" aria-label="Close" onClick={onClose} />
      {children != null && children !== false && children !== '' ? <div>{children}</div> : null}
      {footer ? <div>{footer}</div> : null}
    </div>
  )
}

type ClickableProps = Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'onClick'> & {
  onClick: (e?: React.MouseEvent | React.KeyboardEvent) => void
  disabled?: boolean
}

/** The host's accessible clickable div: role=button, Enter/Space on itself only. */
export const Clickable = forwardRef<HTMLDivElement, ClickableProps>(function Clickable(
  { onClick, disabled, onKeyDown, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        if (e.target !== e.currentTarget || disabled) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(e)
        }
      }}
      {...rest}
    >
      {children}
    </div>
  )
})

export function ErrorNotice({
  message,
  title,
  onDismiss,
  footer,
  testId,
  askAgent,
  actionPlacement,
}: {
  message?: string | null
  title?: string
  variant?: 'block' | 'inline'
  messagePlacement?: 'beside' | 'below'
  onDismiss?: () => void
  footer?: ReactNode
  className?: string
  testId?: string
  askAgent?: boolean
  actionPlacement?: 'beside' | 'below'
  announce?: boolean
}) {
  if (!message && !title) return null
  // The host's layout: the copy in a `flex-1` text column; the Ask-the-agent
  // hand-off beside it, or (actionPlacement "below") on its own row inside it.
  const handoff = askAgent ? <div><button type="button">Ask the agent</button></div> : null
  return (
    <div role="alert" data-testid={testId}>
      <div className="flex-1">
        {title ? <strong>{title}</strong> : null}
        {message ? <span>{message}</span> : null}
        {actionPlacement === 'below' ? handoff : null}
      </div>
      {actionPlacement === 'below' ? null : handoff}
      {footer}
      {onDismiss ? <button type="button" aria-label="Dismiss" onClick={onDismiss} /> : null}
    </div>
  )
}
