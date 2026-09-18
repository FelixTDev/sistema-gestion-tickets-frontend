import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Icon } from '../../../components/ui/icons'
import { useChatbot } from '../chatbot-provider'
import { ConversationPanel } from './conversation-panel'

export function ChatbotWidget({ onCreateTicket }: { onCreateTicket?: () => void }) {
  const { pathname } = useLocation()
  const { canUseChatbot } = useChatbot()
  const [isOpen, setIsOpen] = useState(false)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (isOpen) dialogRef.current?.querySelector<HTMLTextAreaElement>('textarea')?.focus() }, [isOpen])

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

  return <div className="fixed bottom-5 right-5 z-[60]">
    <button ref={launcherRef} type="button" aria-expanded={isOpen} aria-controls="chatbot-dialog" aria-label={isOpen ? 'Cerrar asistente de atención' : 'Abrir asistente de atención'} onClick={() => isOpen ? close() : setIsOpen(true)} className="relative grid h-[60px] w-[60px] place-items-center rounded-full bg-[#06243a] text-white shadow-xl transition-transform hover:scale-105 active:scale-95">
      {isOpen ? <Icon.x size={26} /> : <Icon.chat size={26} />}
      {!isOpen && <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green" aria-hidden="true" />}
    </button>
    {isOpen && <div ref={dialogRef} id="chatbot-dialog" role="dialog" aria-modal="true" aria-label="Asistente de atención" onKeyDown={handleKeyDown} className="gnb-pop fixed bottom-24 right-5 flex h-[540px] max-h-[calc(100vh-8rem)] w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-[18px] border border-[#e6edef] bg-white shadow-2xl">
      <div className="flex items-center justify-between bg-[#06243a] p-4 text-white">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-white/10"><Icon.bot size={20} /></span><div><p className="text-[15px] font-bold">Asistente GNB</p><p className="flex items-center gap-1.5 text-[11.5px] text-[#b9d7e2]"><span className="h-1.5 w-1.5 rounded-full bg-green" /> En línea</p></div></div>
        <button type="button" className="grid min-h-11 min-w-11 place-items-center rounded-[9px] text-[#c6d7de] hover:bg-white/10 hover:text-white" aria-label="Cerrar asistente de atención" onClick={close}><Icon.x size={20} /></button>
      </div>
      <ConversationPanel embedded onCreateTicket={onCreateTicket} />
    </div>}
  </div>
}
