import type { HTMLAttributes } from 'react'

export function Skeleton({ className = '', ...skeletonProps }: HTMLAttributes<HTMLDivElement>) {
  return <div {...skeletonProps} aria-hidden="true" className={`gnb-skel rounded-[8px] ${className}`} />
}
