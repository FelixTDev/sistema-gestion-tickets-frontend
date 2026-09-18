import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AccessibleDrawer } from './drawer'

describe('AccessibleDrawer', () => {
  it('aísla el fondo, contiene Tab y restaura el foco al cerrar', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const opener = document.createElement('button')
    opener.textContent = 'Abrir'
    document.body.append(opener)
    opener.focus()
    const { rerender, unmount } = render(<AccessibleDrawer open onClose={onClose} title="Menú"><button>Primero</button><button>Último</button></AccessibleDrawer>)
    const drawer = screen.getByRole('dialog', { name: 'Menú' })
    expect(drawer).toHaveClass('w-[min(18rem,88vw)]')
    expect(drawer.parentElement).toHaveAttribute('data-drawer-root')
    expect(document.body.firstElementChild).toHaveAttribute('inert')
    const first = screen.getByRole('button', { name: 'Primero' })
    const last = screen.getByRole('button', { name: 'Último' })
    expect(first).toHaveFocus()
    last.focus()
    await user.tab()
    expect(first).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Cerrar Menú' }))
    expect(onClose).toHaveBeenCalledOnce()
    rerender(<AccessibleDrawer open={false} onClose={onClose} title="Menú"><button>Primero</button></AccessibleDrawer>)
    expect(opener).toHaveFocus()
    unmount()
    opener.remove()
  })
})
