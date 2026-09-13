import { AppRouter } from './router'
import { AuthProvider } from '../features/auth/auth-provider'
import { ChatbotProvider } from '../features/chatbot/chatbot-provider'
import { ChatbotWidget } from '../features/chatbot/components/chatbot-widget'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth-provider'
import { useChatbot } from '../features/chatbot/chatbot-provider'

function AppContent() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { conversation } = useChatbot()
  const onCreateTicket = user?.role === 'CLIENTE' && conversation ? () => navigate(`/cliente/tickets/nuevo?conversationId=${encodeURIComponent(conversation.id)}`) : undefined
  return <><AppRouter onCreateTicket={onCreateTicket} /><ChatbotWidget onCreateTicket={onCreateTicket} /></>
}

export function App() { return <AuthProvider><ChatbotProvider><AppContent /></ChatbotProvider></AuthProvider> }
