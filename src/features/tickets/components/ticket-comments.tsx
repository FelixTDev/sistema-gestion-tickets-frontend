import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '../../../lib/api-client'
import { useAuth } from '../../auth/auth-provider'
import { Card } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Textarea } from '../../../components/ui/form-controls'
import { Icon } from '../../../components/ui/icons'
import { useAddTicketCommentMutation, useTicketComments } from '../hooks/use-tickets'
import { commentSchema, type CommentFormValues } from '../schemas/ticket-schemas'
import type { CommentRead, TicketRead } from '../types/ticket-types'

function commentError(error: unknown): string { if (error instanceof ApiError && error.status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.'; if (error instanceof ApiError && error.status === 403) return 'No tienes permiso para comentar este ticket.'; if (error instanceof ApiError && error.status === 409) return 'El ticket ya no admite comentarios.'; if (error instanceof ApiError && error.status === 422) return 'Revisa el comentario e inténtalo nuevamente.'; return 'No pudimos publicar el comentario. Inténtalo nuevamente.' }
function formatDate(value: string): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(date) }

export function TicketComments({ ticket }: { ticket: TicketRead }) {
  const { user } = useAuth(); const commentsQuery = useTicketComments(ticket.id); const [recentComments, setRecentComments] = useState<CommentRead[]>([]); const mutation = useAddTicketCommentMutation(ticket.id)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentFormValues>({ resolver: zodResolver(commentSchema), defaultValues: { content: '' } })
  const isParticipant = user?.role === 'SUPERVISOR'
    || (user?.role === 'ASESOR' && ticket.assigned_advisor_id === user.id)
    || (user?.role === 'CLIENTE' && ticket.client_id === user.id)
  const canComment = isParticipant && ticket.status !== 'CERRADO' && ticket.status !== 'CANCELADO'
  const unavailableMessage = user?.role === 'ASESOR' && ticket.assigned_advisor_id !== user.id
    ? 'Solo el asesor asignado puede comentar este ticket.'
    : 'Este ticket ya no admite comentarios.'
  const submit = handleSubmit(async (data) => { mutation.reset(); try { const comment = await mutation.mutateAsync(data); setRecentComments((current) => current.some((item) => item.id === comment.id) ? current : [...current, comment]); reset() } catch { /* rendered below */ } })
  const comments = Array.from(new Map([...(commentsQuery.data ?? []), ...recentComments].map((comment) => [comment.id, comment])).values()).sort((a, b) => a.created_at.localeCompare(b.created_at))
  return <Card><section aria-labelledby="ticket-comments-title"><h2 id="ticket-comments-title" className="mb-1 flex items-center gap-2 text-[16px] font-bold text-ink"><Icon.chat size={17} />Comentarios</h2><p className="mb-5 text-[12px] text-muted" role="note">Los comentarios se cargan desde el historial persistente del ticket.</p>{commentsQuery.isLoading && <div className="py-3 text-[13px] text-muted" role="status">Cargando comentarios…</div>}{commentsQuery.isError && <div className="rounded-[10px] border border-[#e5c0bd] bg-[#fbe3e2] p-3 text-[13px] text-danger" role="alert"><strong>No pudimos cargar los comentarios.</strong><Button variant="secondary" size="sm" className="ml-3" onClick={() => { void commentsQuery.refetch() }}>Reintentar</Button></div>}{!commentsQuery.isLoading && !commentsQuery.isError && comments.length === 0 && <div className="rounded-[10px] bg-[#f4f7f8] p-4 text-[13px] text-muted"><strong className="block text-ink">Aún no hay comentarios.</strong><span>Las respuestas del equipo aparecerán aquí.</span></div>}{comments.length > 0 && <ul className="mb-5 space-y-4">{comments.map((comment) => { const mine = comment.author_id === user?.id; return <li key={comment.id} className={`flex gap-3 ${mine ? 'flex-row-reverse' : ''}`}><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-bold ${mine ? 'bg-[#d9f0f1] text-turq-dark' : 'bg-[#e4eff4] text-ink-800'}`} aria-hidden="true">{mine ? 'Tú'.slice(0, 1) : 'A'}</span><div className={`max-w-[82%] ${mine ? 'text-right' : ''}`}><p className="mb-1 text-[12px] text-muted"><span className="font-semibold text-ink">{mine ? 'Tú' : 'Atención'}</span> · <time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time></p><p className={`inline-block whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-left text-[13.5px] ${mine ? 'rounded-tr-md bg-turq text-white' : 'rounded-tl-md bg-[#f4f7f8] text-ink'}`}>{comment.content}</p></div></li> })}</ul>}{canComment ? <form className="space-y-3 border-t border-[#eef2f3] pt-4" onSubmit={(event) => { void submit(event) }} noValidate><label htmlFor="ticket-comment" className="block text-[13px] font-semibold text-ink">Comentario</label><Textarea id="ticket-comment" rows={4} maxLength={5000} placeholder="Escribe un comentario…" {...register('content')} error={Boolean(errors.content)} />{errors.content && <p className="text-[12px] font-medium text-danger" role="alert">{errors.content.message}</p>}{mutation.isError && <p className="text-[12px] font-medium text-danger" role="alert">{commentError(mutation.error)}</p>}<div className="flex justify-end"><Button type="submit" icon={Icon.send} loading={mutation.isPending}>{mutation.isPending ? 'Publicando…' : 'Publicar comentario'}</Button></div></form> : <div className="rounded-[10px] bg-[#f4f7f8] p-3.5 text-center text-[13px] text-muted">{unavailableMessage}</div>}</section></Card>
}
