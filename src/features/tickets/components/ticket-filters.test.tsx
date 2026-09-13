import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { emptyTicketFilters, TicketFilters } from './ticket-filters'

describe('TicketFilters', () => {
  it('conserva las fechas visibles y convierte el rango a UTC al aplicar', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()

    render(<TicketFilters categories={[]} onApply={onApply} />)
    await user.type(screen.getByLabelText('Desde'), '2026-09-10')
    await user.type(screen.getByLabelText('Hasta'), '2026-09-12')
    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }))

    expect(screen.getByLabelText('Desde')).toHaveValue('2026-09-10')
    expect(screen.getByLabelText('Hasta')).toHaveValue('2026-09-12')
    expect(onApply).toHaveBeenCalledWith({
      ...emptyTicketFilters,
      created_from: '2026-09-10T00:00:00.000Z',
      created_to: '2026-09-12T23:59:59.999Z',
    })
  })

  it('rechaza un rango invertido y permite limpiar los filtros', async () => {
    const user = userEvent.setup()
    const onApply = vi.fn()

    render(<TicketFilters categories={[]} onApply={onApply} />)
    await user.type(screen.getByLabelText('Desde'), '2026-09-12')
    await user.type(screen.getByLabelText('Hasta'), '2026-09-10')
    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }))

    expect(screen.getByRole('alert')).toHaveTextContent('La fecha desde no puede ser posterior a la fecha hasta.')
    expect(onApply).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }))
    expect(screen.getByLabelText('Desde')).toHaveValue('')
    expect(screen.getByLabelText('Hasta')).toHaveValue('')
    expect(onApply).toHaveBeenCalledWith(emptyTicketFilters)
  })
})
