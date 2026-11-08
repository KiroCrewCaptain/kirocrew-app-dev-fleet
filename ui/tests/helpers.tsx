/** Render with the one provider the page needs from its host: a react-query client. */
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactElement, ReactNode } from 'react'

export function renderWithProviders(
  ui: ReactElement,
  { queryDefaults, ...renderOptions }: { route?: string; queryDefaults?: Record<string, unknown> } & RenderOptions = {},
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, ...queryDefaults } } })
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return { queryClient, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
