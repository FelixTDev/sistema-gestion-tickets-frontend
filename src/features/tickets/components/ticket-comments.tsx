import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '../../../lib/api-client'
import { useAddTicketCommentMutation } from '../hooks/use-tickets'
import { commentSchema } from '../schemas/ticket-schemas'
import type { CommentFormValues } from '../schemas/ticket-schemas'
import type { CommentRead, TicketRead } from '../types/ticket-types'

function commentError(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.'
  if (error instanceof ApiError && error.status === 403) return 'No tienes permiso para comentar este ticket.'
  if (error instanceof ApiError && error.status === 409) return 'El ticket ya no admite comentarios.'
  if (error instanceof ApiError && error.status === 422) return 'Revisa el comentario e inténtalo nuevamente.'
  return 'No pudimos publicar el comentario. Inténtalo nuevamente.'
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function TicketComments({ ticket }: { ticket: TicketRead }) {
  const [comments, setComments] = useState<CommentRead[]>([])
  const mutation = useAddTicketCommentMutation(ticket.id)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentFormValues>({ resolver: zodResolver(commentSchema), defaultValues: { content: '' } })
  const canComment = ticket.status !== 'CERRADO' && ticket.status !== 'CANCELADO'
  const submit = handleSubmit(async (data) => {
    mutation.reset()
    try {
      const comment = await mutation.mutateAsync(data)
      setComments((current) => current.some((item) => item.id === comment.id) ? current : [...current, comment])
      reset()
    } catch { /* The mutation error is rendered below. */ }
  })

  return <section className="ticket-comments" aria-labelledby="ticket-comments-title">
    <h2 id="ticket-comments-title">Comentarios</h2>
    <p className="ticket-comments-note" role="note">El contrato actual del backend no permite recuperar el contenido de comentarios anteriores. Aquí verás los que publiques mientras esta pantalla permanezca abierta.</p>
    {comments.length > 0 && <ul className="ticket-comments-list">{comments.map((comment) => <li key={comment.id}><p>{comment.content}</p><time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time></li>)}</ul>}
    {canComment ? <form className="ticket-comment-form" onSubmit={(event) => { void submit(event) }} noValidate>
      <label htmlFor="ticket-comment">Comentario</label>
      <textarea id="ticket-comment" rows={4} maxLength={5001} aria-invalid={Boolean(errors.content)} {...register('content')} />
      {errors.content && <span className="field-error" role="alert">{errors.content.message}</span>}
      {mutation.isError && <div className="form-error" role="alert">{commentError(mutation.error)}</div>}
      <button className="button" type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Publicando…' : 'Publicar comentario'}</button>
    </form> : <div className="state"><strong>Este ticket ya no admite comentarios.</strong><span>Su estado es final y solo el personal autorizado gestiona transiciones.</span></div>}
  </section>
}
