import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { App } from './app-shell'

describe('aplicación base', () => {
  it('renderiza la pantalla pública de inicio', () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /resuelve tus consultas/i })).toBeInTheDocument()
    expect(screen.getByText(/prototipo académico independiente/i)).toBeInTheDocument()
  })

  it('protege el portal del cliente sin sesión', () => {
    render(<MemoryRouter initialEntries={['/cliente']}><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /inicia sesión/i })).toBeInTheDocument()
  })

  it('muestra la página 404', () => {
    render(<MemoryRouter initialEntries={['/no-existe']}><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /página no encontrada/i })).toBeInTheDocument()
  })
})
