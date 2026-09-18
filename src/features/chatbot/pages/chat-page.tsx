import { PageHeader } from '../../../components/layout/page-header'
import { ConversationPanel } from '../components/conversation-panel'

export function ChatPage({ onCreateTicket }: { onCreateTicket?: () => void }) {
  return <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
    <PageHeader eyebrow="Atención digital" title="Asistente de atención" subtitle="Realiza consultas generales sin compartir información bancaria sensible." />
    <div className="h-[620px] max-h-[calc(100vh-12rem)] min-h-[480px]"><ConversationPanel onCreateTicket={onCreateTicket} /></div>
  </section>
}
