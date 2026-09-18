import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui/card'
import { Icon } from '../../../components/ui/icons'
import { EmptyState, ErrorState } from '../../../components/ui/states'
import { Skeleton } from '../../../components/ui/skeleton'
import { FaqAccordion } from '../components/faq-accordion'
import { filterFaqs, useCategories, useFaqs } from '../hooks/use-faqs'

export function FaqPage() {
  const faqsQuery = useFaqs()
  const categoriesQuery = useCategories()
  const [categoryId, setCategoryId] = useState('')
  const [search, setSearch] = useState('')
  const activeCategories = useMemo(() => (categoriesQuery.data ?? []).filter((category) => category.is_active), [categoriesQuery.data])
  const activeFaqs = useMemo(() => (faqsQuery.data ?? []).filter((faq) => faq.is_active), [faqsQuery.data])
  const visibleFaqs = useMemo(() => filterFaqs({ faqs: activeFaqs, categoryId, search }), [activeFaqs, categoryId, search])
  const categoryNames = useMemo(() => Object.fromEntries(activeCategories.map((category) => [category.id, category.name])), [activeCategories])
  const isLoading = faqsQuery.isLoading || categoriesQuery.isLoading
  const isError = faqsQuery.isError || categoriesQuery.isError

  return <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
    <header className="mb-9 text-center"><h1 className="text-[34px] font-extrabold text-ink">Preguntas frecuentes</h1><p className="mt-2 text-[15px] text-muted">Encuentra respuestas rápidas a las consultas más comunes.</p></header>
    {isLoading && <div role="status" aria-label="Cargando preguntas frecuentes" className="space-y-3"><span className="sr-only">Cargando preguntas frecuentes…</span><Skeleton className="h-[52px]" /><Skeleton className="h-[76px]" /><Skeleton className="h-[76px]" /></div>}
    {isError && <Card><ErrorState title="No pudimos cargar las preguntas frecuentes" onRetry={() => { void faqsQuery.refetch(); void categoriesQuery.refetch() }} /></Card>}
    {!isLoading && !isError && <>
      <div className="relative mb-5">
        <label htmlFor="faq-search" className="sr-only">Buscar preguntas</label>
        <Icon.search size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input id="faq-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Busca una pregunta o palabra clave…" className="h-[52px] w-full rounded-[12px] border border-[#cdd9de] bg-white py-3.5 pl-12 pr-4 text-[15px] text-ink outline-none placeholder:text-[#798c96] focus:border-turq-dark" />
      </div>
      <div className="mb-7 flex flex-wrap gap-2" aria-label="Filtrar por categoría">
        <button type="button" aria-pressed={categoryId === ''} onClick={() => setCategoryId('')} className={`min-h-11 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${categoryId === '' ? 'bg-turq-dark text-white' : 'border border-[#dbe4e7] bg-white text-muted hover:border-turq-dark hover:text-turq-dark'}`}>Todas</button>
        {activeCategories.map((category) => <button key={category.id} type="button" aria-pressed={categoryId === category.id} onClick={() => setCategoryId(category.id)} className={`min-h-11 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${categoryId === category.id ? 'bg-turq-dark text-white' : 'border border-[#dbe4e7] bg-white text-muted hover:border-turq-dark hover:text-turq-dark'}`}>{category.name}</button>)}
      </div>
      {activeFaqs.length === 0 ? <Card><EmptyState icon={Icon.book} title="Aún no hay preguntas frecuentes disponibles" desc="Cuando se publiquen respuestas, aparecerán aquí." /></Card>
        : visibleFaqs.length === 0 ? <Card><EmptyState icon={Icon.search} title="Sin resultados" desc="No encontramos preguntas que coincidan con tu búsqueda. Intenta con otras palabras." action={<Link to="/chat" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-turq-dark px-5 text-[14px] font-semibold text-white"><Icon.bot size={17} /> Hablar con el asistente</Link>} /></Card>
          : <><p className="sr-only" aria-live="polite">{visibleFaqs.length} {visibleFaqs.length === 1 ? 'pregunta encontrada' : 'preguntas encontradas'}</p><FaqAccordion faqs={visibleFaqs} categoryNames={categoryNames} /></>}
      <Card className="mt-8 border-none bg-[#eef6f7] !p-7 text-center"><p className="mb-1 text-[16px] font-bold text-ink">¿No encontraste lo que buscabas?</p><p className="mb-4 text-[14px] text-muted">Nuestro asistente puede ayudarte con tu consulta.</p><Link to="/chat" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-turq-dark px-5 text-[14px] font-semibold text-white"><Icon.bot size={17} /> Habla con nuestro asistente</Link></Card>
    </>}
  </section>
}
