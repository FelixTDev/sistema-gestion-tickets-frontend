import { useEffect, useId, useRef, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './icons'

const focusableSelector = [
  'a[href]',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  danger?: boolean
  role?: 'dialog' | 'alertdialog'
}

export function Modal({ open, onClose, title, children, footer, danger = false, role = 'dialog' }: ModalProps) {
  const titleId = `modal-title-${useId().replaceAll(':', '')}`
  const modalRootRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return

    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const modalRoot = modalRootRef.current
    const dialog = dialogRef.current
    if (!modalRoot || !dialog) return

    const backgroundElements = Array.from(document.body.children).filter(
      (element): element is HTMLElement => element instanceof HTMLElement && element !== modalRoot,
    )
    const previousState = backgroundElements.map((element) => ({
      element,
      inert: element.getAttribute('inert'),
      ariaHidden: element.getAttribute('aria-hidden'),
    }))
    const previousOverflow = document.body.style.overflow

    for (const element of backgroundElements) {
      element.setAttribute('inert', '')
      element.setAttribute('aria-hidden', 'true')
    }
    document.body.style.overflow = 'hidden'

    const initialTarget = contentRef.current?.querySelector<HTMLElement>(focusableSelector)
      ?? contentRef.current
      ?? dialog.querySelector<HTMLElement>(focusableSelector)
      ?? dialog
    initialTarget.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      for (const { element, inert, ariaHidden } of previousState) {
        if (inert === null) element.removeAttribute('inert')
        else element.setAttribute('inert', inert)
        if (ariaHidden === null) element.removeAttribute('aria-hidden')
        else element.setAttribute('aria-hidden', ariaHidden)
      }
      restoreFocusRef.current?.focus()
    }
  }, [open])

  if (!open) return null

  const containFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) return
    const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector))
    if (focusable.length === 0) {
      event.preventDefault()
      dialogRef.current.focus()
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <div
      ref={modalRootRef}
      data-modal-root=""
      className="fixed inset-0 z-[70] grid place-items-center p-4"
    >
      <div
        className="absolute inset-0 bg-[#06243a]/50 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={containFocus}
        className="gnb-pop relative flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-[16px] bg-white shadow-2xl"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 items-start gap-3 px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
            {danger ? (
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fbe3e2] text-danger">
                <Icon.warn size={20} />
              </span>
            ) : null}
            <h2 id={titleId} className="pt-1 text-[18px] font-bold text-ink">
              {title}
            </h2>
          </div>
          <div
            ref={contentRef}
            role="document"
            aria-label={`Contenido de ${title}`}
            tabIndex={-1}
            className="min-h-0 overflow-y-auto px-5 pb-5 text-[14px] leading-relaxed text-muted sm:px-6 sm:pb-6"
          >
            {children}
          </div>
        </div>
        {footer ? (
          <div className="flex justify-end gap-2.5 border-t bg-surface px-5 py-4 sm:px-6">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
