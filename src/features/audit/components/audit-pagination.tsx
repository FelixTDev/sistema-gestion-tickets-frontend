export function AuditPagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null
  return <nav aria-label="Paginación de auditoría" className="flex items-center justify-between gap-3 py-4"><button className="button button-small button-ghost" type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Anterior</button><span>Página {page} de {totalPages}</span><button className="button button-small button-ghost" type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Siguiente</button></nav>
}
