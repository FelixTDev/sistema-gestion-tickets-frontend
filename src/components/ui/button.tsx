import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { IconComponent } from './icons'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  loading?: boolean
  icon?: IconComponent
  full?: boolean
  size?: ButtonSize
  children?: ReactNode
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-[14px]',
  lg: 'h-12 px-6 text-[15px]',
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-turq text-white hover:bg-turq-dark shadow-sm shadow-[#078f98]/20',
  secondary: 'border border-[#cdd9de] bg-white text-ink-800 hover:border-turq-dark hover:text-turq-dark',
  tertiary: 'bg-transparent text-turq-dark hover:bg-[#078f98]/[0.08]',
  danger: 'bg-danger text-white hover:bg-[#a71d1d]',
  ghost: 'bg-transparent text-ink hover:bg-black/5',
}

export function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon: ButtonIcon,
  className = '',
  type = 'button',
  full = false,
  size = 'md',
  ...buttonProps
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      {...buttonProps}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`inline-flex select-none items-center justify-center gap-2 rounded-[10px] font-display font-semibold transition-all duration-150 ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${full ? 'w-full' : ''} ${
        isDisabled ? 'cursor-not-allowed opacity-55' : 'active:scale-[0.98]'
      } ${className}`}
    >
      {loading ? (
        <span
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : ButtonIcon ? (
        <ButtonIcon size={17} />
      ) : null}
      {children}
    </button>
  )
}
