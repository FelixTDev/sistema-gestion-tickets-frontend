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
    expect(screen.getByRole('heading', { name: /estamos para ayudarte/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /cómo podemos ayudarte/i })).toBeInTheDocument()
    expect(screen.getByRole('note')).toHaveTextContent(/las operaciones bancarias se realizan únicamente por los canales oficiales del banco/i)
  })

  it('mantiene el acceso de personal solo en el footer', () => {
    renderApp(['/'])
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent(/acceso personal interno/i)
    expect(screen.getByRole('banner')).not.toHaveTextContent(/acceso personal interno/i)
  })

  it('permite navegar a preguntas frecuentes desde la navegación principal', async () => {
    renderApp(['/'])
    await userEvent.click(within(screen.getByRole('navigation', { name: /navegación principal/i })).getByRole('link', { name: /preguntas frecuentes/i }))
    expect(screen.getByRole('heading', { level: 1, name: /preguntas frecuentes/i })).toBeInTheDocument()
  })

  it('muestra el aviso de servicio en ambos portales de login', () => {
    const { unmount } = renderApp(['/login'])
    expect(screen.getAllByText(/las operaciones bancarias se realizan únicamente por los canales oficiales del banco/i).length).toBeGreaterThan(0)
    unmount()
    renderApp(['/personal/login'])
    expect(screen.getAllByText(/las operaciones bancarias se realizan únicamente por los canales oficiales del banco/i).length).toBeGreaterThan(0)
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

  it.each([
    ['ASESOR', '/personal/tickets'],
    ['SUPERVISOR', '/personal'],
  ] as const)('redirige la creación de tickets al portal del rol %s', async (role, destination) => {
    setRole(role)
    renderApp(['/cliente/tickets/nuevo'])
    expect(await screen.findByTestId('location')).toHaveTextContent(destination)
  })

  it('incluye el acceso a crear ticket en la navegación del cliente', () => {
    setRole('CLIENTE')
    renderApp(['/cliente/tickets/nuevo'])
    const navigation = within(screen.getByRole('navigation', { name: /navegación del cliente/i }))
    expect(navigation.getByRole('link', { name: /crear ticket/i })).toHaveAttribute('href', '/cliente/tickets/nuevo')
    expect(navigation.getByRole('link', { name: /crear ticket/i })).toHaveAttribute('aria-current', 'page')
    expect(navigation.getByRole('link', { name: /mis tickets/i })).not.toHaveAttribute('aria-current')
    expect(navigation.getByRole('link', { name: /asistente/i })).toHaveAttribute('href', '/chat')
  })

  it('mantiene la navegación inferior móvil aprobada para el cliente', () => {
    setRole('CLIENTE')
    renderApp(['/cliente'])
    const navigation = within(screen.getByRole('navigation', { name: /navegación inferior del cliente/i }))
    expect(navigation.getByRole('link', { name: /resumen/i })).toHaveAttribute('href', '/cliente')
    expect(navigation.getByRole('link', { name: /mis tickets/i })).toHaveAttribute('href', '/cliente/tickets')
    expect(navigation.getByRole('link', { name: /crear ticket/i })).toHaveAttribute('href', '/cliente/tickets/nuevo')
    expect(navigation.getByRole('link', { name: /asistente/i })).toHaveAttribute('href', '/chat')
  })

  it('expone objetivos táctiles de al menos 44px en la navegación interna', () => {
    setRole('ASESOR')
    renderApp(['/personal'])
    for (const link of within(screen.getByRole('navigation', { name: /navegación interna/i })).getAllByRole('link')) {
      expect(link).toHaveClass('min-h-11')
    }
    expect(screen.getByRole('button', { name: /abrir menú interno/i })).toHaveClass('min-h-11', 'min-w-11')
  })

  it('redirige las rutas internas al acceso de personal sin sesión', () => {
    renderApp(['/personal/tickets'])
    expect(screen.getByRole('heading', { name: /acceso para personal/i })).toBeInTheDocument()
  })

  it('redirige /personal sin sesión al acceso de personal', () => {
    renderApp(['/personal'])
    expect(screen.getByTestId('location')).toHaveTextContent('/personal/login')
    expect(screen.getByRole('heading', { name: /acceso para personal/i })).toBeInTheDocument()
  })

  it.each([
    ['CLIENTE', '/personal', '/cliente'],
    ['CLIENTE', '/personal/tickets', '/cliente'],
    ['ASESOR', '/personal', '/personal'],
    ['ASESOR', '/cliente', '/personal/tickets'],
    ['SUPERVISOR', '/cliente', '/personal'],
  ] as const)('redirige %s desde %s a su portal autorizado %s', async (role, source, destination) => {
    setRole(role)
    renderApp([source])
    expect(await screen.findByTestId('location')).toHaveTextContent(destination)
    expect(screen.queryByRole('alert', { name: /acceso denegado/i })).not.toBeInTheDocument()
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

  it('compone /chat dentro del portal cuando la sesión pertenece a un cliente', () => {
    setRole('CLIENTE')
    renderApp(['/chat'])
    expect(screen.getByRole('heading', { name: /asistente de atención/i })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /navegación inferior del cliente/i })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: /navegación principal/i })).not.toBeInTheDocument()
  })
})
