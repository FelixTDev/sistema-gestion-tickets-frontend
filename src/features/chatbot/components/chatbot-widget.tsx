import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useChatbot } from '../chatbot-provider'
import { ConversationPanel } from './conversation-panel'

export function ChatbotWidget({ onCreateTicket }: { onCreateTicket?: () => void }) {
  const { pathname } = useLocation()
  const { canUseChatbot } = useChatbot()
  const [isOpen, setIsOpen] = useState(false)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    dialogRef.current?.querySelector<HTMLTextAreaElement>('textarea')?.focus()
  }, [isOpen])

  if (!canUseChatbot || pathname === '/chat') return null

  function close(): void {
    setIsOpen(false)
    window.setTimeout(() => launcherRef.current?.focus(), 0)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Escape') { event.preventDefault(); close(); return }
    if (event.key !== 'Tab') return
    const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), textarea:not([disabled]), a[href]')
    if (!controls?.length) return
    const first = controls[0]
    const last = controls[controls.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }

  return <div className="chatbot-widget">
    <button ref={launcherRef} className="chatbot-launcher" type="button" aria-expanded={isOpen} aria-controls="chatbot-dialog" aria-label={isOpen ? 'Cerrar asistente de atención' : 'Abrir asistente de atención'} onClick={() => isOpen ? close() : setIsOpen(true)}>
      <span aria-hidden="true">{isOpen ? '×' : '?'}</span><span>{isOpen ? 'Cerrar' : 'Asistente'}</span>
    </button>
    {isOpen && <div ref={dialogRef} id="chatbot-dialog" className="chatbot-dialog" role="dialog" aria-modal="true" aria-label="Asistente de atención" onKeyDown={handleKeyDown}>
      <div className="chatbot-dialog-header"><strong>Asistente de atención</strong><button type="button" aria-label="Cerrar asistente de atención" onClick={close}>×</button></div>
      <ConversationPanel onCreateTicket={onCreateTicket} />
    </div>}
  </div>
}
