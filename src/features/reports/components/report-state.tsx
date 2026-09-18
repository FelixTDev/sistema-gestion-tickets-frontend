import type { ReactNode } from 'react'
export function ReportState({ isLoading, isError, isEmpty = false, emptyMessage = 'Sin datos para mostrar.', onRetry, children }: { isLoading: boolean; isError: boolean; isEmpty?: boolean; emptyMessage?: string; onRetry: () => void; children: ReactNode }) {
  if (isLoading) return <div className="state" role="status" aria-live="polite">Cargando reporte…</div>
  if (isError) return <div className="state state-error" role="alert"><strong>No pudimos cargar este reporte.</strong><button className="button button-small" type="button" onClick={onRetry}>Reintentar</button></div>
  if (isEmpty) return <div className="state"><strong>{emptyMessage}</strong></div>
  return <>{children}</>
}
