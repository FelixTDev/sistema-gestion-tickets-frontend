import { useState } from 'react'
import { ApiError } from '../../../lib/api-client'
import { Button } from '../../../components/ui/button'
import { Modal } from '../../../components/ui/modal'
import { useAuth } from '../../auth/auth-provider'
import { useAdvisors, useAssignTicketMutation } from '../hooks/use-tickets'
import type { TicketRead } from '../types/ticket-types'

function assignmentError(error: unknown): string { if (error instanceof ApiError && error.status === 403) return 'No tienes permiso para asignar este ticket.'; if (error instanceof ApiError && error.status === 404) return 'No encontramos el ticket solicitado.'; return 'No pudimos asignar el ticket. Inténtalo nuevamente.' }
export function TicketAssignment({ ticket }: { ticket: TicketRead }) {
  const { user } = useAuth()
  const advisors = useAdvisors(user?.role === 'SUPERVISOR'); const mutation = useAssignTicketMutation(ticket.id); const [advisorId, setAdvisorId] = useState(''); const [confirming, setConfirming] = useState(false)
  if (user?.role !== 'SUPERVISOR') return null
  const activeAdvisors = (advisors.data ?? []).filter((advisor) => advisor.role === 'ASESOR')
  const selected = activeAdvisors.find((advisor) => advisor.id === advisorId)
  const assign = async () => { if (!selected) return; try { await mutation.mutateAsync({ advisor_id: selected.id }); setConfirming(false); setAdvisorId('') } catch { setConfirming(false) } }
  return <section className="ticket-assignment" aria-labelledby="ticket-assignment-title"><h2 id="ticket-assignment-title">Asignación</h2>
    {advisors.isLoading && <div className="state" role="status">Cargando asesores…</div>}
    {advisors.isError && <div className="state state-error" role="alert"><strong>No pudimos cargar los asesores.</strong><button className="button button-small" type="button" onClick={() => { void advisors.refetch() }}>Reintentar</button></div>}
    {!advisors.isLoading && !advisors.isError && activeAdvisors.length === 0 && <div className="state"><strong>No hay asesores activos.</strong><span>El ticket no puede asignarse todavía.</span></div>}
    {!advisors.isLoading && !advisors.isError && activeAdvisors.length > 0 && <><label htmlFor="ticket-advisor">Asesor activo</label><select id="ticket-advisor" value={advisorId} onChange={(event) => setAdvisorId(event.target.value)}><option value="">Selecciona un asesor</option>{activeAdvisors.map((advisor) => <option key={advisor.id} value={advisor.id}>{advisor.full_name}</option>)}</select><Button size="sm" type="button" disabled={!selected || mutation.isPending} onClick={() => setConfirming(true)}>Asignar ticket</Button></>}
    {mutation.isError && <div className="form-error" role="alert">{assignmentError(mutation.error)}</div>}
    {mutation.isSuccess && <div className="form-success" role="status">Ticket asignado correctamente.</div>}
    {confirming && selected && <Modal open onClose={() => setConfirming(false)} title="Confirmar asignación" footer={<><Button variant="secondary" onClick={() => setConfirming(false)} disabled={mutation.isPending}>Cancelar</Button><Button loading={mutation.isPending} onClick={() => { void assign() }}>Confirmar asignación</Button></>}><p>Se asignará este ticket a <strong>{selected.full_name}</strong>. La asignación se validará en el servidor.</p></Modal>}
  </section>
}
