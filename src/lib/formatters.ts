import type { IconComponent } from '../components/ui/icons'
import { Icon } from '../components/ui/icons'

export function formatCategoryLabel(rawName: string | undefined | null): string {
  if (!rawName) return 'General'

  const map: Record<string, string> = {
    BANCA_DIGITAL: 'Banca Digital',
    'BANCA DIGITAL': 'Banca Digital',
    RECLAMOS_SIMPLES: 'Reclamos Simples',
    'RECLAMOS SIMPLES': 'Reclamos Simples',
    SOLICITUDES_INFORMACION: 'Solicitudes de Información',
    'SOLICITUDES INFORMACION': 'Solicitudes de Información',
    SOLICITUDES_DE_INFORMACION: 'Solicitudes de Información',
    CREDITOS: 'Créditos',
    CUENTAS: 'Cuentas',
    TARJETAS: 'Tarjetas',
    ATENCION_AL_CLIENTE: 'Atención al Cliente',
    SERVICIOS_GENERALES: 'Servicios Generales',
  }

  const trimmed = rawName.trim()
  const upper = trimmed.toUpperCase()
  if (map[upper]) return map[upper]

  if (trimmed.includes('_')) {
    return trimmed
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (index > 0 && ['de', 'del', 'en', 'y', 'a', 'la', 'los', 'las', 'por', 'para', 'o'].includes(word)) {
          return word
        }
        return word.charAt(0).toUpperCase() + word.slice(1)
      })
      .join(' ')
  }

  if (trimmed !== upper) {
    return trimmed
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

export function getCategoryIcon(rawName: string | undefined | null): IconComponent {
  if (!rawName) return Icon.book
  const upper = rawName.toUpperCase()
  if (upper.includes('BANCA') || upper.includes('DIGITAL')) return Icon.bot
  if (upper.includes('CUENTA')) return Icon.inbox
  if (upper.includes('TARJETA')) return Icon.ticket
  if (upper.includes('CREDITO')) return Icon.chart
  if (upper.includes('RECLAMO')) return Icon.warn
  if (upper.includes('SOLICITUD') || upper.includes('INFORMACION')) return Icon.mail
  return Icon.book
}
