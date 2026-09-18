import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, renderHook, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TicketAssignment } from './components/ticket-assignment'
import { useAssignTicketMutation } from './hooks/use-tickets'
import type { TicketRead } from './types/ticket-types'

vi.mock('../auth/auth-provider', () => ({ useAuth: () => ({ user: { id: 'supervisor-1', full_name: 'Supervisión', email: 'supervisor@example.test', role: 'SUPERVISOR' }, session: null, isLoading: false, signIn: vi.fn(), signOut: vi.fn() }) }))

const ticket: TicketRead = { id: 'ticket-1', tracking_code: 'TCK-001', client_id: 'client-1', conversation_id: null, category_id: 'cat-1', subject: 'Consulta', description: 'Descripción', priority: 'MEDIA', status: 'NUEVO', source: 'MANUAL', assigned_advisor_id: null, created_at: '2026-09-14T00:00:00Z', assigned_at: null, resolved_at: null, closed_at: null, cancelled_at: null }
const assigned = { ...ticket, assigned_advisor_id: 'advisor-1', status: 'ASIGNADO' as const }
const advisors = [{ id: 'advisor-1', full_name: 'Ana Asesora', email: 'ana@example.test', role: 'ASESOR' }, { id: 'supervisor-2', full_name: 'Otro supervisor', email: 'sup@example.test', role: 'SUPERVISOR' }]
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

function Wrapper({ children }: { children: ReactNode }) { return createElement(QueryClientProvider, { client: new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } }) }, children) }

describe('asignación de tickets del supervisor', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('confirms before posting the real advisor id and exposes safe server failures', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => String(input).endsWith('/users/advisors') ? response(advisors) : init?.method === 'POST' ? response({ detail: 'internal conflict' }, 409) : response({ detail: 'unexpected' }, 500))
    render(<Wrapper><TicketAssignment ticket={ticket} /></Wrapper>)
    await userEvent.selectOptions(await screen.findByLabelText('Asesor activo'), 'advisor-1')
    expect(screen.getByRole('option', { name: 'Ana Asesora' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Otro supervisor' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Asignar ticket' }))
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false)
    const dialog = screen.getByRole('dialog', { name: /confirmar asignación/i })
    await userEvent.click(within(dialog).getByRole('button', { name: /confirmar asignación/i }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /confirmar asignación/i })).not.toBeInTheDocument())
    expect(screen.getByRole('alert')).toHaveTextContent(/no pudimos asignar/i)
    const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')
    expect(String(post?.[0])).toContain('/tickets/ticket-1/assignments')
    expect(JSON.parse(String(post?.[1]?.body))).toEqual({ advisor_id: 'advisor-1' })
  })

  it('invalidates the detail, history, comments, client and operational lists after success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response(assigned))
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    const { result } = renderHook(() => useAssignTicketMutation(ticket.id), { wrapper })
    await act(async () => { await result.current.mutateAsync({ advisor_id: 'advisor-1' }) })
    expect(invalidate.mock.calls.map(([filters]) => filters)).toEqual(expect.arrayContaining([
      { queryKey: ['ticket-history', 'ticket-1'] }, { queryKey: ['ticket-comments', 'ticket-1'] }, { queryKey: ['client-tickets'] }, { queryKey: ['operational-tickets'] },
    ]))
  })
})
