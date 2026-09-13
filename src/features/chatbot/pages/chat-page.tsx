import { PageContainer } from '../../../components/layout/page-container'
import { ConversationPanel } from '../components/conversation-panel'

export function ChatPage({ onCreateTicket }: { onCreateTicket?: () => void }) {
  return <PageContainer as="section" className="standard-page chat-page">
    <div className="eyebrow">Orientación basada en preguntas frecuentes</div>
    <h1>Asistente de atención</h1>
    <p className="lead">Realiza consultas generales sin compartir información bancaria real.</p>
    <ConversationPanel onCreateTicket={onCreateTicket} />
  </PageContainer>
}
