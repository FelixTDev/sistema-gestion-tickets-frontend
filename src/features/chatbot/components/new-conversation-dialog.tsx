import { Modal } from '../../../components/ui/modal'
import { Button } from '../../../components/ui/button'

interface NewConversationDialogProps {
  isOpen: boolean
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function NewConversationDialog({ isOpen, isPending, onCancel, onConfirm }: NewConversationDialogProps) {
  return <Modal open={isOpen} onClose={onCancel} title="¿Crear una nueva conversación?" role="alertdialog" danger footer={<><Button variant="secondary" onClick={onCancel}>Conservar conversación</Button><Button onClick={onConfirm} loading={isPending}>Crear nueva</Button></>}>
    <p>La conversación actual dejará de mostrarse en esta pestaña.</p>
  </Modal>
}
