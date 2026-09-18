import type { HTMLAttributes } from 'react'

export type CardProps = HTMLAttributes<HTMLDivElement> & { pad?: boolean }

export function Card({ children, className = '', pad = true, ...cardProps }: CardProps) {
  return (
    <div
      {...cardProps}
      className={`rounded-[14px] border border-[#e6edef] bg-white shadow-[0_1px_2px_rgba(16,42,67,0.04),0_8px_24px_-16px_rgba(16,42,67,0.12)] ${
        pad ? 'p-5 sm:p-6' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
