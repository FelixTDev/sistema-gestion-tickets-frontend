import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestQueryClient } from '../../test/test-query-client'
import { ProfilePage } from './pages/profile-page'

const profile = {
  id: 'profile-1', full_name: 'Cliente Prueba', email: 'cliente@example.com', phone: '999111222', role: 'CLIENTE',
  email_verified: false, created_at: '2026-09-20T10:00:00Z', updated_at: '2026-09-20T10:00:00Z',
}
const preferences = {
  in_app_enabled: true, email_enabled: true, assignment_enabled: true, status_change_enabled: true,
  comment_enabled: true, sla_enabled: true, preferred_language: 'es' as const, timezone: 'America/Lima', security_events_enabled: true,
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

function renderPage() {
  const queryClient = createTestQueryClient()
  return render(<QueryClientProvider client={queryClient}><MemoryRouter><ProfilePage /></MemoryRouter></QueryClientProvider>)
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('página de perfil', () => {
  it('carga perfil y preferencias desde el backend y permite actualizar el nombre', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input)
      if (init?.method === 'PATCH' && url.endsWith('/users/me/profile')) return Promise.resolve(jsonResponse({ ...profile, full_name: 'Nombre actualizado' }))
      if (url.endsWith('/users/me/profile')) return Promise.resolve(jsonResponse(profile))
      if (url.endsWith('/users/me/preferences')) return Promise.resolve(jsonResponse(preferences))
      return Promise.resolve(jsonResponse({ message: 'Unexpected request' }, 500))
    })
    renderPage()

    expect(await screen.findByDisplayValue('Cliente Prueba')).toBeInTheDocument()
    expect(screen.getByDisplayValue('cliente@example.com')).toBeDisabled()
    await userEvent.clear(screen.getByLabelText(/nombre completo/i))
    await userEvent.type(screen.getByLabelText(/nombre completo/i), 'Nombre actualizado')
    await userEvent.click(screen.getByRole('button', { name: /guardar perfil/i }))

    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/users\/me\/profile$/), expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ full_name: 'Nombre actualizado', phone: '999111222' }) }))
    expect(await screen.findByText(/perfil actualizado/i)).toBeInTheDocument()
  })

  it('expone el error de preferencias con una acción de reintento', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)
      if (url.endsWith('/users/me/profile')) return Promise.resolve(jsonResponse(profile))
      return Promise.resolve(jsonResponse({ message: 'No disponible' }, 503))
    })
    renderPage()

    expect(await screen.findByText(/no pudimos cargar tus preferencias/i)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /reintentar/i }).length).toBeGreaterThan(0)
  })
})
