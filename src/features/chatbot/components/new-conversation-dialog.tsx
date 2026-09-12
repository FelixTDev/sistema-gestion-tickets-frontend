import { useEffect, useRef } from 'react'

interface NewConversationDialogProps {
  isOpen: boolean
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function NewConversationDialog({ isOpen, isPending, onCancel, onConfirm }: NewConversationDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!isOpen) return
    cancelRef.current?.focus()
    function handleEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onCancel])
  if (!isOpen) return null

  return <div className="confirmation-backdrop">
    <section className="confirmation-dialog" role="alertdialog" aria-modal="true" aria-labelledby="new-conversation-title" aria-describedby="new-conversation-description">
      <h2 id="new-conversation-title">¿Crear una nueva conversación?</h2>
      <p id="new-conversation-description">La conversación actual dejará de mostrarse en esta pestaña.</p>
      <div className="confirmation-actions">
        <button ref={cancelRef} className="button button-secondary" type="button" onClick={onCancel}>Conservar conversación</button>
        <button className="button" type="button" disabled={isPending} onClick={onConfirm}>{isPending ? 'Creando…' : 'Crear nueva'}</button>
      </div>
    </section>
  </div>
}
