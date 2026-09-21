import type { AuditRead } from '../types/audit-types'

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function AuditTable({ items }: { items: AuditRead[] }) {
  return (
    <div className="report-table-wrap">
      <table className="report-table audit-table">
        <thead><tr><th scope="col">Fecha</th><th scope="col">Evento</th><th scope="col">Acción</th><th scope="col">Recurso</th><th scope="col">Actor</th><th scope="col">Resultado</th><th scope="col">Detalle</th></tr></thead>
        <tbody>{items.map((item) => <tr key={item.id}>
          <td>{formatDate(item.occurred_at)}</td>
          <th scope="row">{item.event_type}</th>
          <td>{item.action}</td>
          <td>{item.resource_type}{item.resource_id ? ` · ${item.resource_id}` : ''}</td>
          <td>{item.actor_role ?? 'Sistema'}</td>
          <td>{item.success ? 'Exitoso' : `Fallido${item.error_code ? ` · ${item.error_code}` : ''}`}</td>
          <td><span className="text-muted">Datos de contexto ocultos por seguridad.</span></td>
        </tr>)}</tbody>
      </table>
    </div>
  )
}
