import { useMemo, useState } from 'react'
import { PageContainer } from '../../../components/layout/page-container'
import { SectionHeading } from '../../../components/ui/section-heading'
import { FaqAccordion } from '../components/faq-accordion'
import { filterFaqs, useCategories, useFaqs } from '../hooks/use-faqs'

export function FaqPage() {
  const faqsQuery = useFaqs()
  const categoriesQuery = useCategories()
  const [categoryId, setCategoryId] = useState('')
  const [search, setSearch] = useState('')
  const activeCategories = useMemo(
    () => (categoriesQuery.data ?? []).filter((category) => category.is_active),
    [categoriesQuery.data],
  )
  const activeFaqs = useMemo(
    () => (faqsQuery.data ?? []).filter((faq) => faq.is_active),
    [faqsQuery.data],
  )
  const visibleFaqs = useMemo(
    () => filterFaqs({ faqs: activeFaqs, categoryId, search }),
    [activeFaqs, categoryId, search],
  )

  return <PageContainer as="section" className="standard-page faq-page">
    <SectionHeading eyebrow="Centro de orientación" title="Preguntas frecuentes" level={1}>Consulta información general publicada en la base de conocimiento del prototipo.</SectionHeading>
    {(faqsQuery.isLoading || categoriesQuery.isLoading) && <div className="state" role="status">Cargando preguntas frecuentes…</div>}
    {(faqsQuery.isError || categoriesQuery.isError) && <div className="state state-error" role="alert"><strong>No pudimos cargar las preguntas frecuentes.</strong><button className="button button-small" type="button" onClick={() => { void faqsQuery.refetch(); void categoriesQuery.refetch() }}>Reintentar</button></div>}
    {!faqsQuery.isLoading && !categoriesQuery.isLoading && !faqsQuery.isError && !categoriesQuery.isError && <>
    <div className="faq-tools">
      <label htmlFor="faq-search">Buscar preguntas</label>
      <input id="faq-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Busca por tema o palabra clave" />
      <div className="faq-categories" aria-label="Filtrar por categoría">
        <button type="button" aria-pressed={categoryId === ''} onClick={() => setCategoryId('')}>Todas</button>
        {activeCategories.map((category) => <button key={category.id} type="button" aria-pressed={categoryId === category.id} onClick={() => setCategoryId(category.id)}>{category.name}</button>)}
      </div>
    </div>
    {activeFaqs.length === 0
      ? <div className="state"><strong>Aún no hay preguntas frecuentes disponibles.</strong></div>
      : visibleFaqs.length === 0
        ? <div className="state"><strong>No encontramos preguntas con esos filtros.</strong></div>
        : <><p className="faq-count" aria-live="polite">{visibleFaqs.length} {visibleFaqs.length === 1 ? 'pregunta encontrada' : 'preguntas encontradas'}</p><FaqAccordion faqs={visibleFaqs} /></>}
    </>}
  </PageContainer>
}
