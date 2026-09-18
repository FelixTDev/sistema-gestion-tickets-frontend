import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BankLogo } from '../brand/bank-logo'
import { Icon } from '../ui/icons'
import { ServiceNotice } from './service-notice'

export function AuthShell({
  children,
  title,
  subtitle,
  side,
}: {
  children: ReactNode
  title: string
  subtitle: string
  side: 'client' | 'staff'
}) {
  const isStaff = side === 'staff'
  return <div className="min-h-screen grid lg:grid-cols-2"><a href="#auth-main-content" className="skip-link">Saltar al contenido principal</a>
    <aside className={`relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex ${isStaff ? 'bg-[#06243a]' : 'bg-[#0b4963]'}`}>
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '22px 22px' }} />
      <Link to="/" className="relative w-fit" aria-label="Ir al inicio"><BankLogo surface="dark" /></Link>
      <div className="relative">
        {isStaff && <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[12.5px] font-medium"><Icon.shield size={14} className="text-green" /> Acceso restringido</span>}
        <h2 className="max-w-sm text-[34px] font-extrabold leading-tight text-white">{isStaff ? 'Panel interno de atención y gestión' : 'Tu centro de atención, siempre contigo'}</h2>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[#c6d7de]">{isStaff ? 'Gestiona la bandeja de tickets y las herramientas habilitadas para tu rol.' : 'Consulta, registra y da seguimiento a tus solicitudes de forma sencilla y segura.'}</p>
      </div>
      <p className="relative max-w-md text-[12px] leading-relaxed text-[#b9cdd6]">Portal de consultas y tickets. Las operaciones bancarias se realizan únicamente por los canales oficiales del banco.</p>
    </aside>
    <div className="flex min-w-0 flex-col">
      <div className="lg:hidden"><ServiceNotice inline /></div>
      <main id="auth-main-content" className="grid flex-1 place-items-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden"><Link to="/" aria-label="Ir al inicio"><BankLogo /></Link></div>
          {isStaff && <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e4eff4] px-3 py-1 text-[13px] font-semibold text-ink-800"><Icon.shield size={15} /> Acceso para personal autorizado</div>}
          <h1 className="text-[28px] font-extrabold text-ink">{title}</h1>
          <p className="mb-7 mt-1.5 text-[15px] text-muted">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  </div>
}
