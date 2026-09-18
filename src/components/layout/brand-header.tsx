import { Link } from 'react-router-dom'
import { BankLogo } from '../brand/bank-logo'

export function BrandHeader({ to = '/', inverted = false, compact = false }: { to?: string; inverted?: boolean; compact?: boolean }) {
  return <Link className={`inline-flex shrink-0 items-center ${compact ? 'max-w-[156px]' : ''}`} to={to} aria-label="Banco GNB Perú, ir al inicio">
    <BankLogo surface={inverted ? 'dark' : 'light'} className={compact ? '!w-[148px]' : ''} />
  </Link>
}
