import { Link } from 'react-router-dom'

export function BrandHeader({ to = '/', inverted = false, compact = false }: { to?: string; inverted?: boolean; compact?: boolean }) {
  return <Link className={`brand-header${inverted ? ' brand-header-inverted' : ''}${compact ? ' brand-header-compact' : ''}`} to={to} aria-label="Banco GNB Perú, Sistema inteligente de atención y tickets">
    <span className="brand-symbol" aria-hidden="true"><span>G</span></span>
    <span className="brand-copy"><strong>Banco GNB Perú</strong><small>Sistema inteligente de atención y tickets</small></span>
  </Link>
}
