import { describe, expect, it } from 'vitest'
import { isUuid } from './identifiers'

describe('identificadores compartidos', () => {
  it('acepta UUIDs RFC 4122 válidos y rechaza segmentos de ruta', () => {
    expect(isUuid('11111111-1111-4111-8111-111111111111')).toBe(true)
    expect(isUuid('11111111-1111-0111-8111-111111111111')).toBe(false)
    expect(isUuid('ticket-1')).toBe(false)
    expect(isUuid('../ticket')).toBe(false)
    expect(isUuid(null)).toBe(false)
  })
})
