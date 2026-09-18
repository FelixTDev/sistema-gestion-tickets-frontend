import type { HTMLAttributes } from 'react'

type BankLogoProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: 'horizontal' | 'stacked'
  surface?: 'light' | 'dark'
  alt?: string
}

export function BankLogo({
  variant: _variant = 'horizontal',
  surface = 'light',
  className = '',
  ...props
}: BankLogoProps) {
  void _variant
  const isDark = surface === 'dark'

  return (
    <span
      {...props}
      role="img"
      aria-label="Banco GNB Perú"
      className={`inline-flex items-center gap-2.5 font-display select-none ${className}`}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-turq text-[14px] font-black tracking-tight text-white shadow-sm">
        GNB
      </span>
      <span className="flex flex-col text-left leading-none">
        <span className={`text-[18px] font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-ink-900'}`}>
          Banco GNB
        </span>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-[#a2c4d3]' : 'text-muted'}`}>
          Perú
        </span>
      </span>
    </span>
  )
}
