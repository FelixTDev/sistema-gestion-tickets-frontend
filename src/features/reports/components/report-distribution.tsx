import type { CategoryReportItem, PriorityReportItem, StatusReportItem } from '../types/report-types'

export function ReportDistribution({ title, items, label }: { title: string; items: Array<StatusReportItem | CategoryReportItem | PriorityReportItem>; label: (item: StatusReportItem | CategoryReportItem | PriorityReportItem) => string }) {
  const max = Math.max(0, ...items.map((item) => item.count))
  return <section className="report-card card" aria-labelledby={`${title}-title`}><h2 id={`${title}-title`}>{title}</h2>{items.length === 0 ? <div className="state"><strong>Sin datos para mostrar.</strong><span>Ajusta los filtros para consultar otra vista.</span></div> : <table className="report-table"><thead><tr><th scope="col">Categoría</th><th scope="col">Cantidad</th></tr></thead><tbody>{items.map((item) => <tr key={label(item)}><th scope="row">{label(item)}</th><td><div className="report-bar-row"><span className="report-bar" style={{ width: `${max ? Math.max(4, item.count / max * 100) : 0}%` }} aria-hidden="true" /><span>{item.count}</span></div></td></tr>)}</tbody></table>}</section>
}
