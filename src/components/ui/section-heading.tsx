import type { ReactNode } from 'react'

export function SectionHeading({ eyebrow, title, children, align = 'left' }: { eyebrow: string; title: string; children?: ReactNode; align?: 'left' | 'center' }) {
  return <div className={`section-heading section-heading-${align}`}><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{children && <p>{children}</p>}</div>
}
