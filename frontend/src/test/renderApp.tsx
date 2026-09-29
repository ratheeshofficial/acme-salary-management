import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'

import { AppRoutes } from '../routes/AppRoutes.tsx'

export function renderWithProviders(ui: ReactNode, path = '/') {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <ChakraProvider value={defaultSystem}>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
      </QueryClientProvider>
    </ChakraProvider>,
  )
}

export function renderRoutes(path: string) {
  return renderWithProviders(<AppRoutes />, path)
}
