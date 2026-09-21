import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AuthShell } from '../../components/layout/auth-shell'
import { Button } from '../../components/ui/button'
import { Field, Input } from '../../components/ui/form-controls'
import { Icon } from '../../components/ui/icons'
import { ApiError } from '../../lib/api-client'
import type { LoginRequest, RegisterRequest, Role, Session } from '../../types/auth'
import { useAuth } from './auth-provider'
import type { ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest } from './auth-types'
import { changePassword, forgotPassword, register, resetPassword, verifyEmail } from './auth-service'
import { changePasswordSchema, forgotPasswordSchema, passwordConfirmationSchema, passwordRule } from './auth-schemas'

const loginSchema = z.object({ email: z.string().trim().email('Ingresa un correo válido.'), password: z.string().min(1, 'La contraseña es obligatoria.') })
const registerSchema = z.object({ full_name: z.string().trim().min(1, 'El nombre completo es obligatorio.'), email: z.string().trim().email('Ingresa un correo válido.'), phone: z.string().optional(), password: passwordRule, confirmPassword: z.string().min(1, 'Confirma tu contraseña.') }).refine((data) => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'Las contraseñas no coinciden.' })
const errorMessage = (error: unknown, conflict: string): string => error instanceof ApiError && error.status === 409 ? conflict : error instanceof ApiError && error.status === 422 ? 'Revisa los datos ingresados.' : 'No fue posible completar la solicitud. Inténtalo nuevamente.'
type LoginPortal = 'client' | 'staff'

function destinationFor(role: Role): string { if (role === 'CLIENTE') return '/cliente'; if (role === 'ASESOR') return '/personal/tickets'; return '/personal' }
function acceptsRole(portal: LoginPortal, role: Role): boolean { return portal === 'client' ? role === 'CLIENTE' : role === 'ASESOR' || role === 'SUPERVISOR' }

function Feedback({ children, kind = 'error' }: { children: React.ReactNode; kind?: 'error' | 'success' | 'info' }) {
  const classes = kind === 'error' ? 'border-[#efb5b2] bg-[#fff2f1] text-[#8b1e1e]' : kind === 'success' ? 'border-[#b9d991] bg-[#f3f9e9] text-[#3f6512]' : 'border-[#b8d4de] bg-[#eef6f8] text-ink-800'
  return <div className={`rounded-[10px] border px-4 py-3 text-[13.5px] leading-relaxed ${classes}`} role={kind === 'error' ? 'alert' : 'status'}>{children}</div>
}

function PortalMismatch({ portal }: { portal: LoginPortal }) {
  return portal === 'client'
    ? <Feedback><strong className="block">Esta cuenta pertenece al acceso interno.</strong><span className="block">Utiliza el portal reservado para asesores y supervisores.</span><Link className="mt-1 inline-block font-semibold underline" to="/personal/login">Ir al acceso para personal</Link></Feedback>
    : <Feedback><strong className="block">Debes utilizar el portal de clientes.</strong><span className="block">Este acceso es exclusivo para personal autorizado.</span><Link className="mt-1 inline-block font-semibold underline" to="/login">Ir al acceso de clientes</Link></Feedback>
}

function LoginForm({ portal }: { portal: LoginPortal }) {
  const { signIn, signOut } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const [mismatchedPortal, setMismatchedPortal] = useState(false)
  const { register: field, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginRequest>({ resolver: zodResolver(loginSchema) })
  const submit = async (data: LoginRequest) => {
    setServerError(null); setMismatchedPortal(false)
    try {
      const session: Session = await signIn(data)
      if (!acceptsRole(portal, session.user.role)) { await signOut(); setMismatchedPortal(true); return }
      navigate(destinationFor(session.user.role), { replace: true })
    } catch (error: unknown) { setServerError(error instanceof ApiError && error.status === 401 ? 'El correo o la contraseña son incorrectos.' : errorMessage(error, 'No fue posible iniciar sesión.')) }
  }
  const isStaff = portal === 'staff'
  const emailId = isStaff ? 'staff-login-email' : 'client-login-email'
  const passwordId = isStaff ? 'staff-login-password' : 'client-login-password'

  return <AuthShell side={isStaff ? 'staff' : 'client'} title={isStaff ? 'Acceso para personal' : 'Bienvenido de vuelta'} subtitle={isStaff ? 'Ingresa con tu cuenta autorizada para continuar.' : 'Ingresa a tu portal para gestionar tus consultas y solicitudes.'}>
    <div className="space-y-4">
      {mismatchedPortal && <PortalMismatch portal={portal} />}
      {serverError && <Feedback>{serverError}</Feedback>}
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <Field label="Correo electrónico" required error={errors.email?.message}><Input id={emailId} type="email" autoComplete="email" placeholder="correo@ejemplo.com" {...field('email')} /></Field>
        <Field label="Contraseña" required error={errors.password?.message}><Input id={passwordId} type="password" autoComplete="current-password" placeholder="••••••••" {...field('password')} /></Field>
        {!isStaff && <div className="flex justify-end"><Link to="/recuperar-contrasena" className="min-h-11 py-2 text-[13px] font-semibold text-turq-dark hover:underline">¿Olvidaste tu contraseña?</Link></div>}
        <Button type="submit" full size="lg" loading={isSubmitting} icon={isStaff ? Icon.shield : Icon.lock}>{isSubmitting ? (isStaff ? 'Validando acceso…' : 'Validando…') : (isStaff ? 'Ingresar al portal interno' : 'Iniciar sesión')}</Button>
      </form>
      <div className="border-t border-[#eef2f3] pt-5 text-center text-[14px] text-muted space-y-3">
        {isStaff ? (
          <Link className="inline-flex min-h-11 items-center gap-1.5 hover:text-ink transition-colors" to="/">
            <Icon.arrowL size={14} /> Volver al sitio público
          </Link>
        ) : (
          <>
            <p>
              ¿Aún no tienes cuenta?{' '}
              <Link className="font-semibold text-turq-dark hover:underline" to="/register">
                Crear cuenta
              </Link>
            </p>
            <div>
              <Link className="inline-flex min-h-11 items-center gap-1.5 text-[13.5px] text-muted hover:text-ink transition-colors" to="/">
                <Icon.arrowL size={14} /> Volver al sitio público
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  </AuthShell>
}

export function ClientLoginForm() { return <LoginForm portal="client" /> }
export function StaffLoginForm() { return <LoginForm portal="staff" /> }

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { register: field, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterRequest & { confirmPassword: string }>({ resolver: zodResolver(registerSchema) })
  const submit = async (data: RegisterRequest & { confirmPassword: string }) => {
    setServerError(null)
    try {
      const payload: RegisterRequest = { full_name: data.full_name, email: data.email, phone: data.phone || undefined, password: data.password }
      await register(payload)
      setSuccess(true)
    } catch (error: unknown) { setServerError(errorMessage(error, 'Ese correo ya está registrado.')) }
  }

  return <AuthShell side="client" title={success ? '¡Cuenta creada!' : 'Crear cuenta'} subtitle={success ? 'Tu cuenta se registró correctamente.' : 'Regístrate para dar seguimiento a tus solicitudes.'}>
    {success ? <div className="space-y-5">
      <div className="grid place-items-center py-4"><span className="gnb-pop grid h-20 w-20 place-items-center rounded-full bg-[#e9f4d7] text-[#4c7a15]"><Icon.check size={40} /></span></div>
      <Feedback kind="success">Cuenta creada. Ya puedes iniciar sesión y comenzar a gestionar tus consultas.</Feedback>
      <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] bg-turq-dark px-6 text-[15px] font-semibold text-white" to="/login">Ir al inicio de sesión</Link>
    </div> : <>
      <form onSubmit={handleSubmit(submit)} className="space-y-3" noValidate>
        {serverError && <Feedback>{serverError}</Feedback>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nombre completo" required error={errors.full_name?.message}>
            <Input id="register-name" autoComplete="name" placeholder="Nombre completo" {...field('full_name')} />
          </Field>
          <Field label="Teléfono" hint="Opcional" error={errors.phone?.message}>
            <Input id="register-phone" type="tel" autoComplete="tel" placeholder="987654321" {...field('phone')} />
          </Field>
        </div>
        <Field label="Correo electrónico" required error={errors.email?.message}>
          <Input id="register-email" type="email" autoComplete="email" placeholder="correo@ejemplo.com" {...field('email')} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Contraseña"
            required
            tooltip="Mínimo 8 caracteres, con mayúscula, minúscula y número."
            error={errors.password?.message}
          >
            <Input id="register-password" type="password" autoComplete="new-password" placeholder="••••••••" {...field('password')} />
          </Field>
          <Field label="Confirmar contraseña" required error={errors.confirmPassword?.message}>
            <Input id="confirm-password" type="password" autoComplete="new-password" placeholder="••••••••" {...field('confirmPassword')} />
          </Field>
        </div>
        <div className="pt-1">
          <Button type="submit" full size="lg" loading={isSubmitting} icon={Icon.check}>
            {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </Button>
        </div>
      </form>
      <div className="mt-6 border-t border-[#eef2f3] pt-5 text-center text-[14px] text-muted space-y-3">
        <p>¿Ya tienes cuenta? <Link className="font-semibold text-turq-dark hover:underline" to="/login">Volver al login</Link></p>
        <div>
          <Link className="inline-flex min-h-11 items-center gap-1.5 text-[13.5px] text-muted hover:text-ink transition-colors" to="/">
            <Icon.arrowL size={14} /> Volver al sitio público
          </Link>
        </div>
      </div>
    </>}
  </AuthShell>
}

export function RecoverPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { register: field, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordRequest>({ resolver: zodResolver(forgotPasswordSchema) })
  const submit = async (data: ForgotPasswordRequest) => {
    setServerError(null)
    try { await forgotPassword(data); setSuccess(true) } catch (error: unknown) { setServerError(errorMessage(error, 'No fue posible solicitar la recuperación.')) }
  }

  return <AuthShell side="client" title="Recuperar contraseña" subtitle="Solicita un enlace para definir una contraseña nueva.">
    <div className="space-y-4">
      {serverError && <Feedback>{serverError}</Feedback>}
      {success ? <Feedback kind="success">Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.</Feedback> : <form onSubmit={handleSubmit(submit)} className="space-y-4" aria-label="Recuperación de contraseña" noValidate>
        <Field label="Correo electrónico" required error={errors.email?.message}><Input type="email" autoComplete="email" placeholder="correo@ejemplo.com" {...field('email')} /></Field>
        <Button type="submit" full size="lg" icon={Icon.send} loading={isSubmitting}>{isSubmitting ? 'Enviando enlace…' : 'Enviar enlace'}</Button>
      </form>}
      <div className="pt-2 text-center text-[14px] text-muted space-y-3">
        <Link to="/login" className="inline-flex min-h-11 items-center justify-center gap-1.5 text-[13.5px] text-muted hover:text-ink"><Icon.arrowL size={14} /> Volver al inicio de sesión</Link>
        <div>
          <Link className="inline-flex min-h-11 items-center gap-1.5 text-[13.5px] text-muted hover:text-ink transition-colors" to="/">
            <Icon.arrowL size={14} /> Volver al sitio público
          </Link>
        </div>
      </div>
    </div>
  </AuthShell>
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { register: field, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordRequest & { confirmPassword: string }>({ resolver: zodResolver(passwordConfirmationSchema) })
  const submit = async (data: ResetPasswordRequest & { confirmPassword: string }) => {
    setServerError(null)
    try { await resetPassword({ token: token || undefined, new_password: data.new_password }); setSuccess(true) } catch (error: unknown) { setServerError(errorMessage(error, 'No fue posible restablecer la contraseña.')) }
  }

  return <AuthShell side="client" title="Restablecer contraseña" subtitle="Define una contraseña nueva para tu cuenta.">
    <div className="space-y-4">
      {!token && <Feedback>El enlace de recuperación no contiene un token válido. Solicita uno nuevo.</Feedback>}
      {serverError && <Feedback>{serverError}</Feedback>}
      {success ? <Feedback kind="success">Contraseña actualizada. Ya puedes iniciar sesión.</Feedback> : <form onSubmit={handleSubmit(submit)} className="space-y-4" aria-label="Restablecimiento de contraseña" noValidate>
        <Field label="Nueva contraseña" required tooltip="Mínimo 8 caracteres, con mayúscula, minúscula y número." error={errors.new_password?.message}><Input id="reset-new-password" type="password" autoComplete="new-password" {...field('new_password')} /></Field>
        <Field label="Confirmar contraseña" required error={errors.confirmPassword?.message}><Input id="reset-confirm-password" type="password" autoComplete="new-password" {...field('confirmPassword')} /></Field>
        <Button type="submit" full size="lg" icon={Icon.lock} loading={isSubmitting} disabled={!token}>{isSubmitting ? 'Guardando…' : 'Guardar contraseña'}</Button>
      </form>}
      <div className="pt-2 text-center text-[14px] text-muted"><Link to="/login" className="inline-flex min-h-11 items-center justify-center gap-1.5 text-[13.5px] hover:text-ink"><Icon.arrowL size={14} /> Volver al inicio de sesión</Link></div>
    </div>
  </AuthShell>
}

export function ChangePasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { register: field, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ChangePasswordRequest & { confirmPassword: string }>({ resolver: zodResolver(changePasswordSchema) })
  const submit = async (data: ChangePasswordRequest & { confirmPassword: string }) => {
    setServerError(null)
    try { await changePassword({ current_password: data.current_password, new_password: data.new_password }); setSuccess(true); reset() } catch (error: unknown) { setServerError(errorMessage(error, 'No fue posible cambiar la contraseña.')) }
  }

  return <div className="space-y-4">
    {serverError && <Feedback>{serverError}</Feedback>}
    {success && <Feedback kind="success">Contraseña actualizada correctamente.</Feedback>}
    <form onSubmit={handleSubmit(submit)} className="space-y-4" aria-label="Cambio de contraseña" noValidate>
      <Field label="Contraseña actual" required error={errors.current_password?.message}><Input type="password" autoComplete="current-password" {...field('current_password')} /></Field>
      <Field label="Nueva contraseña" required tooltip="Mínimo 8 caracteres, con mayúscula, minúscula y número." error={errors.new_password?.message}><Input type="password" autoComplete="new-password" {...field('new_password')} /></Field>
      <Field label="Confirmar nueva contraseña" required error={errors.confirmPassword?.message}><Input type="password" autoComplete="new-password" {...field('confirmPassword')} /></Field>
      <Button type="submit" full loading={isSubmitting} icon={Icon.lock}>{isSubmitting ? 'Cambiando…' : 'Cambiar contraseña'}</Button>
    </form>
  </div>
}

export function VerifyEmailForm({ token }: { token: string }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submit = async () => {
    setServerError(null); setIsSubmitting(true)
    try { await verifyEmail({ token: token || undefined }); setSuccess(true) } catch (error: unknown) { setServerError(errorMessage(error, 'No fue posible verificar el correo.')) } finally { setIsSubmitting(false) }
  }

  return <div className="space-y-4">
    {!token && <Feedback kind="info">Abre el enlace enviado a tu correo para verificarlo.</Feedback>}
    {serverError && <Feedback>{serverError}</Feedback>}
    {success && <Feedback kind="success">Correo verificado correctamente.</Feedback>}
    {!success && token && <Button type="button" full loading={isSubmitting} icon={Icon.mail} onClick={() => { void submit() }}>Verificar correo</Button>}
  </div>
}
