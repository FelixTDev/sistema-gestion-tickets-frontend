import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './app-shell'
import { setSession } from '../lib/auth'
import { clearSession } from '../features/auth/auth-service'
import { createTestQueryClient } from '../test/test-query-client'

const categories = [
  { id: 'accounts', name: 'Cuentas del backend', description: '', is_active: true, created_at: '2026-09-12', updated_at: '2026-09-12' },
]

const faqs = [
  { id: 'faq-1', category_id: 'accounts', question: 'Pregunta real publicada', answer: 'Respuesta real publicada', keywords: 'real', is_active: true, created_by: 'staff-1', created_at: '2026-09-12', updated_at: '2026-09-12' },
]

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

function LocationProbe() {
  const location = useLocation()
  return <output aria-label="Ruta actual">{location.pathname}</output>
}

function renderPath(path: string) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <App />
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('rutas y composición del sitio público', () => {
  beforeEach(() => {
    sessionStorage.clear()
    clearSession()
    setSession(null)
    vi.restoreAllMocks()
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input)
      if (url.endsWith('/categories')) return jsonResponse(categories)
      if (url.endsWith('/faqs')) return jsonResponse(faqs)
      return jsonResponse({ message: 'Ruta no prevista' })
    })
  })

  it.each(['/faq', '/preguntas-frecuentes'])('muestra las FAQ reales en %s', async (path) => {
    renderPath(path)
    expect(await screen.findByText('Pregunta real publicada')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Preguntas frecuentes' })).toBeInTheDocument()
  })

  it.each(['/register', '/registro'])('muestra el registro en %s', (path) => {
    renderPath(path)
    expect(screen.getByRole('heading', { level: 1, name: 'Crear cuenta' })).toBeInTheDocument()
  })

  it('muestra la página institucional con misión, visión y objetivos en /nosotros', () => {
    renderPath('/nosotros')
    expect(screen.getByRole('heading', { level: 1, name: /sobre nosotros/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /misión y visión/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /objetivos estratégicos/i })).toBeInTheDocument()
  })

  it('presenta la recuperación como una función no disponible y no permite enviarla', () => {
    renderPath('/recuperar-contrasena')
    expect(screen.getByRole('heading', { level: 1, name: 'Recuperar contraseña' })).toBeInTheDocument()
    expect(screen.getByText('Funcionalidad no disponible')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar enlace/i })).toBeDisabled()
  })

  it('usa el aviso aprobado y navegación real con menú móvil accesible', async () => {
    renderPath('/')
    expect(screen.getAllByText('Portal de consultas y tickets. Las operaciones bancarias se realizan únicamente por los canales oficiales del banco.')[0]).toBeInTheDocument()
    const toggle = screen.getByRole('button', { name: /abrir menú/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('navigation', { name: /navegación móvil/i })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Preguntas frecuentes' })[0]).toHaveAttribute('href', '/faq')
  })

  it('compone el landing con categorías y FAQ recibidas de la API', async () => {
    renderPath('/')
    expect(await screen.findByText('Cuentas del backend')).toBeInTheDocument()
    expect(screen.getByText('Pregunta real publicada')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: /estamos para ayudarte/i })).toBeInTheDocument()
  })

  it.each([
    ['/panel', '/personal'],
    ['/panel/tickets', '/personal/tickets'],
    ['/panel/reportes', '/personal/reportes'],
    ['/panel/asignacion', '/personal/asignacion'],
    ['/panel/conocimiento', '/personal/conocimiento'],
  ])('conserva el destino oficial al migrar %s', (legacyPath, officialPath) => {
    setSession({ accessToken: 'staff-token', user: { id: 'staff-1', full_name: 'Personal', email: 'staff@example.com', role: 'SUPERVISOR' } })
    renderPath(legacyPath)
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent(officialPath)
  })
})
