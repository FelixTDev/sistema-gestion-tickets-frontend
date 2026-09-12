import type { ElementType, ReactNode } from 'react'

export function PageContainer({ children, as: Component = 'div', className = '' }: { children: ReactNode; as?: ElementType; className?: string }) {
  return <Component className={`page-container ${className}`.trim()}>{children}</Component>
}
