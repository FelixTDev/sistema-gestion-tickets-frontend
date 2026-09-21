import { useRef, useState } from 'react'
import { ApiError } from '../../../lib/api-client'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Modal } from '../../../components/ui/modal'
import { Icon } from '../../../components/ui/icons'
import { EmptyState, ErrorState, LoadingState } from '../../../components/ui/states'
import { useDeleteAttachmentMutation, useDownloadAttachment, useTicketAttachments, useUploadAttachmentMutation } from '../hooks/use-tickets'
import type { AttachmentRead } from '../types/ticket-types'

const maxFileSize = 10 * 1024 * 1024
const allowedExtensions = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.txt'])
const allowedMimeTypes = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'text/plain'])

function attachmentError(error: unknown): string {
  if (error instanceof ApiError && error.status === 413) return 'El archivo supera el tamaño permitido.'
  if (error instanceof ApiError && error.status === 415) return 'Este tipo de archivo no está permitido.'
  if (error instanceof ApiError && error.status === 422) return 'No pudimos validar el archivo. Revisa su nombre y formato.'
  if (error instanceof ApiError && error.status === 403) return 'No tienes permiso para gestionar adjuntos de este ticket.'
  return 'No pudimos completar la operación del archivo. Inténtalo nuevamente.'
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function safeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_')
}

function validateFile(file: File): string | null {
  const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`
  if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.type)) return 'Selecciona un PDF, PNG, JPG, GIF o TXT.'
  if (file.size > maxFileSize) return 'El archivo no puede superar 10 MB.'
  return null
}

export function TicketAttachments({ ticketId, canManage }: { ticketId: string; canManage: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const attachments = useTicketAttachments(ticketId)
  const upload = useUploadAttachmentMutation(ticketId)
  const remove = useDeleteAttachmentMutation(ticketId)
  const download = useDownloadAttachment()
  const [selected, setSelected] = useState<AttachmentRead | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const activeAttachments = (attachments.data ?? []).filter((item) => item.status === 'ACTIVE')

  async function onFileSelected(file: File | undefined): Promise<void> {
    if (!file) return
    const error = validateFile(file)
    setValidationError(error)
    if (error) return
    setValidationError(null)
    try {
      await upload.mutateAsync({ file })
      if (inputRef.current) inputRef.current.value = ''
    } catch {
      // La mutación se muestra en el estado de error del componente.
    }
  }

  async function onDownload(attachment: AttachmentRead): Promise<void> {
    try {
      const response = await download.mutateAsync(attachment.id)
      const link = document.createElement('a')
      const objectUrl = URL.createObjectURL(response.blob)
      link.href = objectUrl
      link.download = safeFilename(attachment.original_filename)
      link.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      // La mutación se muestra en el estado de error del componente.
    }
  }

  return <Card>
    <div className="mb-4 flex items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-[16px] font-bold text-ink"><Icon.report size={17} />Adjuntos</h2><p className="mt-1 text-[12px] text-muted">Archivos permitidos: PDF, PNG, JPG, GIF y TXT. Máximo 10 MB.</p></div>{canManage && <><input ref={inputRef} className="sr-only" id={`attachment-input-${ticketId}`} type="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.txt" onChange={(event) => { void onFileSelected(event.target.files?.[0]) }} /><Button type="button" size="sm" icon={Icon.plus} loading={upload.isPending} onClick={() => inputRef.current?.click()}>Adjuntar archivo</Button></>}</div>
    {validationError && <p className="mb-3 rounded-[10px] border border-[#efb5b2] bg-[#fff2f1] p-3 text-[13px] text-danger" role="alert">{validationError}</p>}
    {upload.isError && <p className="mb-3 rounded-[10px] border border-[#efb5b2] bg-[#fff2f1] p-3 text-[13px] text-danger" role="alert">{attachmentError(upload.error)}</p>}
    {remove.isError && <p className="mb-3 rounded-[10px] border border-[#efb5b2] bg-[#fff2f1] p-3 text-[13px] text-danger" role="alert">{attachmentError(remove.error)}</p>}
    {download.isError && <p className="mb-3 rounded-[10px] border border-[#efb5b2] bg-[#fff2f1] p-3 text-[13px] text-danger" role="alert">{attachmentError(download.error)}</p>}
    {attachments.isLoading && <LoadingState message="Cargando adjuntos…" />}
    {attachments.isError && <ErrorState title="No pudimos cargar los adjuntos" desc={attachmentError(attachments.error)} onRetry={() => { void attachments.refetch() }} />}
    {!attachments.isLoading && !attachments.isError && activeAttachments.length === 0 && <EmptyState icon={Icon.report} title="Sin adjuntos" desc="Los archivos asociados al ticket aparecerán aquí." />}
    {!attachments.isLoading && !attachments.isError && activeAttachments.length > 0 && <ul className="divide-y divide-[#eef2f3]">{activeAttachments.map((attachment) => <li className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0" key={attachment.id}><div className="min-w-0"><p className="truncate text-[13.5px] font-semibold text-ink">{attachment.original_filename}</p><p className="text-[12px] text-muted">{formatBytes(attachment.file_size)} · {new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(attachment.created_at))}</p></div><div className="flex items-center gap-2"><Button type="button" variant="secondary" size="sm" onClick={() => { void onDownload(attachment) }} loading={download.isPending}>Descargar</Button>{canManage && <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(attachment)} disabled={remove.isPending}>Eliminar</Button>}</div></li>)}</ul>}
    <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Eliminar adjunto" danger footer={<><Button variant="secondary" onClick={() => setSelected(null)} disabled={remove.isPending}>Cancelar</Button><Button variant="danger" loading={remove.isPending} onClick={() => { if (selected) remove.mutate(selected.id, { onSuccess: () => setSelected(null) }) }}>Eliminar</Button></>}><p>El archivo dejará de estar disponible en el ticket. Esta acción se registra en el servidor.</p></Modal>
  </Card>
}
