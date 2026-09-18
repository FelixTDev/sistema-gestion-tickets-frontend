import { Link } from 'react-router-dom'
import { Icon } from './icons'

export type BreadcrumbItem = { label: string; to?: string; onClick?: () => void }

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Ruta" className="text-[13px]">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const current = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.to && !current ? (
                <Link to={item.to} className="font-medium text-muted hover:text-turq-dark">
                  {item.label}
                </Link>
              ) : item.onClick && !current ? (
                <button type="button" onClick={item.onClick} className="font-medium text-muted hover:text-turq-dark">
                  {item.label}
                </button>
              ) : (
                <span className="font-semibold text-ink" aria-current={current ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!current ? <Icon.chevronR size={13} className="text-[#b6c3c9]" /> : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
