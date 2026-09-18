const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** RFC 4122 UUIDs accepted from route, query string, or session storage. */
export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}

/** Safe fallback for legacy API identifiers while preventing path traversal. */
export function assertSafePathSegment(value: string, name: string): void {
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(value)) {
    throw new Error(`${name} inválido.`)
  }
}

export function assertUuid(value: string, name: string): void {
  if (!isUuid(value)) throw new Error(`${name} inválido.`)
}
