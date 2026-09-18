import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ClientLayout } from '../components/layout/portal-layout'
import { PublicLayout } from '../components/layout/public-layout'
import { StaffLayout } from '../components/layout/staff-layout'
import { useAuth } from '../features/auth/auth-provider'
import { ChatPage } from '../features/chatbot/pages/chat-page'
import { FaqPage } from '../features/faqs/pages/faq-page'
import { KnowledgePage } from '../features/faqs/pages/knowledge-page'
import { DesignSystemPage } from '../features/design-system/pages/design-system-page'
import { ReportsPage } from '../features/reports/pages/reports-page'
import { ClientDashboardPage } from '../features/tickets/pages/client-dashboard-page'
import { ClientTicketsPage } from '../features/tickets/pages/client-tickets-page'
import { ClientTicketCreatePage } from '../features/tickets/pages/client-ticket-create-page'
import { ClientTicketDetailPage } from '../features/tickets/pages/client-ticket-detail-page'
import { TicketAssignmentPage } from '../features/tickets/pages/ticket-assignment-page'
import { StaffTicketDetailPage } from '../features/tickets/pages/staff-ticket-detail-page'
import { StaffTicketsPage } from '../features/tickets/pages/staff-tickets-page'
import { AdvisorDashboardPage } from '../features/tickets/pages/advisor-dashboard-page'
import { SupervisorDashboardPage } from '../features/reports/pages/supervisor-dashboard-page'
import { hasRole } from '../lib/auth'
import { AboutPage } from '../pages/about-page'
import {
  HomePage,
  LoginPage,
  NotFoundPage,
  RecoverPage,
  RegisterPage,
  StaffLoginPage,
} from '../pages/base-pages'
import type { Role } from '../types/auth'

function ProtectedRoute({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { session, isLoading } = useAuth()
  if (isLoading) return <div className="state" role="status">Validando sesión…</div>
  if (!session) return <Navigate to={roles.includes('CLIENTE') ? '/login' : '/personal/login'} replace />
  if (!hasRole(session, roles)) return <Navigate to={destinationForRole(session.user.role, roles)} replace />
  return children
}

function destinationForRole(role: Role, roles: Role[]): string {
  if (roles.includes('CLIENTE')) return role === 'SUPERVISOR' ? '/personal' : '/personal/tickets'
  if (role === 'CLIENTE') return '/cliente'
  return role === 'ASESOR' ? '/personal/tickets' : '/personal'
}

function ChatRoute({ onCreateTicket }: { onCreateTicket?: () => void }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="state" role="status">Validando sesión…</div>
  if (user?.role === 'ASESOR') return <Navigate to="/personal/tickets" replace />
  if (user?.role === 'SUPERVISOR') return <Navigate to="/personal" replace />
  const page = <ChatPage onCreateTicket={onCreateTicket} />
  return user?.role === 'CLIENTE' ? <ClientLayout>{page}</ClientLayout> : <PublicLayout>{page}</PublicLayout>
}

function LegacyPanelRedirect() {
  const location = useLocation()
  const legacyAliases: Record<string, string> = {
    '/panel': '/personal',
    '/panel/tickets': '/personal/tickets',
    '/panel/reportes': '/personal/reportes',
    '/panel/asignacion': '/personal/asignacion',
    '/panel/conocimiento': '/personal/conocimiento',
  }
  const targetPath = legacyAliases[location.pathname] ?? location.pathname.replace(/^\/panel(?=\/|$)/, '/personal')
  return <Navigate to={`${targetPath}${location.search}${location.hash}`} replace />
}

export function AppRouter({ onCreateTicket }: { onCreateTicket?: () => void }) {
  return <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/preguntas-frecuentes" element={<FaqPage />} />
      <Route path="/nosotros" element={<AboutPage />} />
    </Route>
    <Route path="/chat" element={<ChatRoute onCreateTicket={onCreateTicket} />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/registro" element={<RegisterPage />} />
    <Route path="/recuperar-contrasena" element={<RecoverPage />} />
    <Route path="/personal/login" element={<StaffLoginPage />} />
    <Route path="/design-system" element={<DesignSystemPage />} />
    <Route element={<ClientLayout />}>
      <Route path="/cliente" element={<ProtectedRoute roles={['CLIENTE']}><ClientDashboardPage /></ProtectedRoute>} />
      <Route path="/cliente/tickets" element={<ProtectedRoute roles={['CLIENTE']}><ClientTicketsPage /></ProtectedRoute>} />
      <Route path="/cliente/tickets/nuevo" element={<ProtectedRoute roles={['CLIENTE']}><ClientTicketCreatePage /></ProtectedRoute>} />
      <Route path="/cliente/tickets/:ticketId" element={<ProtectedRoute roles={['CLIENTE']}><ClientTicketDetailPage /></ProtectedRoute>} />
    </Route>
    <Route element={<StaffLayout />}>
      <Route path="/personal" element={<PersonalHomeRoute />} />
      <Route path="/personal/tickets" element={<ProtectedRoute roles={['ASESOR', 'SUPERVISOR']}><StaffTicketsPage /></ProtectedRoute>} />
      <Route path="/personal/tickets/:ticketId" element={<ProtectedRoute roles={['ASESOR', 'SUPERVISOR']}><StaffTicketDetailPage /></ProtectedRoute>} />
      <Route path="/personal/reportes" element={<ProtectedRoute roles={['SUPERVISOR']}><ReportsPage /></ProtectedRoute>} />
      <Route path="/personal/asignacion" element={<ProtectedRoute roles={['SUPERVISOR']}><TicketAssignmentPage /></ProtectedRoute>} />
      <Route path="/personal/conocimiento" element={<ProtectedRoute roles={['SUPERVISOR']}><KnowledgePage /></ProtectedRoute>} />
    </Route>
    <Route path="/panel/*" element={<LegacyPanelRedirect />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
}

function PersonalHomeRoute() {
  const { session } = useAuth()
  if (session?.user.role === 'CLIENTE') return <Navigate to="/cliente" replace />
  if (session?.user.role === 'ASESOR') return <ProtectedRoute roles={['ASESOR']}><AdvisorDashboardPage /></ProtectedRoute>
  return <ProtectedRoute roles={['SUPERVISOR']}><SupervisorDashboardPage /></ProtectedRoute>
}
