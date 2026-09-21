import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChangePasswordForm } from './auth-forms'
import { ForgotPasswordPage } from './pages/forgot-password-page'
import { ResetPasswordPage } from './pages/reset-password-page'
import { VerifyEmailPage } from './pages/verify-email-page'

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

function renderRoute(ui: React.ReactElement, route: string) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('autenticación avanzada', () => {
  it('solicita recuperación y muestra un mensaje genérico de éxito', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ message: 'Solicitud aceptada' }, 202))
    renderRoute(<ForgotPasswordPage />, '/forgot-password')

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), 'cliente@example.com')
    await userEvent.click(screen.getByRole('button', { name: /enviar enlace/i }))

    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/auth\/forgot-password$/), expect.objectContaining({ method: 'POST', body: JSON.stringify({ email: 'cliente@example.com' }) }))
    expect(await screen.findByRole('status')).toHaveTextContent(/si el correo está registrado/i)
  })

  it('restablece la contraseña usando el token de la URL', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ message: 'Contraseña actualizada' }))
    renderRoute(<ResetPasswordPage />, '/reset-password?token=reset-token')

    await userEvent.type(screen.getByLabelText(/^nueva contraseña/i), 'NewPassword123')
    await userEvent.type(screen.getByLabelText(/confirmar contraseña/i), 'NewPassword123')
    await userEvent.click(screen.getByRole('button', { name: /guardar contraseña/i }))

    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/auth\/reset-password$/), expect.objectContaining({ method: 'POST', body: JSON.stringify({ token: 'reset-token', new_password: 'NewPassword123' }) }))
    expect(await screen.findByRole('status')).toHaveTextContent(/contraseña actualizada/i)
  })

  it('cambia la contraseña autenticada con los campos del formulario', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ message: 'Contraseña actualizada' }))
    renderRoute(<ChangePasswordForm />, '/cliente/perfil')

    await userEvent.type(screen.getByLabelText(/contraseña actual/i), 'OldPassword123')
    await userEvent.type(screen.getByLabelText(/^nueva contraseña/i), 'NewPassword123')
    await userEvent.type(screen.getByLabelText(/confirmar nueva contraseña/i), 'NewPassword123')
    await userEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }))

    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/auth\/change-password$/), expect.objectContaining({ method: 'POST', body: JSON.stringify({ current_password: 'OldPassword123', new_password: 'NewPassword123' }) }))
    expect(await screen.findByRole('status')).toHaveTextContent(/contraseña actualizada/i)
  })

  it('verifica el correo con el token de la URL', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ message: 'Correo verificado' }))
    renderRoute(<VerifyEmailPage />, '/verify-email?token=verify-token')

    await userEvent.click(screen.getByRole('button', { name: /verificar correo/i }))

    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/auth\/verify-email$/), expect.objectContaining({ method: 'POST', body: JSON.stringify({ token: 'verify-token' }) }))
    expect(await screen.findByRole('status')).toHaveTextContent(/correo verificado/i)
  })
})
