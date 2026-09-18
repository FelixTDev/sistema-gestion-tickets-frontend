import type { CategoryReportItem, PriorityReportItem, StatusReportItem } from '../types/report-types'

export type ReportItem = StatusReportItem | CategoryReportItem | PriorityReportItem

function slug(value: string): string { return value.toLocaleLowerCase().replaceAll(/[^a-z0-9]+/gi, '-') }

export function ReportDistribution({ title, items, label }: { title: string; items: ReportItem[]; label: (item: ReportItem) => string }) {
  const max = Math.max(0, ...items.map((item) => Math.max(0, item.count)))
  const total = items.reduce((sum, item) => sum + Math.max(0, item.count), 0)
  const titleId = `report-${slug(title)}`
  return <section className="report-card card" aria-labelledby={titleId}><h2 id={titleId}>{title}</h2>{items.length === 0 ? <div className="state"><strong>Sin datos para mostrar.</strong><span>Ajusta los filtros para consultar otra vista.</span></div> : <div className="report-table-wrap"><table className="report-table"><thead><tr><th scope="col">Distribución</th><th scope="col">Cantidad</th><th scope="col">Participación</th></tr></thead><tbody>{items.map((item, index) => { const itemLabel = label(item); const count = Math.max(0, item.count); const percentage = total ? Math.round(count / total * 100) : 0; return <tr key={`${itemLabel}-${index}`}><th scope="row">{itemLabel}</th><td><div className="report-bar-row"><span className="report-bar" style={{ width: `${max ? count / max * 100 : 0}%` }} aria-hidden="true" /><span>{count}</span></div></td><td>{percentage}%</td></tr> })}</tbody></table></div>}</section>
}
