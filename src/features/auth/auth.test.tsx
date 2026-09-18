import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryClientProvider } from '@tanstack/react-query'
import { App } from '../../app/app-shell'
import { createTestQueryClient } from '../../test/test-query-client'
import { ClientLoginForm, RegisterForm } from './auth-forms'
import { AuthProvider, useAuth } from './auth-provider'
import { register, clearSession, logout } from './auth-service'
import { setAccessToken } from '../../lib/auth'

const client = { id: 'client-1', full_name: 'Cliente Prueba', email: 'cliente@example.com', role: 'CLIENTE' as const }
const advisor = { ...client, role: 'ASESOR' as const }
const supervisor = { ...client, role: 'SUPERVISOR' as const }

function authForm(ui: React.ReactElement) { return render(<MemoryRouter><AuthProvider>{ui}</AuthProvider></MemoryRouter>) }
function SessionProbe() { const { isLoading, user } = useAuth(); return <span>{isLoading ? 'loading' : user?.email ?? 'anonymous'}</span> }
function LocationProbe() { const location = useLocation(); return <output data-testid="location">{location.pathname}</output> }
function renderApp(initialEntries: string[]) { const queryClient = createTestQueryClient(); return render(<QueryClientProvider client={queryClient}><MemoryRouter initialEntries={initialEntries}><App /><LocationProbe /></MemoryRouter></QueryClientProvider>) }

beforeEach(() => { sessionStorage.clear(); clearSession(); vi.restoreAllMocks() })

describe('formularios de autenticación', () => {
  it('presenta el login cliente sin credenciales de ejemplo y con acceso a recuperación', () => {
    authForm(<ClientLoginForm />)
    expect(screen.getByRole('link', { name: /olvidaste tu contraseña/i })).toHaveAttribute('href', '/recuperar-contrasena')
    expect(screen.getByLabelText(/correo electrónico/i)).not.toHaveValue()
    expect(screen.getByLabelText(/^contraseña/i)).not.toHaveValue()
    const prohibited = ['proto' + 'tipo', 'de' + 'mo', 'simu' + 'lado', 'acad' + 'émico', 'fic' + 'ticio', 'no ' + 'oficial']
    expect(prohibited.some((term) => document.body.textContent?.toLocaleLowerCase().includes(term))).toBe(false)
  })

  it('renderiza el formulario de login y valida el correo', async () => {
    authForm(<ClientLoginForm />)
    expect(screen.getByRole('heading', { name: /bienvenido/i })).toBeInTheDocument()
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }).closest('form')!)
    expect(await screen.findByText(/correo válido/i)).toBeInTheDocument()
  })

  it('valida la contraseña del login', async () => {
    authForm(<ClientLoginForm />)
    await userEvent.type(screen.getByLabelText(/correo/i), 'cliente@example.com')
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }).closest('form')!)
    expect(await screen.findByText(/contraseña es obligatoria/i)).toBeInTheDocument()
  })

  it('hace login correctamente y guarda sesión en sessionStorage', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ access_token: 'jwt-test', token_type: 'bearer', user: client }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    authForm(<ClientLoginForm />)
    await userEvent.type(screen.getByLabelText(/correo/i), client.email)
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    await waitFor(() => expect(sessionStorage.getItem('auth_token')).toBe('jwt-test'))
    expect(screen.queryByText('jwt-test')).not.toBeInTheDocument()
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('muestra un error genérico cuando el login es rechazado', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Credenciales inválidas' }), { status: 401, headers: { 'Content-Type': 'application/json' } }))
    authForm(<ClientLoginForm />)
    await userEvent.type(screen.getByLabelText(/correo/i), client.email)
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/el correo o la contraseña son incorrectos/i)
  })

  it('registra un cliente y valida confirmación y contraseña', async () => {
    authForm(<RegisterForm />)
    await userEvent.type(screen.getByLabelText(/nombre completo/i), client.full_name)
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), client.email)
    await userEvent.type(screen.getByLabelText(/^contraseña/i), 'Password123')
    await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), 'Different123')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    expect(await screen.findByText(/contraseñas no coinciden/i)).toBeInTheDocument()
  })

  it('limpia contraseña inválida y muestra reglas', async () => {
    authForm(<RegisterForm />)
    expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText(/^contraseña/i), 'short')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    expect(await screen.findByText(/cumplir las reglas/i)).toBeInTheDocument()
  })

  it('registra correctamente y comunica el éxito', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(client), { status: 201, headers: { 'Content-Type': 'application/json' } }))
    authForm(<RegisterForm />)
    await userEvent.type(screen.getByLabelText(/nombre completo/i), client.full_name)
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), client.email)
    await userEvent.type(screen.getByLabelText(/^contraseña/i), 'Password123')
    await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    expect(await screen.findByRole('status')).toHaveTextContent(/cuenta creada/i)
  })

  it.each([
    [409, /ese correo ya está registrado/i],
    [422, /revisa los datos ingresados/i],
  ])('presenta el error %s devuelto al registrar', async (status, message) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Solicitud rechazada' }), { status, headers: { 'Content-Type': 'application/json' } }))
    authForm(<RegisterForm />)
    await userEvent.type(screen.getByLabelText(/nombre completo/i), client.full_name)
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), client.email)
    await userEvent.type(screen.getByLabelText(/^contraseña/i), 'Password123')
    await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(message)
  })

  it('bloquea envíos duplicados mientras el registro está pendiente', async () => {
    let resolveRegister!: (response: Response) => void
    const pending = new Promise<Response>((resolve) => { resolveRegister = resolve })
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockReturnValue(pending)
    authForm(<RegisterForm />)
    await userEvent.type(screen.getByLabelText(/nombre completo/i), client.full_name)
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), client.email)
    await userEvent.type(screen.getByLabelText(/^contraseña/i), 'Password123')
    await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), 'Password123')
    const submit = screen.getByRole('button', { name: /crear cuenta/i })
    await userEvent.click(submit)
    expect(screen.getByRole('button', { name: /creando cuenta/i })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /creando cuenta/i }))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    resolveRegister(new Response(JSON.stringify(client), { status: 201, headers: { 'Content-Type': 'application/json' } }))
  })
})

describe('servicio y ciclo de sesión', () => {
  it('envía registro y propaga conflicto 409', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Correo ya registrado' }), { status: 409, headers: { 'Content-Type': 'application/json' } }))
    await expect(register({ full_name: client.full_name, email: client.email, phone: undefined, password: 'Password123' })).rejects.toMatchObject({ status: 409 })
  })

  it('restaura sesión con /auth/me y limpia token ante 401', async () => {
    sessionStorage.setItem('auth_token', 'old-token')
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'expired' }), { status: 401, headers: { 'Content-Type': 'application/json' } }))
    render(<MemoryRouter><AuthProvider><SessionProbe /></AuthProvider></MemoryRouter>)
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/auth/me'), expect.objectContaining({ headers: expect.anything() })))
    await waitFor(() => expect(screen.getByText('anonymous')).toBeInTheDocument())
    expect(sessionStorage.getItem('auth_token')).toBeNull()
  })

  it('limpia el token si la restauración de sesión falla por un error no autorizado', async () => {
    sessionStorage.setItem('auth_token', 'stale-token')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Temporal' }), { status: 500, headers: { 'Content-Type': 'application/json' } }))
    render(<MemoryRouter><AuthProvider><SessionProbe /></AuthProvider></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('anonymous')).toBeInTheDocument())
    expect(sessionStorage.getItem('auth_token')).toBeNull()
  })

  it('limpia la sesión local al cerrar sesión aunque logout responda 401', async () => {
    setAccessToken('token-to-clear')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'expired' }), { status: 401, headers: { 'Content-Type': 'application/json' } }))
    await logout()
    expect(sessionStorage.getItem('auth_token')).toBeNull()
  })
})

describe('portales de acceso por rol', () => {
  it('acepta CLIENTE en /login y redirige a /cliente', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ access_token: 'token', token_type: 'bearer', user: client }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    renderApp(['/login'])
    await userEvent.type(screen.getByLabelText(/correo/i), client.email)
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    expect(await screen.findByRole('heading', { name: /tu espacio de atención/i })).toBeInTheDocument()
  })

  it.each([advisor, supervisor])('rechaza una cuenta interna en /login y limpia la sesión', async (internalUser) => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'internal-token', token_type: 'bearer', user: internalUser }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Sesión cerrada correctamente' }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    renderApp(['/login'])
    await userEvent.type(screen.getByLabelText(/correo/i), client.email)
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/cuenta pertenece al acceso interno/i)
    expect(screen.getByRole('link', { name: /ir al acceso para personal/i })).toHaveAttribute('href', '/personal/login')
    expect(sessionStorage.getItem('auth_token')).toBeNull()
  })

  it.each([[advisor, '/personal/tickets'], [supervisor, '/personal']])('acepta personal en /personal/login', async (internalUser, path) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ access_token: 'staff-token', token_type: 'bearer', user: internalUser }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    renderApp(['/personal/login'])
    await userEvent.type(screen.getByLabelText(/correo/i), client.email)
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /ingresar al portal interno/i }))
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(path))
  })

  it('rechaza CLIENTE en /personal/login y limpia la sesión', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'client-token', token_type: 'bearer', user: client }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Sesión cerrada correctamente' }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    renderApp(['/personal/login'])
    await userEvent.type(screen.getByLabelText(/correo/i), client.email)
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /ingresar al portal interno/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/utilizar el portal de clientes/i)
    expect(screen.getByRole('link', { name: /ir al acceso de clientes/i })).toHaveAttribute('href', '/login')
    expect(sessionStorage.getItem('auth_token')).toBeNull()
  })

  it('redirige una ruta interna antigua al portal del rol autenticado', async () => {
    sessionStorage.setItem('auth_token', 'client-token')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(client), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    renderApp(['/panel'])
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/cliente'))
  })

  it('asocia una conversación después del login CLIENTE sin bloquear la redirección', async () => {
    sessionStorage.setItem('chat_conversation_id', '11111111-1111-4111-8111-111111111111')
    let resolveLink!: (response: Response) => void
    const linkPromise = new Promise<Response>((resolve) => { resolveLink = resolve })
    vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input)
      if (url.endsWith('/auth/login')) return Promise.resolve(new Response(JSON.stringify({ access_token: 'token', token_type: 'bearer', user: client }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      if (url.endsWith('/link-user')) return linkPromise
      if (init?.method !== 'POST') return Promise.resolve(new Response(JSON.stringify({ id: '11111111-1111-4111-8111-111111111111', user_id: null, status: 'ACTIVE', started_at: '2026-09-12', ended_at: null, messages: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
      return Promise.resolve(new Response(JSON.stringify({ message: 'Unexpected' }), { status: 500, headers: { 'Content-Type': 'application/json' } }))
    })
    renderApp(['/login'])
    await userEvent.type(screen.getByLabelText(/correo/i), client.email)
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/cliente'))
    resolveLink(new Response(JSON.stringify({ id: '11111111-1111-4111-8111-111111111111', user_id: client.id, status: 'ACTIVE' }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    await waitFor(() => expect(screen.getByRole('heading', { name: /tu espacio de atención/i })).toBeInTheDocument())
  })
})
