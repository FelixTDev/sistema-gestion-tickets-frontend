import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-provider'
import { AcademicDisclaimer } from './academic-disclaimer'
import { BrandHeader } from './brand-header'
import { RoleBadge } from '../ui/role-badge'

export function StaffLayout() { const { user, signOut } = useAuth(); const isSupervisor = user?.role === 'SUPERVISOR'; return <div className="staff-shell"><aside className="staff-sidebar"><BrandHeader to={isSupervisor ? '/personal' : '/personal/tickets'} inverted compact /><div className="staff-user"><span>Sesión interna</span><strong>{user?.full_name}</strong>{user && <RoleBadge role={user.role} />}</div><nav aria-label="Navegación interna">{isSupervisor && <Link to="/personal">Panel</Link>}<Link to="/personal/tickets">Bandeja de tickets</Link>{isSupervisor && <Link to="/personal/conocimiento">Base de conocimiento</Link>}</nav><button className="staff-logout" type="button" onClick={() => { void signOut() }}>Cerrar sesión</button></aside><div className="staff-workspace"><AcademicDisclaimer compact /><main className="staff-content"><Outlet /></main></div></div> }
