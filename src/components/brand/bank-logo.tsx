import type { ImgHTMLAttributes } from 'react'
import horizontalLogo from '../../assets/brand/banco-gnb-horizontal.png'
import stackedLogo from '../../assets/brand/banco-gnb-apilado.png'

type BankLogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'src'> & {
  variant?: 'horizontal' | 'stacked'
  surface?: 'light' | 'dark'
  alt?: string
}

export function BankLogo({
  variant = 'horizontal',
  surface = 'light',
  alt = 'Banco GNB Perú',
  className = '',
  ...imageProps
}: BankLogoProps) {
  const source = variant === 'horizontal' ? horizontalLogo : stackedLogo
  const frame = variant === 'horizontal' ? 'h-8 w-[174px]' : 'h-[220px] w-[148px]'
  const crop = variant === 'horizontal'
    ? 'absolute left-0 top-0 w-[189%] max-w-none -translate-x-[23.2%] -translate-y-[44%]'
    : 'absolute left-0 top-0 w-[180%] max-w-none -translate-x-[23.5%] -translate-y-[12.5%]'

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-white ${frame} ${className} ${
        surface === 'dark' ? 'rounded-[10px] p-1.5' : ''
      }`}
    >
      <img
        {...imageProps}
        src={source}
        alt={alt}
        className={crop}
      />
    </span>
  )
}
