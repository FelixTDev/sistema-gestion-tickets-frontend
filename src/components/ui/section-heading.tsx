import type { ReactNode } from 'react'

export function SectionHeading({ eyebrow, title, children, align = 'left', level = 2 }: { eyebrow: string; title: string; children?: ReactNode; align?: 'left' | 'center'; level?: 1 | 2 }) {
  const Heading = level === 1 ? 'h1' : 'h2'

  return <div className={`section-heading section-heading-${align}`}><span className="eyebrow">{eyebrow}</span><Heading>{title}</Heading>{children && <p>{children}</p>}</div>
}
