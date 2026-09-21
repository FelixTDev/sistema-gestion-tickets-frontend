import { useState } from 'react'
import { ApiError } from '../../../lib/api-client'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Modal } from '../../../components/ui/modal'
import { Textarea } from '../../../components/ui/form-controls'
import { Icon } from '../../../components/ui/icons'
import { ErrorState, LoadingState } from '../../../components/ui/states'
import { useAuth } from '../../auth/auth-provider'
import { usePauseTicketSlaMutation, useResumeTicketSlaMutation, useTicketSla } from '../hooks/use-tickets'
import type { TicketSlaRead } from '../types/ticket-types'

function formatDate(value: string | null): string {
  if (!value) return 'Pendiente'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function statusLabel(status: TicketSlaRead['status']): string {
  return { ACTIVE: 'Activo', PAUSED: 'Pausado', COMPLETED: 'Completado', BREACHED: 'Incumplido', CANCELLED: 'Cancelado' }[status]
}

function errorText(error: unknown): string {
  if (error instanceof ApiError && error.status === 403) return 'No tienes permiso para operar el SLA de este ticket.'
  if (error instanceof ApiError && error.status === 409) return 'El SLA cambió en el servidor. Actualiza la vista.'
  return 'No pudimos completar la acción del SLA.'
}

export function TicketSlaCard({ ticketId }: { ticketId: string }) {
  const { user } = useAuth()
  const query = useTicketSla(ticketId)
  const pause = usePauseTicketSlaMutation(ticketId)
  const resume = useResumeTicketSlaMutation(ticketId)
  const [isPausing, setIsPausing] = useState(false)
  const [reason, setReason] = useState('')
  const canOperate = user?.role === 'ASESOR' || user?.role === 'SUPERVISOR'
  if (query.isLoading) return <Card><LoadingState message="Cargando SLA…" /></Card>
  if (query.isError) return <Card><ErrorState title="No pudimos cargar el SLA" desc={errorText(query.error)} onRetry={() => { void query.refetch() }} /></Card>
  if (!query.data) return null
  const sla = query.data
  const busy = pause.isPending || resume.isPending
  return <Card>
    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-[16px] font-bold text-ink"><Icon.clock size={17} />SLA del ticket</h2><span className="rounded-full bg-[#e4eff4] px-2.5 py-1 text-[12px] font-bold text-ink-800">{statusLabel(sla.status)}</span></div>
    <dl className="grid gap-3 text-[13px] sm:grid-cols-2"><div><dt className="text-muted">Primera respuesta hasta</dt><dd className="font-semibold text-ink">{formatDate(sla.first_response_due_at)}</dd></div><div><dt className="text-muted">Resolución hasta</dt><dd className="font-semibold text-ink">{formatDate(sla.resolution_due_at)}</dd></div><div><dt className="text-muted">Primera respuesta</dt><dd className="font-semibold text-ink">{formatDate(sla.first_responded_at)}</dd></div><div><dt className="text-muted">Tiempo pausado</dt><dd className="font-semibold text-ink">{sla.total_paused_seconds} s</dd></div></dl>
    {(pause.isError || resume.isError) && <p className="mt-4 rounded-[10px] border border-[#efb5b2] bg-[#fff2f1] p-3 text-[13px] text-danger" role="alert">{errorText(pause.error ?? resume.error)}</p>}
    {canOperate && ['ACTIVE', 'PAUSED'].includes(sla.status) && <div className="mt-4 flex flex-wrap gap-2">{sla.status === 'ACTIVE' ? <Button type="button" variant="secondary" size="sm" onClick={() => setIsPausing(true)} disabled={busy}>Pausar SLA</Button> : <Button type="button" size="sm" onClick={() => { resume.mutate(); }} loading={resume.isPending}>Reanudar SLA</Button>}</div>}
    <Modal open={isPausing} onClose={() => setIsPausing(false)} title="Pausar SLA" footer={<><Button variant="secondary" onClick={() => setIsPausing(false)} disabled={busy}>Cancelar</Button><Button loading={pause.isPending} disabled={!reason.trim()} onClick={() => { pause.mutate({ reason: reason.trim() }, { onSuccess: () => { setReason(''); setIsPausing(false) } }) }}>Pausar SLA</Button></>}><label className="grid gap-2 text-[13px] font-semibold text-ink" htmlFor="sla-pause-reason">Motivo<Textarea id="sla-pause-reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={4} /></label></Modal>
  </Card>
}
