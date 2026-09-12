import { useEffect, useRef } from 'react'
import type { ChatMessageRead } from '../types/chatbot-types'

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export function MessageList({ messages }: { messages: ChatMessageRead[] }) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView?.({ block: 'nearest' }) }, [messages])
  return <div className="conversation-messages" aria-live="polite" aria-label="Mensajes de la conversación">
    {messages.map((message) => {
      const isUser = message.sender_type.toLocaleUpperCase() === 'USER'
      return <article key={message.id} className={isUser ? 'chat-message chat-message-user' : 'chat-message chat-message-bot'}>
        <strong>{isUser ? 'Tú' : 'Asistente de atención'}</strong>
        <p>{message.content}</p>
        <time dateTime={message.created_at}>{formatTime(message.created_at)}</time>
      </article>
    })}
    <div ref={endRef} />
  </div>
}
