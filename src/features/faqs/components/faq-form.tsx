import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { CategoryRead, FAQRead } from '../types/faq-types'
import { faqFormSchema, type FaqFormValues } from '../knowledge-schemas'
import { Button } from '../../../components/ui/button'
import { Field, Input, Select, Textarea } from '../../../components/ui/form-controls'

type FaqFormProps = {
  categories: CategoryRead[]
  initialValue?: Pick<FAQRead, 'category_id' | 'question' | 'answer' | 'keywords'>
  submitLabel?: string
  isSubmitting?: boolean
  onSubmit: (data: FaqFormValues) => void
  onCancel?: () => void
}

export function FaqForm({ categories, initialValue, submitLabel = 'Guardar FAQ', isSubmitting = false, onSubmit, onCancel }: FaqFormProps) {
  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: { category_id: initialValue?.category_id ?? categories.find((category) => category.is_active)?.id ?? '', question: initialValue?.question ?? '', answer: initialValue?.answer ?? '', keywords: initialValue?.keywords ?? '' },
  })
  const { register, handleSubmit, formState: { errors } } = form
  return <form className="knowledge-form" onSubmit={handleSubmit((data) => onSubmit(data))} noValidate>
    <Field label="Categoría" error={errors.category_id?.message} required><Select {...register('category_id')}><option value="">Selecciona una categoría…</option>{categories.filter((category) => category.is_active).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></Field>
    <Field label="Pregunta" error={errors.question?.message} required><Input {...register('question')} maxLength={2000} placeholder="Escribe la pregunta…" /></Field>
    <Field label="Respuesta" error={errors.answer?.message} required><Textarea {...register('answer')} maxLength={10000} rows={6} placeholder="Escribe la respuesta…" /></Field>
    <Field label="Palabras clave" hint="Separa las palabras con comas." error={errors.keywords?.message} required><Input {...register('keywords')} maxLength={2000} placeholder="Ej. cuenta, consulta" /></Field>
    <div className="knowledge-form-actions"><Button type="submit" loading={isSubmitting}>{submitLabel}</Button>{onCancel && <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>}</div>
  </form>
}
