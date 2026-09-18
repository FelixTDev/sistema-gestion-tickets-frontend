import { describe, expect, it } from 'vitest'
import { formatCategoryLabel, getCategoryIcon } from './formatters'
import { Icon } from '../components/ui/icons'

describe('formatCategoryLabel', () => {
  it('formats category names with underscores to readable titles', () => {
    expect(formatCategoryLabel('BANCA_DIGITAL')).toBe('Banca Digital')
    expect(formatCategoryLabel('RECLAMOS_SIMPLES')).toBe('Reclamos Simples')
    expect(formatCategoryLabel('SOLICITUDES_INFORMACION')).toBe('Solicitudes de Información')
  })

  it('formats standard uppercase category names', () => {
    expect(formatCategoryLabel('CREDITOS')).toBe('Créditos')
    expect(formatCategoryLabel('CUENTAS')).toBe('Cuentas')
    expect(formatCategoryLabel('TARJETAS')).toBe('Tarjetas')
  })

  it('handles null, undefined and empty values gracefully', () => {
    expect(formatCategoryLabel(null)).toBe('General')
    expect(formatCategoryLabel(undefined)).toBe('General')
    expect(formatCategoryLabel('')).toBe('General')
  })
})

describe('getCategoryIcon', () => {
  it('returns matching icon for category names', () => {
    expect(getCategoryIcon('BANCA_DIGITAL')).toBe(Icon.bot)
    expect(getCategoryIcon('CUENTAS')).toBe(Icon.inbox)
    expect(getCategoryIcon('TARJETAS')).toBe(Icon.ticket)
    expect(getCategoryIcon('CREDITOS')).toBe(Icon.chart)
    expect(getCategoryIcon('RECLAMOS_SIMPLES')).toBe(Icon.warn)
    expect(getCategoryIcon('UNKNOWN')).toBe(Icon.book)
  })
})
