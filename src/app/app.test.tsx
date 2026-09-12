import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { App } from './app-shell'

describe('aplicación base', () => {
  it('renderiza la pantalla pública de inicio', () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /orientación que continúa contigo/i })).toBeInTheDocument()
    expect(
      within(screen.getByRole('banner')).getByText(/sistema inteligente de atención y tickets/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /tarjetas/i })).toBeInTheDocument()
    expect(screen.getByText(/prototipo académico no oficial/i)).toBeInTheDocument()
  })

  it('mantiene el acceso de personal solo en el footer', () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent(/acceso para personal/i)
    expect(screen.getByRole('banner')).not.toHaveTextContent(/acceso para personal/i)
  })

  it('permite navegar a preguntas frecuentes desde la navegación principal', async () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>)
    await userEvent.click(within(screen.getByRole('navigation', { name: /navegación principal/i })).getByRole('link', { name: /preguntas frecuentes/i }))
    expect(screen.getByRole('heading', { name: /preguntas frecuentes/i })).toBeInTheDocument()
  })

  it('muestra el aviso académico en ambos portales de login', () => {
    const { unmount } = render(<MemoryRouter initialEntries={['/login']}><App /></MemoryRouter>)
    expect(screen.getAllByText(/prototipo académico no oficial/i).length).toBeGreaterThan(0)
    unmount()
    render(<MemoryRouter initialEntries={['/personal/login']}><App /></MemoryRouter>)
    expect(screen.getAllByText(/prototipo académico no oficial/i).length).toBeGreaterThan(0)
  })

  it('protege el portal del cliente sin sesión', () => {
    render(<MemoryRouter initialEntries={['/cliente']}><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /bienvenido/i })).toBeInTheDocument()
  })

  it('redirige las rutas internas al acceso de personal sin sesión', () => {
    render(<MemoryRouter initialEntries={['/panel/tickets']}><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /acceso para personal/i })).toBeInTheDocument()
  })

  it('muestra la página 404', () => {
    render(<MemoryRouter initialEntries={['/no-existe']}><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { name: /página no encontrada/i })).toBeInTheDocument()
  })
})
