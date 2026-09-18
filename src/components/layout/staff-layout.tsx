import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../features/auth/auth-provider'
import { BrandHeader } from './brand-header'
import { RoleBadge } from '../ui/role-badge'
import { Icon, type IconComponent } from '../ui/icons'
import { AccessibleDrawer } from '../ui/drawer'

type StaffNavItem = { label: string; to: string; icon: IconComponent; end?: boolean }

function navItems(isSupervisor: boolean): StaffNavItem[] {
  const common: StaffNavItem[] = [{ label: 'Bandeja de tickets', to: '/personal/tickets', icon: Icon.inbox }]
  return isSupervisor
    ? [{ label: 'Dashboard', to: '/personal', icon: Icon.chart, end: true }, ...common, { label: 'Reportes', to: '/personal/reportes', icon: Icon.report }, { label: 'Asignación', to: '/personal/asignacion', icon: Icon.users }, { label: 'Conocimiento', to: '/personal/conocimiento', icon: Icon.book }]
    : [{ label: 'Dashboard', to: '/personal', icon: Icon.grid, end: true }, ...common]
}

function StaffNavigation({ items, onNavigate }: { items: StaffNavItem[]; onNavigate: () => void }) {
  return <nav aria-label="Navegación interna" className="staff-navigation flex flex-col gap-1">{items.map(({ label, to, icon: NavIcon, end }) => <NavLink key={to} end={end} to={to} onClick={onNavigate} className={({ isActive }) => `staff-nav-link flex min-h-11 items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-[14px] font-semibold ${isActive ? 'staff-nav-link-active bg-turq text-white' : 'text-[#c6d7de] hover:bg-white/10 hover:text-white'}`}><NavIcon size={19} /><span>{label}</span></NavLink>)}</nav>
}

export function StaffLayout() {
  const { user, signOut } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const isSupervisor = user?.role === 'SUPERVISOR'
  const items = navItems(isSupervisor)
  const logout = () => { void signOut() }
  const sideContent = <><div className="staff-brand"><BrandHeader to={isSupervisor ? '/personal' : '/personal'} inverted compact /></div><div className="staff-user"><span>Sesión interna</span><strong>{user?.full_name ?? 'Personal autorizado'}</strong>{user && <RoleBadge role={user.role} />}</div><StaffNavigation items={items} onNavigate={() => setDrawerOpen(false)} /><button className="staff-logout" type="button" onClick={logout}><Icon.logout size={19} /> Cerrar sesión</button></>
  return <div className="staff-shell"><a href="#staff-main-content" className="skip-link">Saltar al contenido principal</a>
    <aside className="staff-sidebar !hidden lg:!flex">{sideContent}</aside>
    <div className="staff-workspace">
      <header className="staff-mobile-header flex items-center justify-between bg-[#06243a] px-4 py-3 text-white lg:hidden"><BrandHeader to="/personal" inverted compact /><button className="staff-menu-button min-h-11 min-w-11 rounded-[10px] p-2 text-white" type="button" aria-label="Abrir menú interno" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}><Icon.menu size={22} /></button></header>
      <main id="staff-main-content" className="staff-content"><Outlet /></main>
    </div>
    <AccessibleDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Menú interno móvil" side="left"><div className="relative flex h-full flex-col bg-[#06243a] -m-4 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"><button className="staff-drawer-close absolute right-3 top-3 min-h-11 min-w-11 rounded p-2 text-white" type="button" aria-label="Cerrar menú interno" onClick={() => setDrawerOpen(false)}><Icon.x size={21} /></button>{sideContent}</div></AccessibleDrawer>
  </div>
}
