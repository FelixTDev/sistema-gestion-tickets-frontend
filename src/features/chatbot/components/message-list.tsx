import { useEffect, useRef } from 'react'
import type { ChatMessageRead } from '../types/chatbot-types'

function formatTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(date)
}

export function MessageList({ messages }: { messages: ChatMessageRead[] }) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView?.({ block: 'nearest' }) }, [messages])
  return <div className="space-y-3" aria-live="polite" aria-label="Mensajes de la conversación">
    {messages.map((message) => {
      const isUser = message.sender_type.toLocaleUpperCase() === 'USER'
      const formattedTime = formatTime(message.created_at)
      return <article key={message.id} className={`gnb-fade ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`max-w-[82%] px-3.5 py-2.5 text-[13.5px] leading-relaxed ${isUser ? 'rounded-2xl rounded-tr-md bg-turq-dark text-white' : 'rounded-2xl rounded-tl-md border border-[#eef2f3] bg-white text-ink'}`}>
          <span className="sr-only">{isUser ? 'Tú' : 'Asistente GNB'}: </span><p className="whitespace-pre-wrap break-words">{message.content}</p>
          {formattedTime && <time className={`mt-1 block text-right text-[10px] ${isUser ? 'text-white/80' : 'text-muted'}`} dateTime={message.created_at}>{formattedTime}</time>}
        </div>
      </article>
    })}
    <div ref={endRef} />
  </div>
}
