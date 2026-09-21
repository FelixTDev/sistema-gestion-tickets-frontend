import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getMyPreferences, getMyProfile, updateMyPreferences, updateMyProfile } from './api/profile-api'

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

describe('API de perfil y preferencias', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('consume los endpoints y métodos exactos de perfil y preferencias', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(() => Promise.resolve(jsonResponse({ ok: true })))
    const profile = { full_name: 'Cliente actualizado', phone: null }
    const preferences = { email_enabled: false, preferred_language: 'es' as const }

    await getMyProfile()
    await updateMyProfile(profile)
    await getMyPreferences()
    await updateMyPreferences(preferences)

    expect(fetchMock.mock.calls.map(([input]) => String(input))).toEqual([
      expect.stringMatching(/\/users\/me\/profile$/),
      expect.stringMatching(/\/users\/me\/profile$/),
      expect.stringMatching(/\/users\/me\/preferences$/),
      expect.stringMatching(/\/users\/me\/preferences$/),
    ])
    expect(fetchMock.mock.calls.map(([, init]) => init?.method)).toEqual([undefined, 'PATCH', undefined, 'PATCH'])
    expect(fetchMock.mock.calls[1][1]).toEqual(expect.objectContaining({ body: JSON.stringify(profile) }))
    expect(fetchMock.mock.calls[3][1]).toEqual(expect.objectContaining({ body: JSON.stringify(preferences) }))
  })
})
