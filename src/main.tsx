import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/app-shell'
import { Providers } from './app/providers'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(<StrictMode><Providers><App /></Providers></StrictMode>)
