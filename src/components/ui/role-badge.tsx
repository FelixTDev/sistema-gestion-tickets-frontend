import type { Role } from '../../types/auth'

const labels: Record<Role, string> = { CLIENTE: 'Cliente', ASESOR: 'Asesor', SUPERVISOR: 'Supervisor' }
export function RoleBadge({ role }: { role: Role }) { return <span className={`role-badge role-${role.toLowerCase()}`}>{labels[role]}</span> }
