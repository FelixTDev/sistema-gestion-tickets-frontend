import type { ReactNode } from 'react'

export function PageHeader({ title, subtitle, eyebrow, action }: { title: string; subtitle?: string; eyebrow?: string; action?: ReactNode }) {
  return <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow && <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.12em] text-turq-dark">{eyebrow}</p>}
      <h1 className="text-[28px] font-extrabold text-ink sm:text-[32px]">{title}</h1>
      {subtitle && <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-muted">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </header>
}
