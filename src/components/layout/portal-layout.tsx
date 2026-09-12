import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-provider'
import { AcademicDisclaimer } from './academic-disclaimer'
import { BrandHeader } from './brand-header'
import { PageContainer } from './page-container'
import { RoleBadge } from '../ui/role-badge'

export function ClientLayout() { const { user, signOut } = useAuth(); return <div className="site-shell client-shell"><header className="portal-header"><BrandHeader to="/cliente" compact /><div className="portal-user"><div><strong>{user?.full_name}</strong>{user && <RoleBadge role={user.role} />}</div><button className="button button-outline button-small" type="button" onClick={() => { void signOut() }}>Cerrar sesión</button></div></header><AcademicDisclaimer compact /><nav className="portal-navigation" aria-label="Navegación del cliente"><Link to="/cliente">Resumen</Link><Link to="/cliente/tickets">Mis tickets</Link></nav><PageContainer as="main" className="portal-content"><Outlet /></PageContainer></div> }
