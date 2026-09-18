import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ApiError } from '../../../lib/api-client'
import type { CategoryRead } from '../../faqs/types/faq-types'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Field, Input, Select, Textarea } from '../../../components/ui/form-controls'
import { Icon } from '../../../components/ui/icons'
import { ticketCreateSchema, type TicketFormValues } from '../schemas/ticket-schemas'
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
  const { register, handleSubmit, watch, formState: { errors } } = useForm<TicketFormValues>({ resolver: zodResolver(ticketCreateSchema), defaultValues: { category_id: '', subject: '', description: '', priority: undefined } })
  const values = watch()
  const submit = handleSubmit(async (data) => {
    mutation.reset()
    try { onCreated(await mutation.mutateAsync({ data, conversationId })) } catch { /* error is rendered below */ }
  })
  const activeCategories = categories.filter((category) => category.is_active)
  return <Card><form onSubmit={(event) => { void submit(event) }} noValidate className="space-y-5" aria-busy={mutation.isPending}>
    <Field label="Categoría" required error={errors.category_id?.message}><Select id="ticket-category" aria-label="Categoría" {...register('category_id')} error={Boolean(errors.category_id)}><option value="">Selecciona una categoría</option>{activeCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></Field>
    <Field label="Asunto" required error={errors.subject?.message}><Input id="ticket-subject" aria-label="Asunto" maxLength={200} placeholder="Resume tu consulta en una línea" {...register('subject')} error={Boolean(errors.subject)} /></Field>
    <Field label="Descripción" required hint={!errors.description ? 'Incluye todos los detalles relevantes de tu caso.' : undefined} error={errors.description?.message}><Textarea id="ticket-description" aria-label="Descripción" rows={7} maxLength={10000} placeholder="Describe tu solicitud…" {...register('description')} error={Boolean(errors.description)} /></Field>
    <Field label="Prioridad" required error={errors.priority?.message}><Select id="ticket-priority" aria-label="Prioridad" {...register('priority')} error={Boolean(errors.priority)}><option value="">Selecciona una prioridad</option><option value="BAJA">Baja</option><option value="MEDIA">Media</option><option value="ALTA">Alta</option><option value="URGENTE">Urgente</option></Select></Field>
    {(values.subject || values.category_id || values.description) && <div className="rounded-[12px] border border-[#e6edef] bg-[#f4f7f8] p-4"><p className="mb-2.5 text-[12px] font-bold uppercase tracking-wider text-muted">Resumen de tu solicitud</p><dl className="grid gap-2 text-[13.5px]"><div className="flex gap-2"><dt className="w-24 shrink-0 text-muted">Asunto</dt><dd className="font-medium text-ink">{values.subject || '—'}</dd></div><div className="flex gap-2"><dt className="w-24 shrink-0 text-muted">Categoría</dt><dd className="font-medium text-ink">{activeCategories.find((category) => category.id === values.category_id)?.name ?? '—'}</dd></div></dl></div>}
    {mutation.isError && <div className="rounded-[10px] border border-[#e5c0bd] bg-[#fbe3e2] p-3.5 text-[13px] font-medium text-danger" role="alert">{creationError(mutation.error, Boolean(conversationId))}</div>}
    <div className="flex flex-wrap justify-end gap-2.5 pt-1"><Button variant="secondary" type="button" onClick={() => window.history.back()}>Cancelar</Button><Button type="submit" loading={mutation.isPending} icon={Icon.send}>{mutation.isPending ? 'Enviando…' : conversationId ? 'Convertir en ticket' : 'Enviar solicitud'}</Button></div>
  </form></Card>
}
