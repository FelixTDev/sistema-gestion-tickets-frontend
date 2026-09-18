import type { ReactNode } from 'react'
import { Button } from './button'
import { Icon, type IconComponent } from './icons'

export function LoadingState({ message = 'Cargando información…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center text-[14px] leading-normal text-muted" role="status" aria-live="polite">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-turq" aria-hidden="true" />
      {message}
    </div>
  )
}

export function ErrorState({
  message,
  title = 'No pudimos cargar la información',
  desc = 'Ocurrió un problema de conexión. Vuelve a intentarlo en unos segundos.',
  onRetry,
}: {
  message?: string
  title?: string
  desc?: string
  onRetry?: () => void
}) {
  const description = message ?? desc
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center" role="alert">
      <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#fbe3e2] text-danger" aria-hidden="true">
        <Icon.alert size={28} />
      </span>
      <h3 className="mb-1.5 text-[17px] font-bold leading-normal text-ink">{title}</h3>
      <p className="mx-auto mb-5 max-w-sm text-[14px] leading-normal text-muted">{description}</p>
      {onRetry ? (
        <Button variant="secondary" icon={Icon.refresh} onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  )
}

export function EmptyState({
  icon: EmptyIcon = Icon.inbox,
  title = 'Aún no hay información',
  message,
  desc = 'Cuando exista actividad, aparecerá aquí.',
  action,
}: {
  icon?: IconComponent
  title?: string
  message?: string
  desc?: string
  action?: ReactNode
}) {
  return (
    <div className="px-6 py-14 text-center">
      <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#eef4f5] text-turq" aria-hidden="true">
        <EmptyIcon size={28} />
      </span>
      <h3 className="mb-1.5 text-[17px] font-bold leading-normal text-ink">{title}</h3>
      <p className="mx-auto mb-5 max-w-sm text-[14px] leading-normal text-muted">{message ?? desc}</p>
      {action}
    </div>
  )
}

export function AccessDeniedState() {
  return <ErrorState title="Acceso denegado" desc="Necesitas una sesión con el rol permitido para continuar." />
}

export const AccessDenied = AccessDeniedState
