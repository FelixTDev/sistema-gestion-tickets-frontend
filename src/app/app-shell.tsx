import { AppRouter } from './router'
import { AuthProvider } from '../features/auth/auth-provider'
import { ChatbotProvider } from '../features/chatbot/chatbot-provider'
import { ChatbotWidget } from '../features/chatbot/components/chatbot-widget'

export function App() { return <AuthProvider><ChatbotProvider><AppRouter /><ChatbotWidget /></ChatbotProvider></AuthProvider> }
