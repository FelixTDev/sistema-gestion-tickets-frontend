import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ClientLayout } from '../components/layout/portal-layout'
import { PublicLayout } from '../components/layout/public-layout'
import { StaffLayout } from '../components/layout/staff-layout'
import { AccessDenied } from '../components/ui/states'
import { useAuth } from '../features/auth/auth-provider'
import { ChatPage } from '../features/chatbot/pages/chat-page'
import { FaqPage } from '../features/faqs/pages/faq-page'
import { hasRole } from '../lib/auth'
import {
  ClientHomePage,
  ClientTicketsPage,
  HomePage,
  KnowledgePage,
  LoginPage,
  NotFoundPage,
  PanelHomePage,
  PanelTicketDetailPage,
  PanelTicketsPage,
  RegisterPage,
  StaffLoginPage,
  TicketDetailPage,
} from '../pages/base-pages'
import type { Role } from '../types/auth'

function ProtectedRoute({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { session, isLoading } = useAuth()
  if (isLoading) return <div className="state" role="status">Validando sesión…</div>
  if (!session) return <Navigate to={roles.includes('CLIENTE') ? '/login' : '/personal/login'} replace />
  return hasRole(session, roles) ? children : <AccessDenied />
}

function ChatRoute() {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="state" role="status">Validando sesión…</div>
  if (user?.role === 'ASESOR') return <Navigate to="/personal/tickets" replace />
  if (user?.role === 'SUPERVISOR') return <Navigate to="/personal" replace />
  return <ChatPage />
}

function LegacyPanelRedirect() {
  const location = useLocation()
  return <Navigate to={`${location.pathname.replace(/^\/panel/, '/personal')}${location.search}${location.hash}`} replace />
}

export function AppRouter() {
  return <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/personal/login" element={<StaffLoginPage />} />
      <Route path="/preguntas-frecuentes" element={<FaqPage />} />
      <Route path="/chat" element={<ChatRoute />} />
    </Route>
    <Route element={<ClientLayout />}>
      <Route path="/cliente" element={<ProtectedRoute roles={['CLIENTE']}><ClientHomePage /></ProtectedRoute>} />
      <Route path="/cliente/tickets" element={<ProtectedRoute roles={['CLIENTE']}><ClientTicketsPage /></ProtectedRoute>} />
      <Route path="/cliente/tickets/:ticketId" element={<ProtectedRoute roles={['CLIENTE']}><TicketDetailPage /></ProtectedRoute>} />
    </Route>
    <Route element={<StaffLayout />}>
      <Route path="/personal" element={<ProtectedRoute roles={['SUPERVISOR']}><PanelHomePage /></ProtectedRoute>} />
      <Route path="/personal/tickets" element={<ProtectedRoute roles={['ASESOR', 'SUPERVISOR']}><PanelTicketsPage /></ProtectedRoute>} />
      <Route path="/personal/tickets/:ticketId" element={<ProtectedRoute roles={['ASESOR', 'SUPERVISOR']}><PanelTicketDetailPage /></ProtectedRoute>} />
      <Route path="/personal/conocimiento" element={<ProtectedRoute roles={['SUPERVISOR']}><KnowledgePage /></ProtectedRoute>} />
    </Route>
    <Route path="/panel/*" element={<LegacyPanelRedirect />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
}
