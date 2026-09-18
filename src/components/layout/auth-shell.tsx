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
  return (
    <div className="min-h-screen bg-[#f4f7f8] lg:grid lg:grid-cols-2">
      <a href="#auth-main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      <aside
        className={`relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex ${
          isStaff ? 'bg-[#06243a]' : 'bg-[#0b4963]'
        }`}
      >
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: isStaff
              ? 'radial-gradient(circle, #078f98 0%, transparent 70%)'
              : 'radial-gradient(circle, #8bc63e 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10">
          <Link to="/" className="inline-block" aria-label="Ir al inicio">
            <BankLogo surface="dark" className="!h-10" />
          </Link>
        </div>
        <div className="relative z-10 my-auto py-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[12.5px] font-medium tracking-wide text-white shadow-sm">
            {isStaff ? (
              <>
                <Icon.shield size={14} className="text-green" /> Acceso restringido - Personal autorizado
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-green" /> Centro de Atención Digital GNB
              </>
            )}
          </div>
          <h2 className="max-w-md text-[36px] font-extrabold leading-[1.15] text-white">
            {isStaff
              ? 'Panel interno de atención y gestión'
              : 'Tu centro de atención, siempre contigo'}
          </h2>
          <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-[#c6d7de]">
            {isStaff
              ? 'Gestiona la bandeja de tickets y las herramientas habilitadas para tu rol.'
              : 'Consulta, registra y da seguimiento a tus solicitudes de forma sencilla.'}
          </p>
        </div>
        <div className="relative z-10 border-t border-white/10 pt-6">
          <p className="max-w-md text-[12.5px] leading-relaxed text-[#b9cdd6]">
            Portal de consultas y tickets. Las operaciones bancarias se realizan únicamente por los canales oficiales del banco.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col bg-[#f4f7f8]">
        <div className="lg:hidden">
          <ServiceNotice inline />
        </div>
        <main
          id="auth-main-content"
          className="flex flex-1 items-center justify-center p-3 sm:p-6"
        >
          <div className="w-full max-w-lg rounded-[16px] border border-[#e6edef] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-4 flex justify-center lg:hidden">
              <Link to="/" aria-label="Ir al inicio">
                <BankLogo className="!h-9" />
              </Link>
            </div>
            {isStaff && (
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e4eff4] px-3.5 py-1 text-[12.5px] font-semibold text-ink-800">
                <Icon.shield size={14} /> Acceso para personal autorizado
              </div>
            )}
            <h1 className="text-[24px] font-extrabold text-ink sm:text-[26px]">{title}</h1>
            <p className="mb-4 mt-1 text-[14px] text-muted">{subtitle}</p>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
