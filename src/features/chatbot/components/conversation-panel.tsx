import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../auth/auth-provider'
import { useChatbot } from '../chatbot-provider'
import { MessageList } from './message-list'
import { NewConversationDialog } from './new-conversation-dialog'

export function ConversationPanel({ onCreateTicket }: { onCreateTicket?: () => void }) {
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

  return <section className="conversation-panel" aria-label="Asistente de atención">
    <div className="conversation-intro">
      <div><strong>Asistente de atención</strong><button className="conversation-new" type="button" disabled={isBusy} onClick={() => hasMessages ? setIsConfirmingNew(true) : void chatbot.startNewConversation()}>Nueva conversación</button></div>
      <p>Responde consultas generales usando la base de preguntas frecuentes.</p>
      <p className="chat-safety">No ingreses números de tarjeta, claves, CVV, tokens ni información financiera real.</p>
    </div>
    {chatbot.isRestoring && <div className="state" role="status">Recuperando conversación…</div>}
    {chatbot.error && <div className="state state-error" role="alert"><span>{chatbot.error}</span>{chatbot.error.includes('recuperar') && <button type="button" className="button button-small" onClick={chatbot.retry}>Reintentar</button>}</div>}
    {!chatbot.isRestoring && !hasMessages && !chatbot.error && <div className="conversation-empty"><p>Puedes iniciar una nueva consulta.</p><span>Ejemplos: cuentas, tarjetas o banca digital.</span></div>}
    {hasMessages && <MessageList messages={chatbot.conversation?.messages ?? []} />}
    {chatbot.offersTicket && (user?.role === 'CLIENTE'
      ? <div className="ticket-offer" role="status"><strong>Esta consulta puede convertirse en un ticket.</strong><p>La creación real se habilitará en la siguiente fase.</p>{onCreateTicket && <button className="button button-small" type="button" onClick={onCreateTicket}>Crear ticket</button>}</div>
      : <div className="ticket-offer" role="status"><strong>¿Necesitas seguimiento?</strong><p>Inicia sesión o crea una cuenta demo para continuar posteriormente con un ticket.</p><div><Link className="button button-small" to="/login">Iniciar sesión</Link><Link className="button button-outline button-small" to="/registro">Registrarse</Link></div></div>)}
    <form className="conversation-form" onSubmit={submit} noValidate>
      <label htmlFor="chatbot-message">Escribe tu consulta</label>
      <textarea id="chatbot-message" value={chatbot.draft} onChange={(event) => chatbot.setDraft(event.target.value)} maxLength={2000} disabled={isBusy} />
      {chatbot.validationError && <span className="field-error" role="alert">{chatbot.validationError}</span>}
      <button className="button" type="submit" disabled={isBusy}>{chatbot.isSending || chatbot.isCreating ? 'Enviando…' : 'Enviar'}</button>
    </form>
    <NewConversationDialog isOpen={isConfirmingNew} isPending={chatbot.isCreating} onCancel={() => setIsConfirmingNew(false)} onConfirm={() => { setIsConfirmingNew(false); void chatbot.startNewConversation() }} />
  </section>
}
