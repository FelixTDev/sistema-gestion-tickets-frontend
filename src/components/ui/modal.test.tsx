import { useState } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './modal'

describe('Modal', () => {
  it('closes on Escape and restores focus to the opener', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const opener = document.createElement('button')
    opener.textContent = 'Abrir'
    document.body.append(opener)
    opener.focus()

    const { unmount } = render(
      <Modal open onClose={onClose} title="Confirmar acción">
        <button>Confirmar</button>
      </Modal>,
    )

    expect(screen.getByRole('dialog', { name: 'Confirmar acción' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()

    unmount()
    expect(opener).toHaveFocus()
    opener.remove()
  })

  it('contains keyboard focus and blocks background interaction', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <main>
        <button>Fondo</button>
        <Modal open onClose={onClose} title="Acciones">
          <button>Primero</button>
          <button>Último</button>
        </Modal>
      </main>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Acciones' })
    expect(dialog.parentElement).toHaveAttribute('data-modal-root')
    expect(dialog.parentElement?.previousElementSibling).toHaveAttribute('inert')

    const first = screen.getByRole('button', { name: 'Primero' })
    const last = screen.getByRole('button', { name: 'Último' })
    expect(first).toHaveFocus()
    last.focus()
    await user.tab()
    expect(first).toHaveFocus()
    await user.tab({ shift: true })
    expect(last).toHaveFocus()
  })

  it('preserves focused controls when a controlled parent re-renders with a new callback', async () => {
    const user = userEvent.setup()

    function ControlledModal() {
      const [count, setCount] = useState(0)
      return (
        <Modal open onClose={() => undefined} title="Edición controlada">
          <button>Primero</button>
          <button onClick={() => setCount((current) => current + 1)}>Actualizar {count}</button>
        </Modal>
      )
    }

    render(<ControlledModal />)
    const updateButton = screen.getByRole('button', { name: 'Actualizar 0' })

    await user.click(updateButton)

    expect(screen.getByRole('button', { name: 'Actualizar 1' })).toHaveFocus()
  })

  it('keeps tall content scrollable while the footer stays reachable', () => {
    render(
      <Modal
        open
        onClose={() => undefined}
        title="Contenido extenso"
        footer={<button>Guardar cambios</button>}
      >
        <p>{'Contenido '.repeat(400)}</p>
      </Modal>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Contenido extenso' })
    expect(dialog).toHaveClass('flex', 'max-h-[calc(100dvh-2rem)]')
    expect(within(dialog).getByRole('document')).toHaveClass('overflow-y-auto')
    expect(within(dialog).getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
  })
})
