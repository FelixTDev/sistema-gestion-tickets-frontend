import { useState } from 'react'
import { ApiError } from '../../../lib/api-client'
import { Button } from '../../../components/ui/button'
import { Modal } from '../../../components/ui/modal'
import { Textarea } from '../../../components/ui/form-controls'
import { useAuth } from '../../auth/auth-provider'
import { useCancelTicketMutation, useChangeTicketStatusMutation, useCloseTicketMutation, useReopenTicketMutation } from '../hooks/use-tickets'
import type { TicketRead, TicketStatus } from '../types/ticket-types'

const nextStatuses: Partial<Record<TicketStatus, TicketStatus[]>> = { NUEVO: ['ASIGNADO'], ASIGNADO: ['EN_PROCESO'], EN_PROCESO: ['PENDIENTE_CLIENTE', 'RESUELTO'], PENDIENTE_CLIENTE: ['EN_PROCESO'] }
const statusLabels: Record<TicketStatus, string> = { NUEVO: 'Nuevo', ASIGNADO: 'Asignar', EN_PROCESO: 'Marcar en atención', PENDIENTE_CLIENTE: 'Pendiente del cliente', RESUELTO: 'Resolver', CERRADO: 'Cerrar', CANCELADO: 'Cancelar' }
type Action = { kind: 'status'; status: TicketStatus } | { kind: 'close' } | { kind: 'reopen' } | { kind: 'cancel' }

function actionError(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.'
  if (error instanceof ApiError && error.status === 403) return 'No tienes permiso para gestionar este ticket.'
  if (error instanceof ApiError && error.status === 404) return 'No encontramos el ticket solicitado.'
  if (error instanceof ApiError && error.status === 409) return 'El ticket cambió en el servidor. Actualiza el detalle e inténtalo nuevamente.'
  if (error instanceof ApiError && error.status === 422) return 'La transición no es válida para el estado actual del ticket.'
  return 'No pudimos completar la acción. Inténtalo nuevamente.'
}

function actionTitle(action: Action): string {
  if (action.kind === 'status') return `Confirmar: ${statusLabels[action.status]}`
  if (action.kind === 'close') return 'Confirmar cierre'
  if (action.kind === 'reopen') return 'Confirmar reapertura'
  return 'Confirmar cancelación'
}

export function TicketActions({ ticket }: { ticket: TicketRead }) {
  const { user } = useAuth()
  const [action, setAction] = useState<Action | null>(null)
  const [reason, setReason] = useState('')
  const statusMutation = useChangeTicketStatusMutation(ticket.id)
  const closeMutation = useCloseTicketMutation(ticket.id)
  const reopenMutation = useReopenTicketMutation(ticket.id)
  const cancelMutation = useCancelTicketMutation(ticket.id)
  const canManage = user?.role === 'SUPERVISOR' || (user?.role === 'ASESOR' && ticket.assigned_advisor_id === user.id)
  if (!canManage || ticket.status === 'CERRADO' || ticket.status === 'CANCELADO') return null
  const pending = statusMutation.isPending || closeMutation.isPending || reopenMutation.isPending || cancelMutation.isPending
  const error = statusMutation.error ?? closeMutation.error ?? reopenMutation.error ?? cancelMutation.error
  const needsReason = action?.kind === 'reopen' || action?.kind === 'cancel'
  const closeAction = () => { setAction(null); setReason('') }
  const confirm = async () => {
    if (!action || (needsReason && !reason.trim())) return
    statusMutation.reset(); closeMutation.reset(); reopenMutation.reset(); cancelMutation.reset()
    try {
      if (action.kind === 'status') await statusMutation.mutateAsync({ status: action.status, reason: null })
      if (action.kind === 'close') await closeMutation.mutateAsync()
      if (action.kind === 'reopen') await reopenMutation.mutateAsync({ reason: reason.trim() })
      if (action.kind === 'cancel') await cancelMutation.mutateAsync({ reason: reason.trim() })
      closeAction()
    } catch { /* the server error remains visible below */ }
  }
  return <section className="ticket-actions" aria-labelledby="ticket-actions-title"><h2 id="ticket-actions-title">Acciones</h2><div className="flex flex-wrap gap-2">
    {nextStatuses[ticket.status]?.map((status) => <Button key={status} size="sm" disabled={pending} onClick={() => setAction({ kind: 'status', status })}>{statusLabels[status]}</Button>)}
    {ticket.status === 'RESUELTO' && <Button size="sm" disabled={pending} onClick={() => setAction({ kind: 'close' })}>Cerrar</Button>}
    {ticket.status === 'RESUELTO' && <Button size="sm" variant="secondary" disabled={pending} onClick={() => setAction({ kind: 'reopen' })}>Reabrir</Button>}
    {user?.role === 'SUPERVISOR' && <Button size="sm" variant="danger" disabled={pending} onClick={() => setAction({ kind: 'cancel' })}>Cancelar</Button>}
  </div>{error && !action && <div className="form-error" role="alert">{actionError(error)}</div>}
    <Modal open={Boolean(action)} onClose={closeAction} title={action ? actionTitle(action) : ''} danger={action?.kind === 'cancel'} footer={<><Button variant="secondary" onClick={closeAction} disabled={pending}>Cancelar</Button><Button variant={action?.kind === 'cancel' ? 'danger' : 'primary'} loading={pending} disabled={needsReason && !reason.trim()} onClick={() => { void confirm() }}>Confirmar</Button></>}>
      <div className="grid gap-3">{error && <div className="form-error" role="alert">{actionError(error)}</div>}{needsReason ? <div className="grid gap-2"><p>Esta acción requiere un motivo que quedará registrado en el historial.</p><label htmlFor="ticket-action-reason">Motivo</label><Textarea id="ticket-action-reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} required /></div> : <p>La acción se validará y aplicará en el servidor. ¿Deseas continuar?</p>}</div>
    </Modal>
  </section>
}
