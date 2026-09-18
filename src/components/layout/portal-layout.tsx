import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-provider'
import { BankLogo } from '../brand/bank-logo'
import { Button } from '../ui/button'
import { Icon, type IconComponent } from '../ui/icons'
import { AccessibleDrawer } from '../ui/drawer'

const clientNavigation: ReadonlyArray<{ href: string; label: string; icon: IconComponent }> = [
  { href: '/cliente', label: 'Resumen', icon: Icon.home },
  { href: '/cliente/tickets', label: 'Mis tickets', icon: Icon.ticket },
  { href: '/cliente/tickets/nuevo', label: 'Crear ticket', icon: Icon.plus },
  { href: '/chat', label: 'Asistente', icon: Icon.bot },
]

function ClientNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  return <>
    <nav className="flex-1 space-y-1 p-3" aria-label="Navegación del cliente">
      {clientNavigation.map(({ href, label, icon: NavIcon }) => <NavLink key={href} to={href} end onClick={onNavigate} className={({ isActive }) => `flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-[14px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turq ${isActive ? 'bg-[#06243a] text-white' : 'text-ink hover:bg-[#eef4f5]'}`}><NavIcon size={19} />{label}</NavLink>)}
    </nav>
    <div className="space-y-1 border-t border-[#eef2f3] p-3"><Button variant="ghost" full icon={Icon.compass} onClick={() => { onNavigate?.(); navigate('/') }}>Sitio público</Button></div>
  </>
}

function ClientBottomNavigation() {
  return <nav aria-label="Navegación inferior del cliente" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[#dce6e9] bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(6,36,58,0.08)] backdrop-blur lg:hidden">
    {clientNavigation.map(({ href, label, icon: NavIcon }) => <NavLink key={href} to={href} end className={({ isActive }) => `flex min-h-[68px] min-w-11 flex-col items-center justify-center gap-1 px-1 py-2 text-center text-[10px] font-bold leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-turq ${isActive ? 'text-turq' : 'text-muted'}`}><NavIcon size={21} /><span>{label}</span></NavLink>)}
  </nav>
}

export function ClientLayout({ children }: { children?: ReactNode }) {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[264px_1fr]"><a href="#client-main-content" className="skip-link">Saltar al contenido principal</a>
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-[#e6edef] bg-white lg:flex">
      <div className="border-b border-[#eef2f3] p-5"><NavLink to="/cliente" aria-label="Ir al resumen del cliente"><BankLogo /></NavLink></div>
      <div className="flex items-center gap-3 border-b border-[#eef2f3] p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e4eff4] font-display font-bold text-ink-800" aria-hidden="true">{user?.full_name?.slice(0, 1).toUpperCase() ?? '?'}</span><div className="min-w-0"><p className="truncate text-[14px] font-bold text-ink">{user?.full_name ?? 'Cuenta'}</p><p className="text-[12px] text-muted">Cliente</p></div></div>
      <ClientNavigation />
      <div className="border-t border-[#eef2f3] p-3"><Button variant="ghost" full icon={Icon.logout} className="!justify-start !text-danger hover:!bg-[#fbe3e2]" onClick={() => { void signOut() }}>Cerrar sesión</Button></div>
    </aside>
    <div className="flex min-h-screen min-w-0 flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#e6edef] bg-white/95 px-4 backdrop-blur lg:hidden"><NavLink to="/cliente" aria-label="Ir al resumen del cliente"><BankLogo className="!w-[142px]" /></NavLink><Button variant="ghost" size="sm" aria-label="Abrir menú de navegación" aria-expanded={menuOpen} aria-controls="client-mobile-drawer" onClick={() => setMenuOpen(true)}><Icon.menu size={22} /></Button></header>
      <main id="client-main-content" className="min-w-0 flex-1 pb-24 lg:pb-10">{children ?? <Outlet />}</main>
      <ClientBottomNavigation />
    </div>
    <AccessibleDrawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menú de navegación móvil"><div className="mb-4 flex items-center justify-between"><BankLogo className="!w-[142px]" /><Button variant="ghost" size="sm" aria-label="Cerrar menú de navegación" onClick={() => setMenuOpen(false)}><Icon.x size={22} /></Button></div><div className="mb-3 flex items-center gap-3 rounded-[10px] bg-[#f4f7f8] p-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#e4eff4] font-bold text-ink-800" aria-hidden="true">{user?.full_name?.slice(0, 1).toUpperCase() ?? '?'}</span><div><p className="text-[14px] font-bold text-ink">{user?.full_name ?? 'Cuenta'}</p><p className="text-[12px] text-muted">Cliente</p></div></div><ClientNavigation onNavigate={() => setMenuOpen(false)} /><div className="border-t border-[#eef2f3] pt-3"><Button variant="ghost" full icon={Icon.logout} className="!justify-start !text-danger" onClick={() => { setMenuOpen(false); void signOut() }}>Cerrar sesión</Button></div></AccessibleDrawer>
  </div>
}

export function PortalLayout({ children }: { children?: ReactNode }) { return children ? <>{children}</> : <ClientLayout /> }
