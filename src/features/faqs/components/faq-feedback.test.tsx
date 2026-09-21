import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '../../../test/test-query-client'
import { FaqAccordion } from './faq-accordion'

const faq = {
  id: 'faq-1',
  category_id: 'cat-1',
  title: 'Saldo',
  question: '¿Cómo consulto mi saldo?',
  answer: 'Consulta un canal oficial.',
  summary: 'Consulta de saldo',
  keywords: 'saldo',
  tags: ['cuentas'],
  synonyms: ['disponible'],
  intent: 'consulta_saldo',
  status: 'PUBLISHED' as const,
  priority: 0,
  display_order: 0,
  version: 1,
  is_active: true,
  created_by: 'staff-1',
  created_at: '2026-09-21T00:00:00Z',
  updated_at: '2026-09-21T00:00:00Z',
  published_at: '2026-09-21T00:00:00Z',
}

describe('feedback de FAQ pública', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    sessionStorage.setItem('auth_token', 'feedback-token')
  })

  it('envía utilidad positiva y muestra confirmación solo después de la respuesta', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ id: 'feedback-1', is_helpful: true, created_at: '2026-09-21T00:00:00Z' }), { status: 201 }))
    renderWithQueryClient(
      <MemoryRouter>
        <FaqAccordion faqs={[faq]} categoryNames={{ 'cat-1': 'Cuentas' }} />
      </MemoryRouter>,
    )

    await userEvent.click(screen.getByRole('button', { name: /sí, fue útil/i }))

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/faqs/faq-1/feedback')
    expect(await screen.findByText(/gracias por tu feedback/i)).toBeInTheDocument()
  })
})
