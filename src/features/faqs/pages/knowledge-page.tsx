import { useMemo, useState } from 'react'
import { Card } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Modal } from '../../../components/ui/modal'
import { Tabs } from '../../../components/ui/tabs'
import { EmptyState, ErrorState, LoadingState } from '../../../components/ui/states'
import { Icon } from '../../../components/ui/icons'
import { PageHeader } from '../../../components/layout/page-header'
import { FaqPagination } from '../components/faq-pagination'
import { CategoryForm } from '../components/category-form'
import { FaqForm } from '../components/faq-form'
import {
  useAdminFaqs,
  useCategories,
  useCreateCategoryMutation,
  useCreateFaqMutation,
  useFaqHistory,
  useFaqUtilityMetrics,
  useSetCategoryStatusMutation,
  useSetFaqStatusMutation,
  useUpdateFaqMutation,
  useUpdateCategoryMutation,
  useUpdateFaqWorkflowMutation,
} from '../hooks/use-faqs'
import type { CategoryRead, FAQAdminRead, FaqStatus } from '../types/faq-types'

type ModalState = { kind: 'faq' | 'category'; item?: FAQAdminRead | CategoryRead } | null
type StatusConfirmation = { kind: 'faq' | 'category'; id: string; label: string; isActive: boolean } | null

const statuses: Array<FaqStatus | ''> = ['', 'DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']

function nextStatus(status: FaqStatus): { status: FaqStatus; label: string } | null {
  if (status === 'DRAFT') return { status: 'REVIEW', label: 'Enviar a revisión' }
  if (status === 'REVIEW') return { status: 'PUBLISHED', label: 'Publicar' }
  if (status === 'PUBLISHED') return { status: 'ARCHIVED', label: 'Archivar' }
  return { status: 'PUBLISHED', label: 'Restaurar' }
}

export function KnowledgePage() {
  const [tab, setTab] = useState('faqs')
  const [modal, setModal] = useState<ModalState>(null)
  const [statusConfirmation, setStatusConfirmation] = useState<StatusConfirmation>(null)
  const [historyFaqId, setHistoryFaqId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<FaqStatus | ''>('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const faqs = useAdminFaqs({ status: statusFilter || undefined, search: search || undefined, page, page_size: 10 })
  const categories = useCategories()
  const metrics = useFaqUtilityMetrics()
  const history = useFaqHistory(historyFaqId)
  const createFaq = useCreateFaqMutation()
  const updateFaq = useUpdateFaqMutation()
  const setFaqStatus = useSetFaqStatusMutation()
  const updateFaqWorkflow = useUpdateFaqWorkflowMutation()
  const createCategory = useCreateCategoryMutation()
  const updateCategory = useUpdateCategoryMutation()
  const setCategoryStatus = useSetCategoryStatusMutation()
  const allFaqs = faqs.data?.items ?? []
  const allCategories = categories.data ?? []
  const activeCategories = useMemo(() => allCategories.filter((category) => category.is_active), [allCategories])
  const loading = faqs.isLoading || categories.isLoading || metrics.isLoading
  const error = faqs.isError || categories.isError
  const close = () => setModal(null)
  const closeStatusConfirmation = () => setStatusConfirmation(null)

  const confirmStatusChange = () => {
    if (!statusConfirmation) return
    const { kind, id, isActive } = statusConfirmation
    if (kind === 'faq') setFaqStatus.mutate({ faqId: id, data: { is_active: !isActive } }, { onSuccess: closeStatusConfirmation })
    else setCategoryStatus.mutate({ categoryId: id, data: { is_active: !isActive } }, { onSuccess: closeStatusConfirmation })
  }

  const faqSubmit = (data: { category_id: string; question: string; answer: string; keywords: string }) => {
    if (modal?.kind === 'faq' && modal.item && 'question' in modal.item) updateFaq.mutate({ faqId: modal.item.id, data }, { onSuccess: close })
    else createFaq.mutate(data, { onSuccess: close })
  }
  const categorySubmit = (data: { name: string; description: string }) => {
    if (modal?.kind === 'category' && modal.item && 'name' in modal.item) updateCategory.mutate({ categoryId: modal.item.id, data }, { onSuccess: close })
    else createCategory.mutate(data, { onSuccess: close })
  }
  const mutationError = createFaq.error ?? updateFaq.error ?? setFaqStatus.error ?? updateFaqWorkflow.error ?? createCategory.error ?? updateCategory.error ?? setCategoryStatus.error
  const retry = () => { void faqs.refetch(); void categories.refetch(); void metrics.refetch() }

  return <section className="knowledge-page">
    <PageHeader eyebrow="Supervisión" title="Gestión de conocimiento" subtitle="Administra FAQ, estados editoriales, categorías y métricas de utilidad." action={tab === 'faqs' ? <Button icon={Icon.plus} onClick={() => setModal({ kind: 'faq' })}>Nueva FAQ</Button> : <Button icon={Icon.plus} onClick={() => setModal({ kind: 'category' })}>Nueva categoría</Button>} />
    {metrics.data && <Card className="knowledge-metrics"><strong>Utilidad de la base</strong><span>{metrics.data.usefulness_rate}% útil · {metrics.data.total_feedback} respuestas</span></Card>}
    {loading && <LoadingState message="Cargando base de conocimiento…" />}
    {error && <Card><ErrorState title="No pudimos cargar la base de conocimiento" onRetry={retry} /></Card>}
    {metrics.isError && <div className="form-error" role="alert">No pudimos cargar las métricas de utilidad.</div>}
    {mutationError && !modal && !statusConfirmation && <div className="form-error" role="alert">No pudimos guardar el cambio. Inténtalo nuevamente.</div>}
    {!loading && !error && <>
      <Tabs aria-label="Gestión de conocimiento" tabs={[{ id: 'faqs', label: 'Preguntas frecuentes', panelId: 'knowledge-faqs' }, { id: 'categories', label: 'Categorías', panelId: 'knowledge-categories' }]} value={tab} onChange={setTab} />
      {tab === 'faqs' && <section id="knowledge-faqs" role="tabpanel" aria-label="Preguntas frecuentes" className="knowledge-list">
        <div className="flex flex-wrap items-end gap-3 py-4">
          <label htmlFor="knowledge-search">Buscar<input id="knowledge-search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></label>
          <label htmlFor="knowledge-status">Estado<select id="knowledge-status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as FaqStatus | ''); setPage(1) }}>{statuses.map((status) => <option key={status} value={status}>{status || 'Todos'}</option>)}</select></label>
        </div>
        {allFaqs.length === 0 ? <Card><EmptyState icon={Icon.book} title="No hay FAQ para estos filtros" desc="Crea una FAQ o consulta otro estado editorial." /></Card> : allFaqs.map((faq) => {
          const transition = nextStatus(faq.status)
          return <Card key={faq.id} className="knowledge-item"><div><p className="knowledge-item-label">{allCategories.find((category) => category.id === faq.category_id)?.name ?? 'Categoría no disponible'} · {faq.status}</p><h2>{faq.title || faq.question}</h2><p>{faq.question}</p><p>{faq.answer}</p><small>Versión {faq.version} · Palabras clave: {faq.keywords}</small></div><div className="knowledge-item-actions"><Button size="sm" variant="secondary" onClick={() => setModal({ kind: 'faq', item: faq })}>Editar</Button><Button size="sm" variant="ghost" onClick={() => setHistoryFaqId(faq.id)}>Historial</Button>{transition && <Button size="sm" variant="secondary" onClick={() => updateFaqWorkflow.mutate({ faqId: faq.id, data: { status: transition.status } })} loading={updateFaqWorkflow.isPending}>{transition.label}</Button>}<Button size="sm" variant="ghost" onClick={() => setStatusConfirmation({ kind: 'faq', id: faq.id, label: faq.question, isActive: faq.is_active })} disabled={setFaqStatus.isPending}>{faq.is_active ? 'Desactivar' : 'Activar'}</Button></div></Card>
        })}
        <FaqPagination page={faqs.data?.page ?? page} totalPages={faqs.data?.total_pages ?? 0} onPageChange={setPage} />
      </section>}
      {tab === 'categories' && <section id="knowledge-categories" role="tabpanel" aria-label="Categorías" className="knowledge-categories">{allCategories.length === 0 ? <Card><EmptyState icon={Icon.tag} title="Aún no hay categorías" desc="Crea una categoría para organizar el conocimiento." /></Card> : <Card pad={false}><table className="knowledge-table"><thead><tr><th scope="col">Nombre</th><th scope="col">Descripción</th><th scope="col">Estado</th><th scope="col"><span className="sr-only">Acciones</span></th></tr></thead><tbody>{allCategories.map((category) => <tr key={category.id}><th scope="row">{category.name}</th><td>{category.description}</td><td>{category.is_active ? 'Activa' : 'Inactiva'}</td><td><div className="knowledge-item-actions"><Button size="sm" variant="secondary" onClick={() => setModal({ kind: 'category', item: category })}>Editar</Button><Button size="sm" variant="ghost" onClick={() => setStatusConfirmation({ kind: 'category', id: category.id, label: category.name, isActive: category.is_active })}>{category.is_active ? 'Desactivar' : 'Activar'}</Button></div></td></tr>)}</tbody></table></Card>}</section>}
    </>}
    <Modal open={modal?.kind === 'faq'} onClose={close} title={modal?.item && 'question' in modal.item ? 'Editar FAQ' : 'Nueva FAQ'}>{(createFaq.error || updateFaq.error) && <div className="form-error mb-4" role="alert">No pudimos guardar el cambio. Inténtalo nuevamente.</div>}<FaqForm categories={activeCategories} initialValue={modal?.kind === 'faq' && modal.item && 'question' in modal.item ? modal.item : undefined} submitLabel={modal?.item && 'question' in modal.item ? 'Guardar cambios' : 'Crear FAQ'} isSubmitting={createFaq.isPending || updateFaq.isPending} onSubmit={faqSubmit} onCancel={close} /></Modal>
    <Modal open={modal?.kind === 'category'} onClose={close} title={modal?.item && 'name' in modal.item ? 'Editar categoría' : 'Nueva categoría'}>{(createCategory.error || updateCategory.error) && <div className="form-error mb-4" role="alert">No pudimos guardar el cambio. Inténtalo nuevamente.</div>}<CategoryForm initialValue={modal?.kind === 'category' && modal.item && 'name' in modal.item ? modal.item : undefined} submitLabel={modal?.item && 'name' in modal.item ? 'Guardar cambios' : 'Crear categoría'} isSubmitting={createCategory.isPending || updateCategory.isPending} onSubmit={categorySubmit} onCancel={close} /></Modal>
    <Modal open={Boolean(statusConfirmation)} onClose={closeStatusConfirmation} title={statusConfirmation?.isActive ? 'Confirmar desactivación' : 'Confirmar activación'} footer={<><Button variant="secondary" onClick={closeStatusConfirmation}>Cancelar</Button><Button variant="danger" loading={setFaqStatus.isPending || setCategoryStatus.isPending} onClick={confirmStatusChange}>{statusConfirmation?.isActive ? 'Desactivar' : 'Activar'}</Button></>}><p>{statusConfirmation?.isActive ? '¿Desactivar' : '¿Activar'} <strong>{statusConfirmation?.label}</strong>?</p></Modal>
    <Modal open={Boolean(historyFaqId)} onClose={() => setHistoryFaqId(null)} title="Historial de versiones"><div className="space-y-3">{history.isLoading && <LoadingState message="Cargando historial…" />}{history.isError && <ErrorState title="No pudimos cargar el historial" onRetry={() => { void history.refetch() }} />}{history.data?.length === 0 && <EmptyState title="Sin historial" desc="Esta FAQ aún no tiene versiones registradas." />}{history.data?.map((version) => <div key={version.id} className="rounded border p-3"><strong>Versión {version.version} · {version.action}</strong><p>{version.changed_at}</p></div>)}</div></Modal>
  </section>
}
