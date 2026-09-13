import { useAuth } from '../../auth/auth-provider'
import { useCancelTicketMutation, useChangeTicketStatusMutation, useCloseTicketMutation, useReopenTicketMutation } from '../hooks/use-tickets'
import type { TicketRead, TicketStatus } from '../types/ticket-types'
import { useState } from 'react'

const nextStatuses: Partial<Record<TicketStatus, TicketStatus[]>> = { NUEVO: ['ASIGNADO'], ASIGNADO: ['EN_PROCESO'], EN_PROCESO: ['PENDIENTE_CLIENTE', 'RESUELTO'], PENDIENTE_CLIENTE: ['EN_PROCESO'] }
export function TicketActions({ ticket }: { ticket: TicketRead }) {
  const { user } = useAuth(); const [reason, setReason] = useState(''); const [action, setAction] = useState<'cancel'|'reopen'|null>(null)
  const statusMutation = useChangeTicketStatusMutation(ticket.id); const closeMutation = useCloseTicketMutation(ticket.id); const reopenMutation = useReopenTicketMutation(ticket.id); const cancelMutation = useCancelTicketMutation(ticket.id)
  const canManage = user?.role === 'SUPERVISOR' || (user?.role === 'ASESOR' && ticket.assigned_advisor_id === user.id)
  if (!canManage || ticket.status === 'CERRADO' || ticket.status === 'CANCELADO') return null
  const pending = statusMutation.isPending || closeMutation.isPending || reopenMutation.isPending || cancelMutation.isPending
  const error = statusMutation.error ?? closeMutation.error ?? reopenMutation.error ?? cancelMutation.error
  const submitReason = async () => { if (!reason.trim() || !action) return; try { if (action === 'cancel') await cancelMutation.mutateAsync({ reason: reason.trim() }); else await reopenMutation.mutateAsync({ reason: reason.trim() }); setAction(null); setReason('') } catch { /* visible below */ } }
  return <section className="ticket-actions" aria-labelledby="ticket-actions-title"><h2 id="ticket-actions-title">Acciones</h2><div className="ticket-action-buttons">
    {nextStatuses[ticket.status]?.map((status) => <button className="button button-small" disabled={pending} key={status} type="button" onClick={() => { void statusMutation.mutateAsync({ status, reason: null }) }}>{status.replaceAll('_', ' ')}</button>)}
    {ticket.status === 'RESUELTO' && <button className="button button-small" disabled={pending} type="button" onClick={() => { void closeMutation.mutateAsync() }}>Cerrar</button>}
    {ticket.status === 'RESUELTO' && <button className="button button-small" disabled={pending} type="button" onClick={() => setAction('reopen')}>Reabrir</button>}
    {user.role === 'SUPERVISOR' && <button className="button button-small button-danger" disabled={pending} type="button" onClick={() => setAction('cancel')}>Cancelar</button>}
  </div>{error && <div className="form-error" role="alert">No pudimos completar la acción. Verifica el estado del ticket y tus permisos.</div>}
  {action && <div className="action-dialog" role="dialog" aria-modal="true" aria-labelledby="action-dialog-title"><h3 id="action-dialog-title">Motivo requerido</h3><label htmlFor="action-reason">Explica el motivo</label><textarea id="action-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} /><div><button className="button button-small" type="button" disabled={!reason.trim() || pending} onClick={() => { void submitReason() }}>Confirmar</button><button className="button button-small button-ghost" type="button" onClick={() => setAction(null)}>Cancelar</button></div></div>}</section>
}
