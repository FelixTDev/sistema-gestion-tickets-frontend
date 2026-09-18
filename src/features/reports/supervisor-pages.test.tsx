import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderWithQueryClient } from '../../test/test-query-client'
import { ReportDistribution } from './components/report-distribution'
import { ReportsPage } from './pages/reports-page'

describe('supervisor report pages', () => {
  it('renders a zero-safe distribution without NaN widths', () => {
    const { container } = render(<ReportDistribution title="Tickets por estado" items={[{ status: 'NUEVO', count: 0 }]} label={(item) => 'status' in item ? item.status : ''} />)
    expect(screen.getByRole('row', { name: /NUEVO 0/i })).toBeInTheDocument()
    expect(container.querySelector('.report-bar')).toHaveStyle({ width: '0%' })
    expect(container.textContent).not.toContain('NaN')
  })

  it('keeps export visibly unavailable', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise<Response>(() => undefined))
    renderWithQueryClient(<ReportsPage />)
    expect(screen.getByRole('button', { name: /exportar/i })).toBeDisabled()
    expect(screen.getByText(/funcionalidad no disponible/i)).toBeInTheDocument()
  })

  it('keeps successful report sections visible when one report fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input)
      if (url.endsWith('/categories')) return new Response('[]', { status: 200 })
      if (url.endsWith('/reports/by-status')) return new Response(JSON.stringify({ detail: 'temporary failure' }), { status: 503 })
      if (url.endsWith('/reports/summary')) return new Response(JSON.stringify({ total_tickets: 2, new_tickets: 1, assigned_tickets: 1, in_process_tickets: 0, pending_client_tickets: 0, resolved_tickets: 0, closed_tickets: 0, cancelled_tickets: 0, average_resolution_time_hours: 3 }), { status: 200 })
      if (url.endsWith('/reports/by-category')) return new Response(JSON.stringify({ items: [{ category_id: 'cat-1', category_name: 'Cuentas', count: 2 }] }), { status: 200 })
      if (url.endsWith('/reports/by-priority')) return new Response(JSON.stringify({ items: [{ priority: 'ALTA', count: 2 }] }), { status: 200 })
      return new Response(JSON.stringify({ resolved_tickets: 0, average_resolution_time_hours: 0 }), { status: 200 })
    })
    renderWithQueryClient(<ReportsPage />)
    expect(await screen.findByText(/no pudimos cargar este reporte/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tickets por categoría' })).toBeInTheDocument()
    expect(screen.getByText('Cuentas')).toBeInTheDocument()
    expect(screen.getAllByText('2').length).toBeGreaterThan(0)
  })
})
