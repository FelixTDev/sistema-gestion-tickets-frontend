import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ReportFiltersForm } from './report-filters'

describe('filtros de reportes', () => {
  it('conserva fechas visibles, convierte a ISO y rechaza rangos inválidos', async () => {
    const onApply = vi.fn(); render(<ReportFiltersForm categories={[]} onApply={onApply} />)
    await userEvent.type(screen.getByLabelText('Desde'), '2026-09-10'); await userEvent.type(screen.getByLabelText('Hasta'), '2026-09-12'); await userEvent.click(screen.getByRole('button', { name: /aplicar/i }))
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ from: '2026-09-10T00:00:00.000Z', to: '2026-09-12T23:59:59.999Z' }))
    expect(screen.getByLabelText('Desde')).toHaveValue('2026-09-10'); expect(screen.getByLabelText('Hasta')).toHaveValue('2026-09-12')
    await userEvent.clear(screen.getByLabelText('Desde')); await userEvent.type(screen.getByLabelText('Desde'), '2026-09-13'); await userEvent.click(screen.getByRole('button', { name: /aplicar/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/fecha desde no puede ser posterior/i); expect(onApply).toHaveBeenCalledTimes(1)
  })
  it('limpia todos los filtros y elimina los valores del formulario', async () => {
    const onApply = vi.fn(); render(<ReportFiltersForm categories={[]} onApply={onApply} />)
    await userEvent.type(screen.getByLabelText('Desde'), '2026-09-10'); await userEvent.click(screen.getByRole('button', { name: /limpiar/i }))
    expect(screen.getByLabelText('Desde')).toHaveValue(''); expect(onApply).toHaveBeenCalledWith({ from: '', to: '', category_id: '', status: '', priority: '' })
  })

  it.each([
    ['desde', '2026-09-10T00:00:00.000Z', ''],
    ['hasta', '', '2026-09-12T23:59:59.999Z'],
  ] as const)('envía solo la fecha %s sin desplazar el calendario', async (field, from, to) => {
    const onApply = vi.fn(); render(<ReportFiltersForm categories={[]} onApply={onApply} />)
    await userEvent.type(screen.getByLabelText(field === 'desde' ? 'Desde' : 'Hasta'), field === 'desde' ? '2026-09-10' : '2026-09-12')
    await userEvent.click(screen.getByRole('button', { name: /aplicar/i }))
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ from, to }))
  })
})
