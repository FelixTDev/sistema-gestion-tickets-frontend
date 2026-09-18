import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '../../test/test-query-client'
import { KnowledgePage } from './pages/knowledge-page'

const category = { id: '22222222-2222-4222-8222-222222222222', name: 'Cuentas', description: 'Consultas de cuentas.', is_active: true, created_at: '2026-09-14T00:00:00Z', updated_at: '2026-09-14T00:00:00Z' }
const faq = { id: '11111111-1111-4111-8111-111111111111', category_id: category.id, question: '¿Cómo consulto mi cuenta?', answer: 'Usa un canal oficial.', keywords: 'cuenta, consulta', is_active: true, created_by: 'staff-1', created_at: '2026-09-14T00:00:00Z', updated_at: '2026-09-14T00:00:00Z' }
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('gestión de conocimiento', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('renders active records and requires confirmation before deactivation', async () => {
    let active = true
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input)
      if (url.endsWith('/categories')) return response([category])
      if (url.endsWith(`/faqs/${faq.id}/status`)) { active = false; return response({ ...faq, is_active: false }) }
      return response(active ? [faq] : [])
    })
    renderWithQueryClient(<KnowledgePage />)
    expect(await screen.findByText(faq.question)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Desactivar' }))
    expect(screen.getByRole('dialog', { name: /confirmar desactivación/i })).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(false)
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Desactivar' }))
    await waitFor(() => expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(true))
    const patchCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH')
    expect(String(patchCall?.[0])).toContain(`/faqs/${faq.id}/status`)
    expect(JSON.parse(String(patchCall?.[1]?.body))).toEqual({ is_active: false })
    await waitFor(() => expect(screen.queryByText(faq.question)).not.toBeInTheDocument())
  })

  it('confirms category deactivation and preserves only active categories', async () => {
    let active = true
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input)
      if (url.endsWith('/faqs')) return response([])
      if (url.endsWith(`/categories/${category.id}/status`)) { active = false; return response({ ...category, is_active: false }) }
      return response(active ? [category] : [])
    })
    renderWithQueryClient(<KnowledgePage />)
    await userEvent.click(await screen.findByRole('tab', { name: 'Categorías' }))
    expect(await screen.findByText(category.name)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Desactivar' }))
    expect(screen.getByRole('dialog', { name: /confirmar desactivación/i })).toHaveTextContent(category.name)
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Desactivar' }))
    await waitFor(() => expect(screen.queryByText(category.name)).not.toBeInTheDocument())
  })

  it('exposes validation for a new FAQ without sending invalid data', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => String(input).endsWith('/categories') ? response([category]) : response([]))
    renderWithQueryClient(<KnowledgePage />)
    await userEvent.click(screen.getByRole('button', { name: /nueva faq/i }))
    await userEvent.click(screen.getByRole('button', { name: /crear faq/i }))
    expect(await screen.findByText(/la pregunta debe tener al menos 3/i)).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false)
  })

  it('keeps the page accessible while knowledge queries are loading and offers no delete action', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise<Response>(() => undefined))
    const { queryClient } = renderWithQueryClient(<KnowledgePage />)
    expect(screen.getByRole('heading', { level: 1, name: /gestión de conocimiento/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument()
    expect(queryClient).toBeDefined()
  })

  it('mantiene visible el error de guardado dentro del diálogo activo', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input)
      if (init?.method === 'POST') return response({ message: 'No disponible' }, 500)
      if (url.endsWith('/categories')) return response([category])
      return response([])
    })
    renderWithQueryClient(<KnowledgePage />)
    await userEvent.click(screen.getByRole('button', { name: /nueva faq/i }))
    const dialog = screen.getByRole('dialog', { name: /nueva faq/i })
    await userEvent.selectOptions(within(dialog).getByLabelText(/categoría/i), category.id)
    await userEvent.type(within(dialog).getByLabelText(/pregunta/i), '¿Cómo consulto movimientos?')
    await userEvent.type(within(dialog).getByLabelText(/respuesta/i), 'Consulta la información disponible en el portal.')
    await userEvent.type(within(dialog).getByLabelText(/palabras clave/i), 'movimientos')
    await userEvent.click(within(dialog).getByRole('button', { name: /crear faq/i }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(/no pudimos guardar el cambio/i)
  })
})
