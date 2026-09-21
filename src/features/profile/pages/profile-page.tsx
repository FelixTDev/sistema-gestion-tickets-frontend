import { useSearchParams } from 'react-router-dom'
import { Card } from '../../../components/ui/card'
import { EmptyState, ErrorState, LoadingState } from '../../../components/ui/states'
import { ChangePasswordForm, VerifyEmailForm } from '../../auth/auth-forms'
import { PreferencesForm } from '../components/preferences-form'
import { ProfileForm } from '../components/profile-form'
import { usePreferences, useProfile } from '../hooks/use-profile'

export function ProfilePage({ isStaff = false }: { isStaff?: boolean }) {
  const profile = useProfile()
  const preferences = usePreferences()
  const [searchParams] = useSearchParams()
  const verificationToken = searchParams.get('token') ?? ''

  return <section className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6" aria-busy={profile.isLoading || preferences.isLoading}>
    <div><span className="text-[12px] font-bold uppercase tracking-wider text-turq-dark">{isStaff ? 'Portal interno' : 'Portal del cliente'}</span><h1 className="mt-1 text-[26px] font-extrabold text-ink">Perfil y preferencias</h1><p className="mt-1 text-[14.5px] text-muted">Administra tus datos y la forma en que recibes avisos.</p></div>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card><h2 className="mb-4 text-[18px] font-bold text-ink">Datos personales</h2>{profile.isLoading && <LoadingState message="Cargando tu perfil…" />}{profile.isError && <ErrorState title="No pudimos cargar tu perfil" onRetry={() => { void profile.refetch() }} />}{!profile.isLoading && !profile.isError && !profile.data && <EmptyState title="Perfil no disponible" desc="No encontramos los datos de tu perfil." />}{profile.data && <ProfileForm profile={profile.data} />}</Card>
      <Card><h2 className="mb-4 text-[18px] font-bold text-ink">Preferencias</h2>{preferences.isLoading && <LoadingState message="Cargando tus preferencias…" />}{preferences.isError && <ErrorState title="No pudimos cargar tus preferencias" onRetry={() => { void preferences.refetch() }} />}{!preferences.isLoading && !preferences.isError && !preferences.data && <EmptyState title="Preferencias no disponibles" desc="No encontramos preferencias configuradas." />}{preferences.data && <PreferencesForm preferences={preferences.data} />}</Card>
      <Card><h2 className="mb-4 text-[18px] font-bold text-ink">Cambiar contraseña</h2><ChangePasswordForm /></Card>
      <Card><h2 className="mb-4 text-[18px] font-bold text-ink">Verificación de correo</h2>{profile.isLoading && <LoadingState message="Consultando el estado del correo…" />}{profile.data?.email_verified ? <p role="status" className="rounded-[10px] border border-[#b9d991] bg-[#f3f9e9] px-4 py-3 text-[13.5px] text-[#3f6512]">Tu correo electrónico ya está verificado.</p> : <VerifyEmailForm token={verificationToken} />}</Card>
    </div>
  </section>
}
