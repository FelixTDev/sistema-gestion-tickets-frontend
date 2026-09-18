import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../app/app-shell'
import { clearSession } from '../auth/auth-service'
import { setSession } from '../../lib/auth'
import { createTestQueryClient } from '../../test/test-query-client'

const client = { id: 'client-1', full_name: 'Cliente Demo', email: 'cliente@example.com', role: 'CLIENTE' as const }

function renderPortal(path: string) {
  const queryClient = createTestQueryClient()
  return render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={[path]}><App /></MemoryRouter></QueryClientProvider>)
}

describe('portal visual del cliente', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    clearSession()
    setSession({ accessToken: 'client-token', user: client })
    vi.restoreAllMocks()
  })

  it('presenta las cuatro estadísticas del dashboard sin deltas inventados', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve(new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } })))
    renderPortal('/cliente')

    expect(await screen.findByText('Total de tickets')).toBeInTheDocument()
    expect(screen.getByText('Nuevos')).toBeInTheDocument()
    expect(screen.getByText('En atención')).toBeInTheDocument()
    expect(screen.getByText('Resueltos')).toBeInTheDocument()
    expect(screen.queryByText(/%|vs\.|delta|tendencia/i)).not.toBeInTheDocument()
  })
})
