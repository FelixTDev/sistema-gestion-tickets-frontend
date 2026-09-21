import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/button'
import { Icon } from '../../../components/ui/icons'
import { Modal } from '../../../components/ui/modal'
import { Textarea } from '../../../components/ui/form-controls'
import { useAuth } from '../../auth/auth-provider'
import { useChatbot } from '../chatbot-provider'
import { MessageList } from './message-list'
import { NewConversationDialog } from './new-conversation-dialog'

function publicSourceDetails(source: Record<string, string | null>): string[] {
  const read = (key: string): string | null => typeof source[key] === 'string' && source[key] ? source[key] : null
  const title = read('title') ?? read('question')
  const category = read('category') ?? read('category_name')
  const details = [title ? `Título: ${title}` : null, category ? `Categoría: ${category}` : null].filter((value): value is string => value !== null)
  return details.length > 0 ? details : ['Referencia de la base de conocimiento']
}

export function ConversationPanel({ onCreateTicket, embedded = false }: { onCreateTicket?: () => void; embedded?: boolean }) {
  const chatbot = useChatbot()
  const { user } = useAuth()
  const [isConfirmingNew, setIsConfirmingNew] = useState(false)
  const [isConfirmingEscalation, setIsConfirmingEscalation] = useState(false)
  const [escalationReason, setEscalationReason] = useState('')
  if (!chatbot.canUseChatbot) return null
  const hasMessages = Boolean(chatbot.conversation?.messages.length)
  const isBusy = chatbot.isRestoring || chatbot.isCreating || chatbot.isSending || chatbot.isResetting || chatbot.isEscalating || chatbot.isSendingFeedback

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    void chatbot.sendMessage()
  }

  return <section className={`flex h-full min-h-0 min-w-0 flex-1 flex-col ${embedded ? '' : 'overflow-hidden rounded-[18px] border border-[#e6edef] bg-white shadow-sm'}`} aria-label="Asistente de atención">
    {!embedded && <div className="flex items-center justify-between bg-[#06243a] p-4 text-white"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-white/10"><Icon.bot size={20} /></span><div><p className="text-[15px] font-bold">Asistente GNB</p><p className="flex items-center gap-1.5 text-[11.5px] text-[#b9d7e2]"><span className="h-1.5 w-1.5 rounded-full bg-green" /> En línea</p></div></div><button className="min-h-11 rounded-[9px] px-3 text-[12px] font-semibold text-[#c6d7de] hover:bg-white/10 hover:text-white" type="button" disabled={isBusy} onClick={() => hasMessages ? setIsConfirmingNew(true) : void chatbot.startNewConversation()}><span className="inline-flex items-center gap-1"><Icon.refresh size={14} /> Nueva conversación</span></button></div>}
    {embedded && <div className="border-b border-[#eef2f3] bg-white px-4 py-2"><button className="inline-flex min-h-11 items-center gap-1 text-[12px] font-semibold text-turq-dark hover:underline" type="button" disabled={isBusy} onClick={() => hasMessages ? setIsConfirmingNew(true) : void chatbot.startNewConversation()}><Icon.refresh size={14} /> Nueva conversación</button><p className="text-[11px] leading-relaxed text-muted">No ingreses números de tarjeta, claves, CVV, tokens ni información financiera real.</p></div>}
    {!embedded && <p className="border-b border-[#eef2f3] bg-[#eef6f7] px-4 py-2 text-[12px] leading-relaxed text-muted">No ingreses números de tarjeta, claves, CVV, tokens ni información financiera real.</p>}
    <div className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-[#fafcfc] p-4">
      {chatbot.isRestoring && <div className="py-8 text-center text-[13px] text-muted" role="status">Recuperando conversación…</div>}
      {chatbot.error && <div className="rounded-[10px] border border-[#efb5b2] bg-[#fff2f1] p-3 text-[13px] text-[#8b1e1e]" role="alert"><span>{chatbot.error}</span>{(chatbot.error.includes('recuperar') || chatbot.error.includes('asociar')) && <button type="button" className="ml-2 min-h-11 font-semibold underline" onClick={chatbot.retry}>Reintentar</button>}</div>}
      {!chatbot.isRestoring && !hasMessages && !chatbot.error && <div className="grid min-h-full place-items-center px-4 text-center"><div><span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#eef4f5] text-turq-dark"><Icon.chat size={22} /></span><p className="text-[14px] font-semibold text-ink">Puedes iniciar una nueva consulta.</p><span className="mt-1 block text-[12px] text-muted">Escribe un mensaje para conversar con el asistente.</span></div></div>}
      {hasMessages && <MessageList messages={chatbot.conversation?.messages ?? []} />}
      {chatbot.lastResponse && <div className="mt-3 space-y-3 rounded-[12px] border border-[#dbe8eb] bg-white p-3 text-[12.5px] text-ink-800" aria-label="Detalles de la respuesta del asistente">
        {chatbot.lastResponse.requires_clarification && chatbot.lastResponse.clarification_options?.length ? <div><p className="font-bold">Para ayudarte mejor, elige una opción:</p><ul className="mt-1 list-disc space-y-0.5 pl-5">{chatbot.lastResponse.clarification_options.map((option) => <li key={option}>{option}</li>)}</ul></div> : null}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted"><span>Confianza: {Math.round((chatbot.lastResponse.confidence ?? 0) * 100)}%</span>{chatbot.lastResponse.source_category && <span>Categoría: {chatbot.lastResponse.source_category}</span>}{chatbot.lastResponse.response_source && <span>Fuente: {chatbot.lastResponse.response_source}</span>}</div>
        {chatbot.lastResponse.fallback_reason && <p className="rounded-[8px] bg-[#fff8e8] px-2.5 py-2 text-[#795400]">{chatbot.lastResponse.fallback_reason}</p>}
      {chatbot.lastResponse.sources?.length ? <details><summary className="cursor-pointer font-semibold">Fuentes consultadas</summary><ul className="mt-1 space-y-1 pl-4">{chatbot.lastResponse.sources.map((source, index) => <li key={`${index}-${source.title ?? source.question ?? 'fuente'}`}>{publicSourceDetails(source).map((detail) => <span key={detail} className="mr-2">{detail}</span>)}</li>)}</ul></details> : null}
        <div className="flex flex-wrap items-center gap-2 border-t border-[#eef2f3] pt-2"><span className="font-semibold">¿Te ayudó?</span><Button variant="tertiary" size="sm" disabled={chatbot.feedbackSubmitted} onClick={() => { void chatbot.sendFeedback(true) }}>Sí</Button><Button variant="tertiary" size="sm" disabled={chatbot.feedbackSubmitted} onClick={() => { void chatbot.sendFeedback(false) }}>No</Button>{chatbot.feedbackSubmitted && <span role="status" className="text-[#3f6512]">Gracias por tu valoración.</span>}</div>
        {!chatbot.resolved && chatbot.conversation?.status !== 'ESCALATED' && <Button variant="secondary" size="sm" icon={Icon.users} loading={chatbot.isEscalating} onClick={() => setIsConfirmingEscalation(true)}>Solicitar atención humana</Button>}
      </div>}
      {chatbot.conversation?.status === 'ESCALATED' && <p className="mt-3 rounded-[10px] border border-[#b8d4de] bg-[#eef6f8] p-3 text-[13px]" role="status">Tu conversación fue escalada a atención humana.</p>}
      {chatbot.isSending && <div className="mt-3 flex w-fit gap-1 rounded-2xl rounded-tl-md border border-[#eef2f3] bg-white px-4 py-3" role="status" aria-label="El asistente está respondiendo">{[0, 1, 2].map((dot) => <span key={dot} className="h-1.5 w-1.5 rounded-full bg-muted" style={{ animation: `gnb-blink 1.2s ${dot * 0.15}s infinite` }} />)}</div>}
      {chatbot.offersTicket && (user?.role === 'CLIENTE'
        ? <div className="mt-3 rounded-[10px] border border-[#b8d4de] bg-[#eef6f8] p-3 text-[13px] text-ink-800" role="status"><strong>Esta consulta puede convertirse en un ticket.</strong><p className="mt-1">Completa los datos de la solicitud para darle seguimiento.</p>{onCreateTicket && <Button className="mt-3" size="sm" icon={Icon.ticket} onClick={onCreateTicket}>Crear ticket</Button>}</div>
        : <div className="mt-3 rounded-[10px] border border-[#b8d4de] bg-[#eef6f8] p-3 text-[13px] text-ink-800" role="status"><strong>¿Necesitas seguimiento?</strong><p className="mt-1">Inicia sesión o crea una cuenta para continuar con un ticket.</p><div className="mt-3 flex flex-wrap gap-2"><Link className="inline-flex min-h-11 items-center rounded-[9px] bg-turq-dark px-3.5 font-semibold text-white" to="/login">Iniciar sesión</Link><Link className="inline-flex min-h-11 items-center rounded-[9px] border border-[#9ab7c1] bg-white px-3.5 font-semibold text-ink-800" to="/registro">Registrarse</Link></div></div>)}
    </div>
    <form className="flex shrink-0 flex-wrap gap-2 border-t border-[#eef2f3] bg-white p-3" onSubmit={submit} noValidate>
      <label htmlFor="chatbot-message" className="sr-only">Escribe tu consulta</label>
      <textarea id="chatbot-message" value={chatbot.draft} onChange={(event) => chatbot.setDraft(event.target.value)} maxLength={2000} disabled={isBusy} rows={1} placeholder="Escribe tu consulta…" aria-invalid={Boolean(chatbot.validationError)} aria-describedby={chatbot.validationError ? 'chatbot-message-error' : undefined} className="min-h-11 min-w-0 flex-1 resize-none rounded-[22px] border border-[#dbe4e7] px-4 py-3 text-[13.5px] leading-5 text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turq placeholder:text-[#798c96] focus:border-turq-dark" />
      <button type="submit" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-turq-dark text-white hover:bg-[#055b62] disabled:cursor-not-allowed disabled:opacity-50" disabled={isBusy} aria-label="Enviar"><Icon.send size={17} /></button>
      {chatbot.validationError && <p id="chatbot-message-error" className="w-full px-2 text-[12px] font-medium text-danger" role="alert">{chatbot.validationError}</p>}
    </form>
    <NewConversationDialog isOpen={isConfirmingNew} isPending={chatbot.isResetting || chatbot.isCreating} onCancel={() => setIsConfirmingNew(false)} onConfirm={() => { setIsConfirmingNew(false); void chatbot.resetCurrentConversation() }} />
    <Modal open={isConfirmingEscalation} onClose={() => setIsConfirmingEscalation(false)} title="¿Solicitar atención humana?" role="alertdialog" footer={<><Button variant="secondary" onClick={() => setIsConfirmingEscalation(false)}>Cancelar</Button><Button loading={chatbot.isEscalating} onClick={() => { setIsConfirmingEscalation(false); void chatbot.escalateConversation(escalationReason.trim() || null) }}>Confirmar escalamiento</Button></>}>
      <p className="mb-3 text-[13.5px] text-muted">Un asesor podrá revisar esta conversación y continuar la atención.</p><label htmlFor="chatbot-escalation-reason" className="mb-1.5 block text-[13px] font-semibold text-ink">Motivo (opcional)</label><Textarea id="chatbot-escalation-reason" value={escalationReason} maxLength={500} onChange={(event) => setEscalationReason(event.target.value)} rows={3} placeholder="Cuéntanos qué necesitas…" />
    </Modal>
  </section>
}
