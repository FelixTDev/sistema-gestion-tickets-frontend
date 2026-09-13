import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ClientLayout } from '../components/layout/portal-layout'
import { PublicLayout } from '../components/layout/public-layout'
import { StaffLayout } from '../components/layout/staff-layout'
import { AccessDenied } from '../components/ui/states'
import { useAuth } from '../features/auth/auth-provider'
import { ChatPage } from '../features/chatbot/pages/chat-page'
import { FaqPage } from '../features/faqs/pages/faq-page'
import { ClientDashboardPage } from '../features/tickets/pages/client-dashboard-page'
import { ClientTicketsPage } from '../features/tickets/pages/client-tickets-page'
import { ClientTicketCreatePage } from '../features/tickets/pages/client-ticket-create-page'
import { ClientTicketDetailPage } from '../features/tickets/pages/client-ticket-detail-page'
import { StaffTicketDetailPage } from '../features/tickets/pages/staff-ticket-detail-page'
import { StaffTicketsPage } from '../features/tickets/pages/staff-tickets-page'
import { SupervisorDashboardPage } from '../features/reports/pages/supervisor-dashboard-page'
import { hasRole } from '../lib/auth'
import {
  HomePage,
  KnowledgePage,
  LoginPage,
  NotFoundPage,
  RegisterPage,
  StaffLoginPage,
} from '../pages/base-pages'
import type { Role } from '../types/auth'

function ProtectedRoute({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { session, isLoading } = useAuth()
  if (isLoading) return <div className="state" role="status">Validando sesión…</div>
  if (!session) return <Navigate to={roles.includes('CLIENTE') ? '/login' : '/personal/login'} replace />
  return hasRole(session, roles) ? children : <AccessDenied />
}

function ChatRoute({ onCreateTicket }: { onCreateTicket?: () => void }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="state" role="status">Validando sesión…</div>
  if (user?.role === 'ASESOR') return <Navigate to="/personal/tickets" replace />
  if (user?.role === 'SUPERVISOR') return <Navigate to="/personal" replace />
  return <ChatPage onCreateTicket={onCreateTicket} />
}

function LegacyPanelRedirect() {
  const location = useLocation()
  return <Navigate to={`${location.pathname.replace(/^\/panel/, '/personal')}${location.search}${location.hash}`} replace />
}

export function AppRouter({ onCreateTicket }: { onCreateTicket?: () => void }) {
  return <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/personal/login" element={<StaffLoginPage />} />
      <Route path="/preguntas-frecuentes" element={<FaqPage />} />
      <Route path="/chat" element={<ChatRoute onCreateTicket={onCreateTicket} />} />
    </Route>
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
      <Route path="/personal/conocimiento" element={<ProtectedRoute roles={['SUPERVISOR']}><KnowledgePage /></ProtectedRoute>} />
    </Route>
    <Route path="/panel/*" element={<LegacyPanelRedirect />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
}

function PersonalHomeRoute() {
  const { session } = useAuth()
  if (session?.user.role === 'ASESOR') return <Navigate to="/personal/tickets" replace />
  return <ProtectedRoute roles={['SUPERVISOR']}><SupervisorDashboardPage /></ProtectedRoute>
}
