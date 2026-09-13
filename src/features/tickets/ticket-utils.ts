import type { TicketRead, TicketSource } from './types/ticket-types'

const sourceLabels: Record<TicketSource, string> = { MANUAL: 'Manual', CHATBOT: 'Chatbot' }

export function ticketSourceLabel(source: TicketSource): string {
  return sourceLabels[source]
}

export function sortTicketsNewestFirst(tickets: TicketRead[]): TicketRead[] {
  return [...tickets].sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime())
}
