/**
 * The dashboard components the page uses. Those the App SDK exports
 * (`@kirocrew/app-sdk/ui`) are the host's own, re-exported unchanged. Two are not
 * in the SDK and are local:
 *
 * - `Checkbox`, the dashboard's bare themed checkbox, copied as is;
 * - `SimpleSelect`, the dashboard's Radix select, here a themed native `<select>`
 *   with the same props the page passes (options, labels, value, onChange and an
 *   accessible name). Its open list is drawn by the browser.
 */
import { forwardRef, type CSSProperties, type InputHTMLAttributes } from 'react'

export {
  Badge,
  Btn,
  Card,
  CardTitle,
  Clickable,
  ContentSkeleton,
  EmptyState,
  ErrorNotice,
  InfoTip,
  Modal,
  PageHeader,
  SearchInput,
  StatCard,
} from '@kirocrew/app-sdk/ui'

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ style, ...rest }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      style={{ margin: 0, accentColor: 'var(--accent)', cursor: 'pointer', ...style }}
      {...rest}
    />
  ),
)
Checkbox.displayName = 'Checkbox'

const SELECT_STYLE: CSSProperties = {
  height: 32,
  padding: '0 28px 0 10px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--card)',
  color: 'var(--text)',
  fontSize: 13,
  cursor: 'pointer',
}

export function SimpleSelect({
  options,
  optionLabels,
  value,
  onChange,
  className,
  style,
  ...rest
}: {
  options: string[]
  optionLabels?: string[]
  value: string
  // The page passes a state setter typed to its own option union.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void
  className?: string
  style?: CSSProperties
  'aria-label'?: string
  [key: `data-${string}`]: string | undefined
}) {
  return (
    <select
      className={className}
      style={{ ...SELECT_STYLE, ...style }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    >
      {options.map((opt, i) => (
        <option key={opt} value={opt}>{optionLabels?.[i] ?? opt}</option>
      ))}
    </select>
  )
}
export default SimpleSelect
