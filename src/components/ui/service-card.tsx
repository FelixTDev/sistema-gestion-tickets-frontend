import type { ReactNode } from 'react'

export function ServiceCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return <article className="service-card"><span className="service-icon" aria-hidden="true">{icon}</span><h3>{title}</h3><p>{children}</p><span className="service-caption">Información referencial</span></article>
}
