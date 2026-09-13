import type { ReactNode } from 'react'
export function ReportState({ isLoading, isError, onRetry, children }: { isLoading: boolean; isError: boolean; onRetry: () => void; children: ReactNode }) {
  if (isLoading) return <div className="state" role="status">Cargando reporte…</div>
  if (isError) return <div className="state state-error" role="alert"><strong>No pudimos cargar este reporte.</strong><button className="button button-small" type="button" onClick={onRetry}>Reintentar</button></div>
  return <>{children}</>
}
