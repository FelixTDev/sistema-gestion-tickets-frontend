import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui/card'
import { Icon } from '../../../components/ui/icons'
import { EmptyState, ErrorState } from '../../../components/ui/states'
import { Skeleton } from '../../../components/ui/skeleton'
import { formatCategoryLabel, getCategoryIcon } from '../../../lib/formatters'
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
  const categoryNames = useMemo(
    () => Object.fromEntries(activeCategories.map((category) => [category.id, category.name])),
    [activeCategories],
  )
  const isLoading = faqsQuery.isLoading || categoriesQuery.isLoading
  const isError = faqsQuery.isError || categoriesQuery.isError

  return (
    <div className="bg-[#f4f7f8] pb-16">
      {/* Hero Header Hub */}
      <section className="relative overflow-hidden bg-[#06243a] text-white">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-turq/20 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[12.5px] font-semibold text-[#cfe0e6] shadow-sm">
            <Icon.book size={14} className="text-green" /> Base de Conocimiento GNB Perú
          </span>
          <h1 className="text-[34px] font-extrabold tracking-tight text-white sm:text-[44px]">
            Preguntas Frecuentes
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[16px] leading-relaxed text-[#c6d7de]">
            Encuentra información verificada y orientaciones claras sobre nuestros canales y servicios.
          </p>

          {/* Buscador Integrado en Hero */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="relative flex items-center shadow-xl">
              <label htmlFor="faq-search" className="sr-only">
                Buscar en la base de conocimiento
              </label>
              <Icon.search
                size={20}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#798c96]"
              />
              <input
                id="faq-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Busca un tema o palabra clave (ej. saldo, tarjeta)..."
                className="h-[56px] w-full rounded-[14px] border border-[#d2e0e4] bg-white py-3.5 pl-11 pr-11 text-[15px] font-medium text-ink outline-none transition-colors placeholder:text-[#798c96] focus:border-turq-dark focus:ring-2 focus:ring-turq/30"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[#798c96] hover:bg-[#f4f7f8] hover:text-ink"
                  aria-label="Limpiar búsqueda"
                >
                  <Icon.x size={16} />
                </button>
              )}
            </div>

            {!isLoading && !isError && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[12.5px] text-[#cfe0e6]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green" />
                  Mostrando <strong className="text-white">{visibleFaqs.length}</strong> de{' '}
                  <strong className="text-white">{activeFaqs.length}</strong> temas publicados
                </span>
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="font-semibold text-green hover:underline"
                  >
                    Restablecer búsqueda
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contenido Principal */}
      <section className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
        {isLoading && (
          <div role="status" aria-label="Cargando preguntas frecuentes" className="space-y-4">
            <span className="sr-only">Cargando preguntas frecuentes…</span>
            <Skeleton className="h-[120px] rounded-[16px]" />
            <Skeleton className="h-[76px] rounded-[14px]" />
            <Skeleton className="h-[76px] rounded-[14px]" />
            <Skeleton className="h-[76px] rounded-[14px]" />
          </div>
        )}

        {isError && (
          <Card>
            <ErrorState
              title="No pudimos cargar las preguntas frecuentes"
              onRetry={() => {
                void faqsQuery.refetch()
                void categoriesQuery.refetch()
              }}
            />
          </Card>
        )}

        {!isLoading && !isError && (
          <>
            {/* Grilla Interactiva de Categorías */}
            <div id="categorias" className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[20px] font-extrabold text-ink">Categorías de Consulta</h2>
                {categoryId && (
                  <button
                    type="button"
                    onClick={() => setCategoryId('')}
                    className="text-[13px] font-bold text-turq-dark hover:underline"
                  >
                    Ver todas las categorías
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Filtrar por categoría">
                {/* Opción 'Todas' */}
                <button
                  type="button"
                  aria-pressed={categoryId === ''}
                  onClick={() => setCategoryId('')}
                  className={`gnb-fade flex items-center gap-3.5 rounded-[14px] border p-4 text-left transition-all duration-200 ${
                    categoryId === ''
                      ? 'border-[#0b4963] bg-[#06243a] text-white shadow-md'
                      : 'border-[#e6edef] bg-white text-ink hover:border-turq-dark hover:shadow-xs'
                  }`}
                >
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-[10px] ${
                      categoryId === '' ? 'bg-white/15 text-green' : 'bg-[#eef4f5] text-turq-dark'
                    }`}
                  >
                    <Icon.grid size={20} />
                  </span>
                  <div>
                    <p className="text-[14.5px] font-bold">Todas las categorías</p>
                    <p className={`text-[12px] ${categoryId === '' ? 'text-[#a2c4d3]' : 'text-muted'}`}>
                      {activeFaqs.length} temas
                    </p>
                  </div>
                </button>

                {/* Tarjetas por Categoría */}
                {activeCategories.map((category) => {
                  const CategoryIcon = getCategoryIcon(category.name)
                  const isSelected = categoryId === category.id
                  const count = activeFaqs.filter((f) => f.category_id === category.id).length

                  return (
                    <button
                      key={category.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setCategoryId(category.id)}
                      className={`gnb-fade flex items-center gap-3.5 rounded-[14px] border p-4 text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-[#0b4963] bg-[#06243a] text-white shadow-md'
                          : 'border-[#e6edef] bg-white text-ink hover:border-turq-dark hover:shadow-xs'
                      }`}
                    >
                      <span
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-[10px] ${
                          isSelected ? 'bg-white/15 text-green' : 'bg-[#eef4f5] text-turq-dark'
                        }`}
                      >
                        <CategoryIcon size={20} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[14.5px] font-bold">
                          {formatCategoryLabel(category.name)}
                        </p>
                        <p className={`text-[12px] ${isSelected ? 'text-[#a2c4d3]' : 'text-muted'}`}>
                          {count} {count === 1 ? 'pregunta' : 'preguntas'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Listado de Acordeón */}
            <div className="mb-12">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[20px] font-extrabold text-ink">
                  {search
                    ? 'Resultados de búsqueda'
                    : categoryId
                    ? `Preguntas de ${formatCategoryLabel(categoryNames[categoryId])}`
                    : 'Todas las preguntas'}
                </h2>
                <span className="text-[13px] font-medium text-muted">
                  {visibleFaqs.length} {visibleFaqs.length === 1 ? 'resultado' : 'resultados'}
                </span>
              </div>

              {activeFaqs.length === 0 ? (
                <Card>
                  <EmptyState
                    icon={Icon.book}
                    title="Aún no hay preguntas frecuentes disponibles"
                    desc="Cuando se publiquen respuestas en la base de conocimiento, aparecerán aquí."
                  />
                </Card>
              ) : visibleFaqs.length === 0 ? (
                <Card className="p-8 text-center">
                  <EmptyState
                    icon={Icon.search}
                    title="Sin resultados para tu búsqueda"
                    desc="Intenta con otras palabras o limpia los filtros de búsqueda."
                    action={
                      <div className="mt-4 flex flex-wrap justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSearch('')
                            setCategoryId('')
                          }}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-[#cdd9de] bg-white px-5 text-[14px] font-semibold text-ink hover:border-turq-dark"
                        >
                          Limpiar filtros
                        </button>
                        <Link
                          to="/chat"
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-turq-dark px-5 text-[14px] font-semibold text-white shadow-sm hover:bg-[#055b62]"
                        >
                          <Icon.bot size={17} /> Hablar con el asistente
                        </Link>
                      </div>
                    }
                  />
                </Card>
              ) : (
                <FaqAccordion faqs={visibleFaqs} categoryNames={categoryNames} />
              )}
            </div>

            {/* Banner de Escalamiento Dual */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="gnb-fade flex flex-col justify-between rounded-[18px] border border-[#e6edef] bg-white p-7 shadow-xs">
                <div>
                  <span className="mb-4 grid h-12 w-12 place-items-center rounded-[12px] bg-[#eef4f5] text-turq-dark">
                    <Icon.bot size={24} />
                  </span>
                  <h3 className="text-[19px] font-extrabold text-ink">Asistente Virtual 24/7</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">
                    ¿Tienes una duda específica? Conversa de inmediato con nuestro asistente para recibir respuestas automáticas y orientación.
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    to="/chat"
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-turq-dark px-5 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-[#055b62]"
                  >
                    <Icon.chat size={18} /> Iniciar conversación
                  </Link>
                </div>
              </div>

              <div className="gnb-fade flex flex-col justify-between rounded-[18px] border border-[#e6edef] bg-[#06243a] p-7 text-white shadow-xs">
                <div>
                  <span className="mb-4 grid h-12 w-12 place-items-center rounded-[12px] bg-white/10 text-green">
                    <Icon.ticket size={24} />
                  </span>
                  <h3 className="text-[19px] font-extrabold text-white">¿Requieres un Ticket de Atención?</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#c6d7de]">
                    Registra tu requerimiento formal para recibir seguimiento con un código único y la intervención de nuestros asesores.
                  </p>
                </div>
                <div className="mt-6">
                  <Link
                    to="/login"
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-green px-5 text-[14px] font-semibold text-ink-900 shadow-sm transition-colors hover:bg-[#7eb535]"
                  >
                    <Icon.lock size={18} /> Ingresar para crear ticket
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
