import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { ACADEMIC_DISCLAIMER } from '../../components/layout/academic-disclaimer'
import { ApiError } from '../../lib/api-client'
import type { LoginRequest, RegisterRequest, Role, Session } from '../../types/auth'
import { useAuth } from './auth-provider'
import { register } from './auth-service'

const passwordRule = z.string().min(8, 'La contraseña debe cumplir las reglas.').max(128, 'La contraseña debe cumplir las reglas.').regex(/[A-Z]/, 'La contraseña debe cumplir las reglas.').regex(/[a-z]/, 'La contraseña debe cumplir las reglas.').regex(/[0-9]/, 'La contraseña debe cumplir las reglas.')
const loginSchema = z.object({ email: z.string().trim().email('Ingresa un correo válido.'), password: z.string().min(1, 'La contraseña es obligatoria.') })
const registerSchema = z.object({ full_name: z.string().trim().min(1, 'El nombre completo es obligatorio.'), email: z.string().trim().email('Ingresa un correo válido.'), phone: z.string().optional(), password: passwordRule, confirmPassword: z.string().min(1, 'Confirma tu contraseña.') }).refine((data) => data.password === data.confirmPassword, { path: ['confirmPassword'], message: 'Las contraseñas no coinciden.' })
const errorMessage = (error: unknown, conflict: string): string => error instanceof ApiError && error.status === 409 ? conflict : error instanceof ApiError && error.status === 422 ? 'Revisa los datos ingresados.' : 'No fue posible completar la solicitud. Inténtalo nuevamente.'
type LoginPortal = 'client' | 'staff'

function destinationFor(role: Role): string { if (role === 'CLIENTE') return '/cliente'; if (role === 'ASESOR') return '/personal/tickets'; return '/personal' }
function acceptsRole(portal: LoginPortal, role: Role): boolean { return portal === 'client' ? role === 'CLIENTE' : role === 'ASESOR' || role === 'SUPERVISOR' }

function PortalMismatch({ portal }: { portal: LoginPortal }) {
  return portal === 'client'
    ? <div className="form-error" role="alert"><strong>Esta cuenta pertenece al acceso interno.</strong><span>Utiliza el portal reservado para asesores y supervisores.</span><Link to="/personal/login">Ir al acceso para personal</Link></div>
    : <div className="form-error" role="alert"><strong>Debes utilizar el portal de clientes.</strong><span>Este acceso es exclusivo para personal autorizado del prototipo.</span><Link to="/login">Ir al acceso de clientes</Link></div>
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
  return <section className="auth-card card">
    <div className="auth-kicker">{isStaff ? 'Portal interno' : 'Portal de clientes'}</div><h1>{isStaff ? 'Acceso para personal' : 'Bienvenido'}</h1>
    <p>{isStaff ? 'Exclusivo para asesores y supervisores autorizados del prototipo.' : 'Ingresa para consultar y dar seguimiento a tus solicitudes demo.'}</p>
    <div className="auth-safety-note"><strong>Entorno de demostración</strong><span>{ACADEMIC_DISCLAIMER}</span><span>No ingreses claves ni datos de banca real.</span></div>
    {mismatchedPortal && <PortalMismatch portal={portal} />}{serverError && <div className="form-error" role="alert">{serverError}</div>}
    <form onSubmit={handleSubmit(submit)} noValidate>
      <label htmlFor={emailId}>Correo electrónico</label><input id={emailId} type="email" autoComplete="email" placeholder="cuenta.demo@ejemplo.com" aria-invalid={Boolean(errors.email)} {...field('email')} />{errors.email && <span className="field-error">{errors.email.message}</span>}
      <label htmlFor={passwordId}>Contraseña</label><input id={passwordId} type="password" autoComplete="current-password" aria-invalid={Boolean(errors.password)} {...field('password')} />{errors.password && <span className="field-error">{errors.password.message}</span>}
      <button className="button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Validando…' : isStaff ? 'Ingresar al portal interno' : 'Iniciar sesión'}</button>
    </form>
    <p className="helper">{isStaff ? <Link to="/">Volver al sitio público</Link> : <>¿Aún no tienes cuenta demo? <Link to="/registro">Registrarse</Link></>}</p>
  </section>
}

export function ClientLoginForm() { return <LoginForm portal="client" /> }
export function StaffLoginForm() { return <LoginForm portal="staff" /> }

export function RegisterForm() {
  const navigate = useNavigate(); const [serverError, setServerError] = useState<string | null>(null); const [success, setSuccess] = useState(false)
  const { register: field, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterRequest & { confirmPassword: string }>({ resolver: zodResolver(registerSchema) })
  const submit = async (data: RegisterRequest & { confirmPassword: string }) => {
    setServerError(null)
    try { const payload: RegisterRequest = { full_name: data.full_name, email: data.email, phone: data.phone, password: data.password }; await register(payload); setSuccess(true); setTimeout(() => navigate('/login'), 700) }
    catch (error: unknown) { setServerError(errorMessage(error, 'Ese correo ya está registrado.')) }
  }
  return <section className="auth-card card">
    <div className="auth-kicker">Registro de clientes</div><h1>Crea tu cuenta demo</h1><p>Registra datos ficticios para explorar el prototipo académico.</p>
    <div className="auth-safety-note"><strong>Antes de continuar</strong><span>{ACADEMIC_DISCLAIMER}</span><span>No uses información personal o bancaria real.</span></div>
    {success && <div className="form-success" role="status">Cuenta creada. Redirigiendo al acceso de clientes…</div>}{serverError && <div className="form-error" role="alert">{serverError}</div>}
    <form onSubmit={handleSubmit(submit)} noValidate>
      <label htmlFor="register-name">Nombre completo</label><input id="register-name" autoComplete="name" placeholder="Nombre de demostración" aria-invalid={Boolean(errors.full_name)} {...field('full_name')} />{errors.full_name && <span className="field-error">{errors.full_name.message}</span>}
      <label htmlFor="register-email">Correo electrónico</label><input id="register-email" type="email" autoComplete="email" placeholder="cuenta.demo@ejemplo.com" aria-invalid={Boolean(errors.email)} {...field('email')} />{errors.email && <span className="field-error">{errors.email.message}</span>}
      <label htmlFor="register-phone">Teléfono <span className="optional">(opcional y ficticio)</span></label><input id="register-phone" type="tel" autoComplete="tel" placeholder="999 999 999" {...field('phone')} />
      <label htmlFor="register-password">Contraseña</label><input id="register-password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} {...field('password')} /><ul className="password-rules"><li>Mínimo 8 caracteres y máximo 128</li><li>Al menos una mayúscula, una minúscula y un número</li></ul>{errors.password && <span className="field-error">{errors.password.message}</span>}
      <label htmlFor="confirm-password">Confirmar contraseña</label><input id="confirm-password" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} {...field('confirmPassword')} />{errors.confirmPassword && <span className="field-error">{errors.confirmPassword.message}</span>}
      <button className="button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creando cuenta…' : 'Crear cuenta demo'}</button>
    </form><p className="helper"><Link to="/login">Volver al acceso de clientes</Link></p>
  </section>
}
