import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { renderWithQueryClient } from '../../test/test-query-client'
import { FaqPage } from './pages/faq-page'

const categories = [
  { id: 'accounts', name: 'Cuentas', description: null, is_active: true, created_at: '2026-09-12', updated_at: '2026-09-12' },
  { id: 'cards', name: 'Tarjetas', description: null, is_active: true, created_at: '2026-09-12', updated_at: '2026-09-12' },
  { id: 'hidden', name: 'Oculta', description: null, is_active: false, created_at: '2026-09-12', updated_at: '2026-09-12' },
]

const faqs = [
  { id: 'faq-1', category_id: 'accounts', question: '¿Cómo consulto mi cuenta?', answer: 'Desde los canales informativos.', keywords: 'cuenta consulta', is_active: true, created_by: 'staff-1', created_at: '2026-09-12', updated_at: '2026-09-12' },
  { id: 'faq-2', category_id: 'cards', question: '¿Cómo bloqueo una tarjeta?', answer: 'Usa un canal oficial.', keywords: 'tarjeta bloqueo seguridad', is_active: true, created_by: 'staff-1', created_at: '2026-09-12', updated_at: '2026-09-12' },
  { id: 'faq-3', category_id: 'hidden', question: 'FAQ inactiva', answer: 'No mostrar.', keywords: 'oculta', is_active: false, created_by: 'staff-1', created_at: '2026-09-12', updated_at: '2026-09-12' },
]

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

function mockFaqRequests(currentFaqs = faqs, currentCategories = categories) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = String(input)
    return url.endsWith('/categories') ? jsonResponse(currentCategories) : jsonResponse(currentFaqs)
  })
}

function renderFaqPage() {
  return renderWithQueryClient(<MemoryRouter><FaqPage /></MemoryRouter>)
}

describe('página pública de preguntas frecuentes', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('expone un título principal semántico', () => {
    mockFaqRequests()
    renderFaqPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Preguntas frecuentes' })).toBeInTheDocument()
  })

  it('carga las FAQ activas y filtra por categoría activa', async () => {
    mockFaqRequests()
    renderFaqPage()

    expect(await screen.findByText('¿Cómo consulto mi cuenta?')).toBeInTheDocument()
    expect(screen.getByText('¿Cómo bloqueo una tarjeta?')).toBeInTheDocument()
    expect(screen.queryByText('FAQ inactiva')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Oculta' })).not.toBeInTheDocument()
    expect(screen.getByText('Cuentas', { selector: '[data-faq-category]' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Cuentas' }))
    expect(screen.getByText('¿Cómo consulto mi cuenta?')).toBeInTheDocument()
    expect(screen.queryByText('¿Cómo bloqueo una tarjeta?')).not.toBeInTheDocument()
  })

  it('porta el buscador y la llamada a conversar con el asistente', async () => {
    mockFaqRequests()
    renderFaqPage()
    await screen.findByText('¿Cómo consulto mi cuenta?')

    expect(screen.getByRole('searchbox', { name: /buscar preguntas/i })).toHaveAttribute('placeholder', 'Busca una pregunta o palabra clave…')
    expect(screen.getByRole('link', { name: /habla con nuestro asistente/i })).toHaveAttribute('href', '/chat')
  })

  it('busca localmente por pregunta o palabras clave y combina el filtro', async () => {
    mockFaqRequests()
    renderFaqPage()
    await screen.findByText('¿Cómo consulto mi cuenta?')

    await userEvent.type(screen.getByRole('searchbox', { name: /buscar preguntas/i }), 'seguridad')
    expect(screen.getByText('¿Cómo bloqueo una tarjeta?')).toBeInTheDocument()
    expect(screen.queryByText('¿Cómo consulto mi cuenta?')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Cuentas' }))
    expect(screen.getByText(/no encontramos preguntas/i)).toBeInTheDocument()
  })

  it('muestra estado de carga', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise<Response>(() => undefined))
    renderFaqPage()
    expect(screen.getByRole('status')).toHaveTextContent(/cargando preguntas frecuentes/i)
  })

  it('muestra error y permite reintentar', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ message: 'Error' }, 500))
    renderFaqPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos cargar las preguntas/i)
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(4))
  })

  it('muestra un estado vacío cuando no existen FAQ activas', async () => {
    mockFaqRequests([], categories)
    renderFaqPage()
    expect(await screen.findByText(/aún no hay preguntas frecuentes disponibles/i)).toBeInTheDocument()
  })
})
