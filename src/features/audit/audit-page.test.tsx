import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithQueryClient } from '../../test/test-query-client'
import { AuditPage } from './pages/audit-page'

describe('listado de auditoría', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    sessionStorage.setItem('auth_token', 'audit-page-token')
  })

  it('muestra eventos paginados sin exponer payloads sensibles', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      page: 1,
      page_size: 20,
      total: 1,
      total_pages: 1,
      items: [{
        id: 'audit-1',
        event_type: 'FAQ_WORKFLOW',
        action: 'PUBLISH',
        actor_user_id: 'actor-1',
        actor_role: 'SUPERVISOR',
        resource_type: 'FAQ',
        resource_id: 'faq-1',
        target_user_id: null,
        occurred_at: '2026-09-21T10:00:00Z',
        success: true,
        error_code: null,
        before_data: { answer: 'dato privado' },
        after_data: { answer: 'otro dato privado' },
        metadata: { ip: '127.0.0.1' },
        request_id: 'request-1',
        correlation_id: null,
      }],
    }), { status: 200 }))

    renderWithQueryClient(<AuditPage />)

    expect(await screen.findByText('FAQ_WORKFLOW')).toBeInTheDocument()
    expect(screen.getByText(/datos de contexto ocultos/i)).toBeInTheDocument()
    expect(screen.queryByText('dato privado')).not.toBeInTheDocument()
    expect(screen.queryByText('127.0.0.1')).not.toBeInTheDocument()
  })
})
