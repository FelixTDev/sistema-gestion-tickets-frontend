import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import { clearSession } from '../features/auth/auth-service'
import { setSession } from '../lib/auth'
import { createTestQueryClient } from '../test/test-query-client'
import type { Role } from '../types/auth'
import { App } from './app-shell'

function LocationProbe() { const location = useLocation(); return <output data-testid="location">{location.pathname}</output> }
function renderApp(initialEntries: string[]) {
  const queryClient = createTestQueryClient()
  return render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={initialEntries}><App /><LocationProbe /></MemoryRouter></QueryClientProvider>)
}
function setRole(role: Role) { setSession({ accessToken: 'token', user: { id: 'user-1', full_name: 'Usuario Demo', email: 'demo@example.com', role } }) }

describe('aplicación base', () => {
  beforeEach(() => { sessionStorage.clear(); clearSession() })

  it('renderiza la pantalla pública de inicio', () => {
    renderApp(['/'])
    expect(screen.getByRole('heading', { name: /orientación que continúa contigo/i })).toBeInTheDocument()
    expect(
      within(screen.getByRole('banner')).getByText(/sistema inteligente de atención y tickets/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /tarjetas/i })).toBeInTheDocument()
    expect(screen.getByText(/prototipo académico no oficial/i)).toBeInTheDocument()
  })

  it('mantiene el acceso de personal solo en el footer', () => {
    renderApp(['/'])
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent(/acceso para personal/i)
    expect(screen.getByRole('banner')).not.toHaveTextContent(/acceso para personal/i)
  })

  it('permite navegar a preguntas frecuentes desde la navegación principal', async () => {
    renderApp(['/'])
    await userEvent.click(within(screen.getByRole('navigation', { name: /navegación principal/i })).getByRole('link', { name: /preguntas frecuentes/i }))
    expect(screen.getByRole('heading', { name: /preguntas frecuentes/i })).toBeInTheDocument()
  })

  it('muestra el aviso académico en ambos portales de login', () => {
    const { unmount } = renderApp(['/login'])
    expect(screen.getAllByText(/prototipo académico no oficial/i).length).toBeGreaterThan(0)
    unmount()
    renderApp(['/personal/login'])
    expect(screen.getAllByText(/prototipo académico no oficial/i).length).toBeGreaterThan(0)
  })

  it('protege el portal del cliente sin sesión', () => {
    renderApp(['/cliente'])
    expect(screen.getByRole('heading', { name: /bienvenido/i })).toBeInTheDocument()
  })

  it('protege la creación de tickets sin sesión', () => {
    renderApp(['/cliente/tickets/nuevo'])
    expect(screen.getByTestId('location')).toHaveTextContent('/login')
    expect(screen.getByRole('heading', { name: /bienvenido/i })).toBeInTheDocument()
  })

  it.each(['ASESOR', 'SUPERVISOR'] as const)('deniega la creación de tickets al rol %s', (role) => {
    setRole(role)
    renderApp(['/cliente/tickets/nuevo'])
    expect(screen.getByRole('alert')).toHaveTextContent(/acceso denegado/i)
  })

  it('incluye el acceso a crear ticket en la navegación del cliente', () => {
    setRole('CLIENTE')
    renderApp(['/cliente/tickets/nuevo'])
    expect(within(screen.getByRole('navigation', { name: /navegación del cliente/i })).getByRole('link', { name: /crear ticket/i })).toHaveAttribute('href', '/cliente/tickets/nuevo')
  })

  it('redirige las rutas internas al acceso de personal sin sesión', () => {
    renderApp(['/personal/tickets'])
    expect(screen.getByRole('heading', { name: /acceso para personal/i })).toBeInTheDocument()
  })

  it('muestra la página 404', () => {
    renderApp(['/no-existe'])
    expect(screen.getByRole('heading', { name: /página no encontrada/i })).toBeInTheDocument()
  })

  it('redirige rutas antiguas /panel/* a /personal/* conservando el detalle', async () => {
    setRole('ASESOR')
    renderApp(['/panel/tickets/ticket-42'])
    expect(await screen.findByTestId('location')).toHaveTextContent('/personal/tickets/ticket-42')
    expect(screen.getByTestId('location')).toHaveTextContent('/personal/tickets/ticket-42')
  })

  it.each([['ASESOR', '/personal/tickets'], ['SUPERVISOR', '/personal']] as const)('redirige /chat para %s', async (role, destination) => {
    setRole(role)
    renderApp(['/chat'])
    expect(await screen.findByTestId('location')).toHaveTextContent(destination)
    expect(screen.queryByRole('button', { name: /abrir asistente de atención/i })).not.toBeInTheDocument()
  })
})
