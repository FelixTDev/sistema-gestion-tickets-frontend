import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ToastProvider } from '../../components/ui/toast-provider'
import { DesignSystemPage } from './pages/design-system-page'

describe('DesignSystemPage', () => {
  it('documenta todas las familias visuales aprobadas', () => {
    render(
      <MemoryRouter><ToastProvider><DesignSystemPage /></ToastProvider></MemoryRouter>,
    )

    for (const heading of [
      'Logo',
      'Colores y variables',
      'Tipografía',
      'Escala de espaciado',
      'Botones',
      'Formularios',
      'Badges de estado y prioridad',
      'Cards',
      'Alerts, banners y toast',
      'Modal, tabs y breadcrumbs',
      'Navbar y sidebar',
      'Tabla responsive',
      'Timeline y comentarios',
      'Empty, error y loading',
      'Chatbot widget',
      'Paginación',
    ]) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
    }
  })

  it('muestra únicamente ejemplos neutrales y los logos autorizados', () => {
    render(
      <MemoryRouter><ToastProvider><DesignSystemPage /></ToastProvider></MemoryRouter>,
    )

    expect(screen.getAllByRole('img', { name: /banco gnb/i }).length).toBeGreaterThanOrEqual(4)
    expect(screen.queryByText(/prototipo|demo|simulad|académic|fictici|no oficial/i)).not.toBeInTheDocument()
    expect(screen.getByText('Elemento A')).toBeInTheDocument()
    expect(screen.queryByText(/GNB-\d+/i)).not.toBeInTheDocument()
  })
})
