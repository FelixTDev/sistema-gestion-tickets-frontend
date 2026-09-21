import { beforeEach, describe, expect, it, vi } from 'vitest'
import { changePassword, forgotPassword, resetPassword, verifyEmail } from './auth-service'

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('servicios de autenticación avanzada', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('usa los cuerpos exactos del contrato OpenAPI', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve(jsonResponse({ message: 'ok' })))

    await forgotPassword({ email: 'cliente@example.com' })
    await resetPassword({ token: 'reset-token', new_password: 'NewPassword123' })
    await changePassword({ current_password: 'OldPassword123', new_password: 'NewPassword123' })
    await verifyEmail({ token: 'verify-token' })

    expect(fetchMock.mock.calls.map(([input]) => String(input))).toEqual([
      expect.stringMatching(/\/auth\/forgot-password$/),
      expect.stringMatching(/\/auth\/reset-password$/),
      expect.stringMatching(/\/auth\/change-password$/),
      expect.stringMatching(/\/auth\/verify-email$/),
    ])
    expect(fetchMock.mock.calls.map(([, init]) => init?.method)).toEqual(['POST', 'POST', 'POST', 'POST'])
    expect(fetchMock.mock.calls.map(([, init]) => init?.body)).toEqual([
      JSON.stringify({ email: 'cliente@example.com' }),
      JSON.stringify({ token: 'reset-token', new_password: 'NewPassword123' }),
      JSON.stringify({ current_password: 'OldPassword123', new_password: 'NewPassword123' }),
      JSON.stringify({ token: 'verify-token' }),
    ])
  })
})
