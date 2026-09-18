import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Icon, type IconComponent } from './icons'

export type ToastKind = 'success' | 'error' | 'info' | 'warn'

type ToastRecord = {
  id: number
  message: string
  kind: ToastKind
}

type ToastContextValue = {
  toast: (message: string, kind?: ToastKind) => number
  dismissToast: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toneByKind: Record<ToastKind, { color: string; icon: IconComponent }> = {
  success: { color: '#4c7a15', icon: Icon.check },
  error: { color: '#b3261e', icon: Icon.alert },
  info: { color: '#0b4963', icon: Icon.info },
  warn: { color: '#8a5a00', icon: Icon.warn },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const nextId = useRef(0)

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toastItem) => toastItem.id !== id))
  }, [])

  const toast = useCallback((message: string, kind: ToastKind = 'info') => {
    nextId.current += 1
    const id = nextId.current
    setToasts((current) => [...current, { id, message, kind }])
    return id
  }, [])

  const contextValue = useMemo(() => ({ toast, dismissToast }), [dismissToast, toast])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastHost toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  )
}

function ToastHost({
  toasts,
  dismissToast,
}: {
  toasts: ToastRecord[]
  dismissToast: (id: number) => void
}) {
  return (
    <div className="fixed bottom-4 right-4 z-[90] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2.5">
      {toasts.map((toastItem) => (
        <ToastItem key={toastItem.id} toastItem={toastItem} dismissToast={dismissToast} />
      ))}
    </div>
  )
}

function ToastItem({
  toastItem,
  dismissToast,
}: {
  toastItem: ToastRecord
  dismissToast: (id: number) => void
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => dismissToast(toastItem.id), 5_000)
    return () => window.clearTimeout(timer)
  }, [dismissToast, toastItem.id])

  const tone = toneByKind[toastItem.kind]
  const ToastIcon = tone.icon
  return (
    <div
      role={toastItem.kind === 'error' ? 'alert' : 'status'}
      aria-live={toastItem.kind === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className="gnb-pop flex items-start gap-3 rounded-[12px] border border-[#e6edef] bg-white p-3.5 shadow-lg"
    >
      <ToastIcon size={18} className="mt-0.5 shrink-0" style={{ color: tone.color }} />
      <p className="min-w-0 flex-1 text-[13.5px] font-medium text-ink">{toastItem.message}</p>
      <button
        type="button"
        onClick={() => dismissToast(toastItem.id)}
        className="shrink-0 text-muted hover:text-ink"
        aria-label="Cerrar notificación"
      >
        <Icon.x size={15} />
      </button>
    </div>
  )
}

// The provider and its hook intentionally share one module as a single public primitive.
// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider.')
  return context
}
