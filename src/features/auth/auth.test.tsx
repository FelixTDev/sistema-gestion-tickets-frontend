import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../app/app-shell'
import { LoginForm, RegisterForm } from './auth-forms'
import { AuthProvider, useAuth } from './auth-provider'
import { register, clearSession, logout } from './auth-service'
import { setAccessToken } from '../../lib/auth'

const client = { id: 'client-1', full_name: 'Cliente Demo', email: 'cliente@example.com', role: 'CLIENTE' as const }
const advisor = { ...client, role: 'ASESOR' as const }
const supervisor = { ...client, role: 'SUPERVISOR' as const }

function authForm(ui: React.ReactElement) { return render(<MemoryRouter><AuthProvider>{ui}</AuthProvider></MemoryRouter>) }
function SessionProbe() { const { isLoading, user } = useAuth(); return <span>{isLoading ? 'loading' : user?.email ?? 'anonymous'}</span> }

beforeEach(() => { sessionStorage.clear(); clearSession(); vi.restoreAllMocks() })

describe('formularios de autenticación', () => {
  it('renderiza el formulario de login y valida el correo', async () => {
    authForm(<LoginForm />)
    expect(screen.getByRole('heading', { name: /inicia sesión/i })).toBeInTheDocument()
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }).closest('form')!)
    expect(await screen.findByText(/correo válido/i)).toBeInTheDocument()
  })

  it('valida la contraseña del login', async () => {
    authForm(<LoginForm />)
    await userEvent.type(screen.getByLabelText(/correo/i), 'cliente@example.com')
    fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }).closest('form')!)
    expect(await screen.findByText(/contraseña es obligatoria/i)).toBeInTheDocument()
  })

  it('hace login correctamente y guarda sesión en sessionStorage', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ access_token: 'jwt-test', token_type: 'bearer', user: client }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    authForm(<LoginForm />)
    await userEvent.type(screen.getByLabelText(/correo/i), client.email)
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    await waitFor(() => expect(sessionStorage.getItem('auth_token')).toBe('jwt-test'))
    expect(screen.queryByText('jwt-test')).not.toBeInTheDocument()
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('muestra un error genérico cuando el login es rechazado', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Credenciales inválidas' }), { status: 401, headers: { 'Content-Type': 'application/json' } }))
    authForm(<LoginForm />)
    await userEvent.type(screen.getByLabelText(/correo/i), client.email)
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/el correo o la contraseña son incorrectos/i)
  })

  it('registra un cliente y valida confirmación y contraseña', async () => {
    authForm(<RegisterForm />)
    await userEvent.type(screen.getByLabelText(/nombre completo/i), client.full_name)
    await userEvent.type(screen.getByLabelText(/^correo electrónico$/i), client.email)
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), 'Password123')
    await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), 'Different123')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    expect(await screen.findByText(/contraseñas no coinciden/i)).toBeInTheDocument()
  })

  it('limpia contraseña inválida y muestra reglas', async () => {
    authForm(<RegisterForm />)
    expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), 'short')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    expect(await screen.findByText(/cumplir las reglas/i)).toBeInTheDocument()
  })

  it('registra correctamente y comunica el éxito', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(client), { status: 201, headers: { 'Content-Type': 'application/json' } }))
    authForm(<RegisterForm />)
    await userEvent.type(screen.getByLabelText(/nombre completo/i), client.full_name)
    await userEvent.type(screen.getByLabelText(/^correo electrónico$/i), client.email)
    await userEvent.type(screen.getByLabelText(/^contraseña$/i), 'Password123')
    await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    expect(await screen.findByRole('status')).toHaveTextContent(/cuenta creada/i)
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

  it('limpia la sesión local al cerrar sesión aunque logout responda 401', async () => {
    setAccessToken('token-to-clear')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'expired' }), { status: 401, headers: { 'Content-Type': 'application/json' } }))
    await logout()
    expect(sessionStorage.getItem('auth_token')).toBeNull()
  })
})

describe('redirecciones por rol', () => {
  it.each([[client, '/cliente'], [advisor, '/panel/tickets'], [supervisor, '/panel']])('dirige %s a %s', async (user, path) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ access_token: 'token', token_type: 'bearer', user }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    render(<MemoryRouter initialEntries={['/login']}><AuthProvider><App /></AuthProvider></MemoryRouter>)
    await userEvent.type(screen.getByLabelText(/correo/i), client.email)
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    await waitFor(() => expect(screen.getByRole('heading', { name: path === '/cliente' ? /tu espacio de atención/i : path === '/panel/tickets' ? /bandeja de tickets/i : /panel interno/i })).toBeInTheDocument())
  })

  it('bloquea una ruta interna para un rol incorrecto', async () => {
    sessionStorage.setItem('auth_token', 'client-token')
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(client), { status: 200, headers: { 'Content-Type': 'application/json' } }))
    render(<MemoryRouter initialEntries={['/panel']}><AuthProvider><App /></AuthProvider></MemoryRouter>)
    expect(await screen.findByRole('alert')).toHaveTextContent(/acceso denegado/i)
  })
})
