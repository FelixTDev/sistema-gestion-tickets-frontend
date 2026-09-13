import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ApiError } from '../../../lib/api-client'
import type { CategoryRead } from '../../faqs/types/faq-types'
import { ticketCreateSchema } from '../schemas/ticket-schemas'
import type { TicketFormValues } from '../schemas/ticket-schemas'
import type { TicketRead } from '../types/ticket-types'
import { useCreateTicketMutation } from '../hooks/use-tickets'

function creationError(error: unknown, isConversion: boolean): string {
  if (!(error instanceof ApiError)) return isConversion ? 'No pudimos convertir la conversación. Inténtalo nuevamente.' : 'No pudimos crear el ticket. Inténtalo nuevamente.'
  if (error.status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente.'
  if (error.status === 403) return 'No tienes permiso para crear este ticket.'
  if (error.status === 422) return 'Revisa los datos ingresados e inténtalo nuevamente.'
  if (error.status === 409) return isConversion ? 'La conversación no se puede convertir en ticket.' : 'No se pudo crear el ticket por un conflicto.'
  return isConversion ? 'No pudimos convertir la conversación. Inténtalo nuevamente.' : 'No pudimos crear el ticket. Inténtalo nuevamente.'
}

export function TicketForm({ categories, conversationId, onCreated }: { categories: CategoryRead[]; conversationId: string | null; onCreated: (ticket: TicketRead) => void }) {
  const mutation = useCreateTicketMutation()
  const { register, handleSubmit, formState: { errors } } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketCreateSchema),
    defaultValues: { category_id: '', subject: '', description: '' },
  })
  const submit = handleSubmit(async (data) => {
    mutation.reset()
    try { onCreated(await mutation.mutateAsync({ data, conversationId })) } catch { /* Rendered from mutation.error. */ }
  })

  return <form className="ticket-form card" onSubmit={(event) => { void submit(event) }} noValidate>
    <label htmlFor="ticket-category">Categoría</label>
    <select id="ticket-category" aria-invalid={Boolean(errors.category_id)} {...register('category_id')}>
      <option value="">Selecciona una categoría</option>
      {categories.filter((category) => category.is_active).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
    </select>
    {errors.category_id && <span className="field-error" role="alert">{errors.category_id.message}</span>}

    <label htmlFor="ticket-subject">Asunto</label>
    <input id="ticket-subject" maxLength={200} aria-invalid={Boolean(errors.subject)} {...register('subject')} />
    {errors.subject && <span className="field-error" role="alert">{errors.subject.message}</span>}

    <label htmlFor="ticket-description">Descripción</label>
    <textarea id="ticket-description" maxLength={10000} rows={7} aria-invalid={Boolean(errors.description)} {...register('description')} />
    {errors.description && <span className="field-error" role="alert">{errors.description.message}</span>}

    <label htmlFor="ticket-priority">Prioridad</label>
    <select id="ticket-priority" aria-invalid={Boolean(errors.priority)} {...register('priority')}>
      <option value="">Selecciona una prioridad</option><option value="BAJA">Baja</option><option value="MEDIA">Media</option><option value="ALTA">Alta</option><option value="URGENTE">Urgente</option>
    </select>
    {errors.priority && <span className="field-error" role="alert">{errors.priority.message}</span>}

    {mutation.isError && <div className="form-error" role="alert">{creationError(mutation.error, Boolean(conversationId))}</div>}
    <button className="button" type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Enviando…' : conversationId ? 'Convertir en ticket' : 'Enviar solicitud'}</button>
  </form>
}
