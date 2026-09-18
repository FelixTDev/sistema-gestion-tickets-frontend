import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/button'
import { Field, Input, Textarea } from '../../../components/ui/form-controls'
import { categoryFormSchema, type CategoryFormValues } from '../knowledge-schemas'
import type { CategoryRead } from '../types/faq-types'

export function CategoryForm({ initialValue, submitLabel = 'Guardar categoría', isSubmitting = false, onSubmit, onCancel }: { initialValue?: Pick<CategoryRead, 'name' | 'description'>; submitLabel?: string; isSubmitting?: boolean; onSubmit: (data: CategoryFormValues) => void; onCancel?: () => void }) {
  const form = useForm<CategoryFormValues>({ resolver: zodResolver(categoryFormSchema), defaultValues: { name: initialValue?.name ?? '', description: initialValue?.description ?? '' } })
  const { register, handleSubmit, formState: { errors } } = form
  return <form className="knowledge-form" onSubmit={handleSubmit((data) => onSubmit(data))} noValidate>
    <Field label="Nombre" error={errors.name?.message} required><Input {...register('name')} maxLength={80} placeholder="Ej. Seguros" /></Field>
    <Field label="Descripción" error={errors.description?.message} required><Textarea {...register('description')} maxLength={1000} rows={4} placeholder="Describe el alcance de la categoría…" /></Field>
    <div className="knowledge-form-actions"><Button type="submit" loading={isSubmitting}>{submitLabel}</Button>{onCancel && <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>}</div>
  </form>
}
