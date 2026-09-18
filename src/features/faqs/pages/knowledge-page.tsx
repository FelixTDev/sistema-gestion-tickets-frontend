import { useMemo, useState } from 'react'
import { Card } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Modal } from '../../../components/ui/modal'
import { Tabs } from '../../../components/ui/tabs'
import { EmptyState, ErrorState, LoadingState } from '../../../components/ui/states'
import { Icon } from '../../../components/ui/icons'
import { PageHeader } from '../../../components/layout/page-header'
import { useCategories, useCreateCategoryMutation, useCreateFaqMutation, useFaqs, useSetCategoryStatusMutation, useSetFaqStatusMutation, useUpdateCategoryMutation, useUpdateFaqMutation } from '../hooks/use-faqs'
import { CategoryForm } from '../components/category-form'
import { FaqForm } from '../components/faq-form'
import type { CategoryRead, FAQRead } from '../types/faq-types'

type ModalState = { kind: 'faq' | 'category'; item?: FAQRead | CategoryRead } | null
type DeactivationState = { kind: 'faq' | 'category'; id: string; label: string } | null

export function KnowledgePage() {
  const [tab, setTab] = useState('faqs')
  const [modal, setModal] = useState<ModalState>(null)
  const [deactivation, setDeactivation] = useState<DeactivationState>(null)
  const faqs = useFaqs(); const categories = useCategories()
  const createFaq = useCreateFaqMutation(); const updateFaq = useUpdateFaqMutation(); const setFaqStatus = useSetFaqStatusMutation()
  const createCategory = useCreateCategoryMutation(); const updateCategory = useUpdateCategoryMutation(); const setCategoryStatus = useSetCategoryStatusMutation()
  const activeFaqs = useMemo(() => (faqs.data ?? []).filter((faq) => faq.is_active), [faqs.data])
  const activeCategories = useMemo(() => (categories.data ?? []).filter((category) => category.is_active), [categories.data])
  const loading = faqs.isLoading || categories.isLoading
  const error = faqs.isError || categories.isError
  const close = () => setModal(null)
  const closeDeactivation = () => setDeactivation(null)
  const confirmDeactivation = () => {
    if (!deactivation) return
    if (deactivation.kind === 'faq') setFaqStatus.mutate({ faqId: deactivation.id, data: { is_active: false } }, { onSuccess: closeDeactivation })
    else setCategoryStatus.mutate({ categoryId: deactivation.id, data: { is_active: false } }, { onSuccess: closeDeactivation })
  }

  const faqSubmit = (data: { category_id: string; question: string; answer: string; keywords: string }) => {
    if (modal?.kind === 'faq' && modal.item && 'id' in modal.item) updateFaq.mutate({ faqId: modal.item.id, data }, { onSuccess: close })
    else createFaq.mutate(data, { onSuccess: close })
  }
  const categorySubmit = (data: { name: string; description: string }) => {
    if (modal?.kind === 'category' && modal.item && 'id' in modal.item) updateCategory.mutate({ categoryId: modal.item.id, data }, { onSuccess: close })
    else createCategory.mutate(data, { onSuccess: close })
  }
  const mutationError = createFaq.error ?? updateFaq.error ?? setFaqStatus.error ?? createCategory.error ?? updateCategory.error ?? setCategoryStatus.error
  const retry = () => { void faqs.refetch(); void categories.refetch() }
  return <section className="knowledge-page">
    <PageHeader eyebrow="Supervisión" title="Gestión de conocimiento" subtitle="Administra las preguntas frecuentes y las categorías activas." action={tab === 'faqs' ? <Button icon={Icon.plus} onClick={() => setModal({ kind: 'faq' })}>Nueva FAQ</Button> : <Button icon={Icon.plus} onClick={() => setModal({ kind: 'category' })}>Nueva categoría</Button>} />
    <Card className="knowledge-limit-note"><Icon.info size={17} /><span>La API de conocimiento lista solo registros activos. Al desactivar uno, desaparecerá de esta vista y no se puede reactivar desde el portal después de actualizar.</span></Card>
    {loading && <LoadingState message="Cargando base de conocimiento…" />}
    {error && <Card><ErrorState title="No pudimos cargar la base de conocimiento" onRetry={retry} /></Card>}
    {mutationError && !modal && !deactivation && <div className="form-error" role="alert">No pudimos guardar el cambio. Inténtalo nuevamente.</div>}
    {!loading && !error && <>
      <Tabs aria-label="Gestión de conocimiento" tabs={[{ id: 'faqs', label: 'Preguntas frecuentes', panelId: 'knowledge-faqs' }, { id: 'categories', label: 'Categorías', panelId: 'knowledge-categories' }]} value={tab} onChange={setTab} />
      {tab === 'faqs' && <section id="knowledge-faqs" role="tabpanel" aria-label="Preguntas frecuentes" className="knowledge-list">{activeFaqs.length === 0 ? <Card><EmptyState icon={Icon.book} title="Aún no hay preguntas frecuentes activas" desc="Crea una FAQ para publicar una respuesta." /></Card> : activeFaqs.map((faq) => <Card key={faq.id} className="knowledge-item"><div><p className="knowledge-item-label">{activeCategories.find((category) => category.id === faq.category_id)?.name ?? 'Categoría no disponible'}</p><h2>{faq.question}</h2><p>{faq.answer}</p><small>Palabras clave: {faq.keywords}</small></div><div className="knowledge-item-actions"><Button size="sm" variant="secondary" onClick={() => setModal({ kind: 'faq', item: faq })}>Editar</Button><Button size="sm" variant="ghost" onClick={() => setDeactivation({ kind: 'faq', id: faq.id, label: faq.question })} disabled={setFaqStatus.isPending || setCategoryStatus.isPending}>Desactivar</Button></div></Card>)}</section>}
      {tab === 'categories' && <section id="knowledge-categories" role="tabpanel" aria-label="Categorías" className="knowledge-categories">{activeCategories.length === 0 ? <Card><EmptyState icon={Icon.tag} title="Aún no hay categorías activas" desc="Crea una categoría para organizar el conocimiento." /></Card> : <Card pad={false}><table className="knowledge-table"><thead><tr><th scope="col">Nombre</th><th scope="col">Descripción</th><th scope="col"><span className="sr-only">Acciones</span></th></tr></thead><tbody>{activeCategories.map((category) => <tr key={category.id}><th scope="row">{category.name}</th><td>{category.description}</td><td><div className="knowledge-item-actions"><Button size="sm" variant="secondary" onClick={() => setModal({ kind: 'category', item: category })}>Editar</Button><Button size="sm" variant="ghost" onClick={() => setDeactivation({ kind: 'category', id: category.id, label: category.name })} disabled={setFaqStatus.isPending || setCategoryStatus.isPending}>Desactivar</Button></div></td></tr>)}</tbody></table></Card>}</section>}
    </>}
    <Modal open={modal?.kind === 'faq'} onClose={close} title={modal?.item && 'question' in modal.item ? 'Editar FAQ' : 'Nueva FAQ'}>{(createFaq.error || updateFaq.error) && <div className="form-error mb-4" role="alert">No pudimos guardar el cambio. Inténtalo nuevamente.</div>}<FaqForm categories={activeCategories} initialValue={modal?.kind === 'faq' && modal.item && 'question' in modal.item ? modal.item : undefined} submitLabel={modal?.item && 'question' in modal.item ? 'Guardar cambios' : 'Crear FAQ'} isSubmitting={createFaq.isPending || updateFaq.isPending} onSubmit={faqSubmit} onCancel={close} /></Modal>
    <Modal open={modal?.kind === 'category'} onClose={close} title={modal?.item && 'name' in modal.item ? 'Editar categoría' : 'Nueva categoría'}>{(createCategory.error || updateCategory.error) && <div className="form-error mb-4" role="alert">No pudimos guardar el cambio. Inténtalo nuevamente.</div>}<CategoryForm initialValue={modal?.kind === 'category' && modal.item && 'name' in modal.item ? modal.item : undefined} submitLabel={modal?.item && 'name' in modal.item ? 'Guardar cambios' : 'Crear categoría'} isSubmitting={createCategory.isPending || updateCategory.isPending} onSubmit={categorySubmit} onCancel={close} /></Modal>
    <Modal open={Boolean(deactivation)} onClose={closeDeactivation} title="Confirmar desactivación" footer={<><Button variant="secondary" onClick={closeDeactivation} disabled={setFaqStatus.isPending || setCategoryStatus.isPending}>Cancelar</Button><Button variant="danger" loading={setFaqStatus.isPending || setCategoryStatus.isPending} onClick={confirmDeactivation}>Desactivar</Button></>}><div className="grid gap-3">{(setFaqStatus.error || setCategoryStatus.error) && <div className="form-error" role="alert">No pudimos guardar el cambio. Inténtalo nuevamente.</div>}<p>¿Desactivar <strong>{deactivation?.label}</strong>?</p><p>Dejará de aparecer en el listado activo. Esta acción no se puede revertir desde este portal.</p></div></Modal>
  </section>
}
