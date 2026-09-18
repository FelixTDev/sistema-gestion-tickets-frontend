import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/button'
import { Icon } from '../../../components/ui/icons'
import { useAuth } from '../../auth/auth-provider'
import { useChatbot } from '../chatbot-provider'
import { MessageList } from './message-list'
import { NewConversationDialog } from './new-conversation-dialog'

export function ConversationPanel({ onCreateTicket, embedded = false }: { onCreateTicket?: () => void; embedded?: boolean }) {
  const chatbot = useChatbot()
  const { user } = useAuth()
  const [isConfirmingNew, setIsConfirmingNew] = useState(false)
  if (!chatbot.canUseChatbot) return null
  const hasMessages = Boolean(chatbot.conversation?.messages.length)
  const isBusy = chatbot.isRestoring || chatbot.isCreating || chatbot.isSending

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    void chatbot.sendMessage()
  }

  return <section className={`flex min-h-0 flex-1 flex-col ${embedded ? '' : 'overflow-hidden rounded-[18px] border border-[#e6edef] bg-white shadow-sm'}`} aria-label="Asistente de atención">
    {!embedded && <div className="flex items-center justify-between bg-[#06243a] p-4 text-white"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-white/10"><Icon.bot size={20} /></span><div><p className="text-[15px] font-bold">Asistente GNB</p><p className="flex items-center gap-1.5 text-[11.5px] text-[#b9d7e2]"><span className="h-1.5 w-1.5 rounded-full bg-green" /> En línea</p></div></div><button className="min-h-11 rounded-[9px] px-3 text-[12px] font-semibold text-[#c6d7de] hover:bg-white/10 hover:text-white" type="button" disabled={isBusy} onClick={() => hasMessages ? setIsConfirmingNew(true) : void chatbot.startNewConversation()}><span className="inline-flex items-center gap-1"><Icon.refresh size={14} /> Nueva conversación</span></button></div>}
    {embedded && <div className="border-b border-[#eef2f3] bg-white px-4 py-2"><button className="inline-flex min-h-11 items-center gap-1 text-[12px] font-semibold text-turq-dark hover:underline" type="button" disabled={isBusy} onClick={() => hasMessages ? setIsConfirmingNew(true) : void chatbot.startNewConversation()}><Icon.refresh size={14} /> Nueva conversación</button><p className="text-[11px] leading-relaxed text-muted">No ingreses números de tarjeta, claves, CVV, tokens ni información financiera real.</p></div>}
    {!embedded && <p className="border-b border-[#eef2f3] bg-[#eef6f7] px-4 py-2 text-[12px] leading-relaxed text-muted">No ingreses números de tarjeta, claves, CVV, tokens ni información financiera real.</p>}
    <div className="flex-1 overflow-y-auto bg-[#fafcfc] p-4">
      {chatbot.isRestoring && <div className="py-8 text-center text-[13px] text-muted" role="status">Recuperando conversación…</div>}
      {chatbot.error && <div className="rounded-[10px] border border-[#efb5b2] bg-[#fff2f1] p-3 text-[13px] text-[#8b1e1e]" role="alert"><span>{chatbot.error}</span>{(chatbot.error.includes('recuperar') || chatbot.error.includes('asociar')) && <button type="button" className="ml-2 min-h-11 font-semibold underline" onClick={chatbot.retry}>Reintentar</button>}</div>}
      {!chatbot.isRestoring && !hasMessages && !chatbot.error && <div className="grid min-h-full place-items-center px-4 text-center"><div><span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#eef4f5] text-turq-dark"><Icon.chat size={22} /></span><p className="text-[14px] font-semibold text-ink">Puedes iniciar una nueva consulta.</p><span className="mt-1 block text-[12px] text-muted">Escribe un mensaje para conversar con el asistente.</span></div></div>}
      {hasMessages && <MessageList messages={chatbot.conversation?.messages ?? []} />}
      {chatbot.isSending && <div className="mt-3 flex w-fit gap-1 rounded-2xl rounded-tl-md border border-[#eef2f3] bg-white px-4 py-3" role="status" aria-label="El asistente está respondiendo">{[0, 1, 2].map((dot) => <span key={dot} className="h-1.5 w-1.5 rounded-full bg-muted" style={{ animation: `gnb-blink 1.2s ${dot * 0.15}s infinite` }} />)}</div>}
      {chatbot.offersTicket && (user?.role === 'CLIENTE'
        ? <div className="mt-3 rounded-[10px] border border-[#b8d4de] bg-[#eef6f8] p-3 text-[13px] text-ink-800" role="status"><strong>Esta consulta puede convertirse en un ticket.</strong><p className="mt-1">Completa los datos de la solicitud para darle seguimiento.</p>{onCreateTicket && <Button className="mt-3" size="sm" icon={Icon.ticket} onClick={onCreateTicket}>Crear ticket</Button>}</div>
        : <div className="mt-3 rounded-[10px] border border-[#b8d4de] bg-[#eef6f8] p-3 text-[13px] text-ink-800" role="status"><strong>¿Necesitas seguimiento?</strong><p className="mt-1">Inicia sesión o crea una cuenta para continuar con un ticket.</p><div className="mt-3 flex flex-wrap gap-2"><Link className="inline-flex min-h-11 items-center rounded-[9px] bg-turq-dark px-3.5 font-semibold text-white" to="/login">Iniciar sesión</Link><Link className="inline-flex min-h-11 items-center rounded-[9px] border border-[#9ab7c1] bg-white px-3.5 font-semibold text-ink-800" to="/registro">Registrarse</Link></div></div>)}
    </div>
    <form className="flex gap-2 border-t border-[#eef2f3] bg-white p-3" onSubmit={submit} noValidate>
      <label htmlFor="chatbot-message" className="sr-only">Escribe tu consulta</label>
      <textarea id="chatbot-message" value={chatbot.draft} onChange={(event) => chatbot.setDraft(event.target.value)} maxLength={2000} disabled={isBusy} rows={1} placeholder="Escribe tu consulta…" aria-invalid={Boolean(chatbot.validationError)} aria-describedby={chatbot.validationError ? 'chatbot-message-error' : undefined} className="min-h-11 flex-1 resize-none rounded-[22px] border border-[#dbe4e7] px-4 py-3 text-[13.5px] leading-5 text-ink outline-none placeholder:text-[#798c96] focus:border-turq-dark" />
      <button type="submit" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-turq-dark text-white hover:bg-[#055b62] disabled:cursor-not-allowed disabled:opacity-50" disabled={isBusy} aria-label="Enviar"><Icon.send size={17} /></button>
      {chatbot.validationError && <p id="chatbot-message-error" className="w-full px-2 text-[12px] font-medium text-danger" role="alert">{chatbot.validationError}</p>}
    </form>
    <NewConversationDialog isOpen={isConfirmingNew} isPending={chatbot.isCreating} onCancel={() => setIsConfirmingNew(false)} onConfirm={() => { setIsConfirmingNew(false); void chatbot.startNewConversation() }} />
  </section>
}
