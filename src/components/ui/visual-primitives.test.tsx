import { useState } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'
import { Field, Input } from './form-controls'
import { EmptyState, ErrorState } from './states'
import { Tabs } from './tabs'
import { ToastProvider, useToast } from './toast-provider'

describe('visual primitives', () => {
  it('marks loading buttons busy and prevents activation while disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <>
        <Button loading onClick={onClick}>Guardar</Button>
        <Button disabled onClick={onClick}>Eliminar</Button>
      </>,
    )

    const button = screen.getByRole('button', { name: 'Guardar' })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()
    await user.click(button)
    await user.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('exposes error states as alerts', () => {
    render(<ErrorState message="No se pudo cargar." />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('No se pudo cargar.')
    expect(alert).not.toHaveClass('state', 'state-error')
  })

  it('keeps ported state headings and descriptions at the ZIP line height', () => {
    render(
      <>
        <ErrorState title="Error" desc="Descripción de error" />
        <EmptyState title="Vacío" desc="Descripción vacía" />
      </>,
    )

    for (const heading of screen.getAllByRole('heading')) expect(heading).toHaveClass('leading-normal')
    expect(screen.getByText('Descripción de error')).toHaveClass('leading-normal')
    expect(screen.getByText('Descripción vacía')).toHaveClass('leading-normal')
  })

  it('associates a field label and accessible error with its input', () => {
    render(
      <Field label="Correo" error="Ingresa un correo válido." required>
        <Input />
      </Field>,
    )

    const input = screen.getByRole('textbox', { name: /correo/i })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Ingresa un correo válido.')
  })

  it('moves through tabs with arrow, Home and End keys', () => {
    function TabsHarness() {
      const [value, setValue] = useState('resumen')
      return (
        <Tabs
          tabs={[
            { id: 'resumen', label: 'Resumen' },
            { id: 'historial', label: 'Historial' },
            { id: 'comentarios', label: 'Comentarios' },
          ]}
          value={value}
          onChange={setValue}
        />
      )
    }

    render(<TabsHarness />)
    const resumen = screen.getByRole('tab', { name: 'Resumen' })
    const historial = screen.getByRole('tab', { name: 'Historial' })
    const comentarios = screen.getByRole('tab', { name: 'Comentarios' })

    resumen.focus()
    fireEvent.keyDown(resumen, { key: 'ArrowRight' })
    expect(historial).toHaveFocus()
    expect(historial).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(historial, { key: 'End' })
    expect(comentarios).toHaveFocus()
    expect(comentarios).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(comentarios, { key: 'Home' })
    expect(resumen).toHaveFocus()
    expect(resumen).toHaveAttribute('aria-selected', 'true')
  })

  it('namespaces tab ids per group and links panels only through an explicit contract', () => {
    const onChange = vi.fn()
    render(
      <>
        <Tabs tabs={[{ id: 'resumen', label: 'Resumen' }]} value="resumen" onChange={onChange} aria-label="Grupo uno" />
        <Tabs tabs={[{ id: 'resumen', label: 'Resumen' }]} value="resumen" onChange={onChange} aria-label="Grupo dos" />
        <Tabs
          tabs={[{ id: 'detalle', label: 'Detalle', panelId: 'panel-detalle' }]}
          value="detalle"
          onChange={onChange}
          aria-label="Grupo con panel"
        />
      </>,
    )

    const repeatedTabs = screen.getAllByRole('tab', { name: 'Resumen' })
    expect(repeatedTabs[0].id).not.toBe(repeatedTabs[1].id)
    expect(repeatedTabs[0]).not.toHaveAttribute('aria-controls')
    expect(screen.getByRole('tab', { name: 'Detalle' })).toHaveAttribute('aria-controls', 'panel-detalle')
  })

  it('announces toasts through a live region', async () => {
    const user = userEvent.setup()

    function ToastHarness() {
      const { toast } = useToast()
      return <button onClick={() => toast('Cambios guardados.', 'success')}>Notificar</button>
    }

    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Notificar' }))
    expect(screen.getByRole('status')).toHaveTextContent('Cambios guardados.')
  })

  it('keeps each toast expiration independent when another toast is added', () => {
    vi.useFakeTimers()
    try {
      function ToastHarness() {
        const { toast } = useToast()
        return (
          <>
            <button onClick={() => toast('Primera notificación')}>Primera</button>
            <button onClick={() => toast('Segunda notificación')}>Segunda</button>
          </>
        )
      }

      render(
        <ToastProvider>
          <ToastHarness />
        </ToastProvider>,
      )

      fireEvent.click(screen.getByRole('button', { name: 'Primera' }))
      act(() => vi.advanceTimersByTime(3_000))
      fireEvent.click(screen.getByRole('button', { name: 'Segunda' }))
      act(() => vi.advanceTimersByTime(2_100))

      expect(screen.queryByText('Primera notificación')).not.toBeInTheDocument()
      expect(screen.getByText('Segunda notificación')).toBeInTheDocument()
    } finally {
      act(() => vi.runOnlyPendingTimers())
      vi.useRealTimers()
    }
  })
})
