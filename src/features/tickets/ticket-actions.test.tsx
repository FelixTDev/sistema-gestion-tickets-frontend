import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../auth/auth-provider'
import { clearSession } from '../auth/auth-service'
import { setSession } from '../../lib/auth'
import { createTestQueryClient } from '../../test/test-query-client'
import { TicketActions } from './components/ticket-actions'
import type { TicketRead } from './types/ticket-types'

const advisor = { id: 'advisor-1', full_name: 'Asesor', email: 'advisor@example.com', role: 'ASESOR' as const }
const ticket: TicketRead = {
  id: '11111111-1111-4111-8111-111111111111', tracking_code: 'TCK-001', client_id: 'client-1',
  conversation_id: null, category_id: 'cat-1', subject: 'Consulta', description: 'Detalle', priority: 'MEDIA',
  status: 'ASIGNADO', source: 'MANUAL', assigned_advisor_id: advisor.id, created_at: '2026-09-15T00:00:00Z',
  assigned_at: null, resolved_at: null, closed_at: null, cancelled_at: null,
}

describe('acciones de ticket', () => {
  beforeEach(() => {
    sessionStorage.clear()
    clearSession()
    setSession({ accessToken: 'advisor-token', user: advisor })
    vi.restoreAllMocks()
  })

  it('muestra el error de la mutación dentro del diálogo activo', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Temporal' }), { status: 500, headers: { 'Content-Type': 'application/json' } }))
    const queryClient = createTestQueryClient()
    render(<QueryClientProvider client={queryClient}><MemoryRouter><AuthProvider><TicketActions ticket={ticket} /></AuthProvider></MemoryRouter></QueryClientProvider>)

    await userEvent.click(screen.getByRole('button', { name: /marcar en atención/i }))
    const dialog = screen.getByRole('dialog', { name: /confirmar: marcar en atención/i })
    await userEvent.click(within(dialog).getByRole('button', { name: /confirmar/i }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(/no pudimos completar la acción/i)
  })
})
