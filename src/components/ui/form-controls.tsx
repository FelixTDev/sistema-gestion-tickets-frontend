import {
  cloneElement,
  useId,
  type InputHTMLAttributes,
  type ReactElement,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { Icon } from './icons'

type FieldControlProps = {
  id?: string
  required?: boolean
  error?: boolean
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling'
}

export type FieldProps = {
  label: string
  hint?: string
  tooltip?: string
  error?: string
  required?: boolean
  children: ReactElement<FieldControlProps>
}

export function Field({ label, hint, tooltip, error, required = false, children }: FieldProps) {
  const reactId = useId().replaceAll(':', '')
  const controlId = children.props.id ?? `field-${reactId}`
  const descriptionId = error ? `${controlId}-error` : hint ? `${controlId}-hint` : undefined
  const describedBy = [children.props['aria-describedby'], descriptionId].filter(Boolean).join(' ') || undefined

  const control = cloneElement(children, {
    id: controlId,
    required: required || children.props.required,
    error: Boolean(error) || children.props.error,
    'aria-invalid': error ? true : children.props['aria-invalid'],
    'aria-describedby': describedBy,
  })

  return (
    <div className="block">
      <div className="mb-1 flex items-center justify-between text-[13px] font-semibold text-ink">
        <div className="flex items-center gap-1.5">
          <label htmlFor={controlId}>
            {label}{' '}
            {required ? (
              <span className="text-danger" aria-hidden="true">
                *
              </span>
            ) : null}
          </label>
          {tooltip ? (
            <span className="group relative inline-flex items-center">
              <span
                tabIndex={0}
                aria-label={tooltip}
                title={tooltip}
                className="grid h-4 w-4 place-items-center rounded-full bg-[#e6edef] text-[11px] font-extrabold text-[#526875] transition-colors hover:bg-turq hover:text-white"
              >
                i
              </span>
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#06243a] px-2.5 py-1 text-[11.5px] font-medium text-white shadow-lg group-hover:block group-focus-within:block z-30">
                {tooltip}
              </span>
            </span>
          ) : null}
        </div>
        {hint ? <span className="text-[11.5px] font-normal text-muted">{hint}</span> : null}
      </div>
      {control}
      {error ? (
        <p
          id={descriptionId}
          className="mt-1 flex items-center gap-1 text-[12px] font-medium text-danger"
        >
          <Icon.alert size={13} />
          {error}
        </p>
      ) : null}
    </div>
  )
}

function inputClasses(error: boolean, className: string) {
  return `h-11 w-full rounded-[10px] border bg-white px-3.5 text-[14px] text-ink outline-none transition-colors placeholder:text-[#9aa8b0] ${
    error ? 'border-danger' : 'border-[#cdd9de] hover:border-[#a9bcc4] focus:border-turq'
  } ${className}`
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { error?: boolean }

export function Input({ error = false, className = '', ...inputProps }: InputProps) {
  return (
    <input
      {...inputProps}
      aria-invalid={error || inputProps['aria-invalid'] || undefined}
      className={inputClasses(error, className)}
    />
  )
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }

export function Textarea({ error = false, className = '', ...textareaProps }: TextareaProps) {
  return (
    <textarea
      {...textareaProps}
      aria-invalid={error || textareaProps['aria-invalid'] || undefined}
      className={`${inputClasses(error, className)} min-h-[110px] !h-auto resize-y py-2.5`}
    />
  )
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }

export function Select({ error = false, className = '', children, ...selectProps }: SelectProps) {
  return (
    <span className="relative block">
      <select
        {...selectProps}
        aria-invalid={error || selectProps['aria-invalid'] || undefined}
        className={`${inputClasses(error, className)} appearance-none pr-10`}
      >
        {children}
      </select>
      <Icon.chevron
        size={17}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
      />
    </span>
  )
}

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'checked' | 'onChange' | 'type'> & {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Checkbox({ label, checked, onChange, className = '', ...checkboxProps }: CheckboxProps) {
  return (
    <label
      className={`group flex cursor-pointer select-none items-center gap-2.5 text-[14px] text-ink ${
        checkboxProps.disabled ? 'cursor-not-allowed opacity-55' : ''
      } ${className}`}
    >
      <input
        {...checkboxProps}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        className={`grid h-5 w-5 place-items-center rounded-[6px] border transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-turq ${
          checked ? 'border-turq bg-turq' : 'border-[#cdd9de] bg-white group-hover:border-turq'
        }`}
        aria-hidden="true"
      >
        {checked ? <Icon.check size={13} className="text-white" /> : null}
      </span>
      <span>{label}</span>
    </label>
  )
}
