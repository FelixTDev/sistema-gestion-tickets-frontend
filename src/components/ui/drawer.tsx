import { createPortal } from 'react-dom'
import { useEffect, useId, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'

const focusableSelector = 'a[href],button:not([disabled]):not([tabindex="-1"]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function AccessibleDrawer({ open, onClose, title, children, side = 'right', id }: { open: boolean; onClose: () => void; title: string; children: ReactNode; side?: 'left' | 'right'; id?: string }) {
  const titleId = `drawer-title-${useId().replaceAll(':', '')}`
  const rootRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const root = rootRef.current
    const dialog = dialogRef.current
    if (!root || !dialog) return
    const background = Array.from(document.body.children).filter((element): element is HTMLElement => element instanceof HTMLElement && element !== root)
    const previousState = background.map((element) => ({ element, inert: element.getAttribute('inert'), ariaHidden: element.getAttribute('aria-hidden') }))
    const previousOverflow = document.body.style.overflow
    background.forEach((element) => { element.setAttribute('inert', ''); element.setAttribute('aria-hidden', 'true') })
    document.body.style.overflow = 'hidden'
    ;(dialog.querySelector<HTMLElement>(focusableSelector) ?? dialog).focus()
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); onCloseRef.current() } }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousState.forEach(({ element, inert, ariaHidden }) => {
        if (inert === null) element.removeAttribute('inert'); else element.setAttribute('inert', inert)
        if (ariaHidden === null) element.removeAttribute('aria-hidden'); else element.setAttribute('aria-hidden', ariaHidden)
      })
      restoreFocusRef.current?.focus()
    }
  }, [open])

  if (!open) return null
  const containFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) return
    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector))
    if (focusable.length === 0) { event.preventDefault(); dialogRef.current.focus(); return }
    const first = focusable[0]; const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
  return createPortal(
    <div ref={rootRef} id={id ?? 'client-mobile-drawer'} data-drawer-root="" className="fixed inset-0 z-[80]" data-testid="accessible-drawer-root">
      <button type="button" className="absolute inset-0 h-full w-full bg-[#06243a]/50" aria-label={`Cerrar ${title}`} onClick={onClose} />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} onKeyDown={containFocus} className={`gnb-pop absolute bottom-0 top-0 flex w-[min(18rem,88vw)] flex-col overflow-y-auto overscroll-contain bg-white p-4 shadow-2xl ${side === 'left' ? 'left-0' : 'right-0'} pb-[max(1rem,env(safe-area-inset-bottom))]`}>
        <h2 id={titleId} className="sr-only">{title}</h2>
        {children}
      </div>
    </div>,
    document.body,
  )
}
