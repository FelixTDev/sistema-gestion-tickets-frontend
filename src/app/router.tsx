import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { PublicLayout } from '../components/layout/public-layout'
import { PortalLayout } from '../components/layout/portal-layout'
import { StaffLayout } from '../components/layout/staff-layout'
import { AccessDenied } from '../components/ui/states'
import { getSession, hasRole } from '../lib/auth'
import { ChatPage, ClientHomePage, ClientTicketsPage, FaqPage, HomePage, KnowledgePage, LoginPage, NotFoundPage, PanelHomePage, PanelTicketDetailPage, PanelTicketsPage, RegisterPage, TicketDetailPage } from '../pages/base-pages'
import type { Role } from '../types/auth'

function ProtectedRoute({ roles, children }: { roles: Role[]; children: ReactNode }) { const session = getSession(); return !session ? <Navigate to="/login" replace /> : hasRole(session, roles) ? children : <AccessDenied /> }
export function AppRouter() { return <Routes><Route element={<PublicLayout />}><Route path="/" element={<HomePage />} /><Route path="/login" element={<LoginPage />} /><Route path="/registro" element={<RegisterPage />} /><Route path="/preguntas-frecuentes" element={<FaqPage />} /><Route path="/chat" element={<ChatPage />} /></Route><Route element={<PortalLayout />}><Route path="/cliente" element={<ProtectedRoute roles={['CLIENTE']}><ClientHomePage /></ProtectedRoute>} /><Route path="/cliente/tickets" element={<ProtectedRoute roles={['CLIENTE']}><ClientTicketsPage /></ProtectedRoute>} /><Route path="/cliente/tickets/:ticketId" element={<ProtectedRoute roles={['CLIENTE']}><TicketDetailPage /></ProtectedRoute>} /></Route><Route element={<StaffLayout />}><Route path="/panel" element={<ProtectedRoute roles={['ASESOR', 'SUPERVISOR']}><PanelHomePage /></ProtectedRoute>} /><Route path="/panel/tickets" element={<ProtectedRoute roles={['ASESOR', 'SUPERVISOR']}><PanelTicketsPage /></ProtectedRoute>} /><Route path="/panel/tickets/:ticketId" element={<ProtectedRoute roles={['ASESOR', 'SUPERVISOR']}><PanelTicketDetailPage /></ProtectedRoute>} /><Route path="/panel/conocimiento" element={<ProtectedRoute roles={['SUPERVISOR']}><KnowledgePage /></ProtectedRoute>} /></Route><Route path="*" element={<NotFoundPage />} /></Routes> }
