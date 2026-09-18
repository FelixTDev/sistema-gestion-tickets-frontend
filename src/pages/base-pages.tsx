import { Link, useParams } from 'react-router-dom'
import { Card } from '../components/ui/card'
import { Icon, type IconComponent } from '../components/ui/icons'
import { EmptyState, ErrorState } from '../components/ui/states'
import { Skeleton } from '../components/ui/skeleton'
import { ClientLoginForm, RecoverPasswordForm, RegisterForm, StaffLoginForm } from '../features/auth/auth-forms'
import { useCategories, useFaqs } from '../features/faqs/hooks/use-faqs'

const actionLink = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-turq-dark px-6 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#055b62]'
const secondaryActionLink = 'inline-flex min-h-12 items-center justify-center rounded-[10px] border border-[#cdd9de] bg-white px-6 text-[15px] font-semibold text-ink-800 transition-colors hover:border-turq-dark hover:text-turq-dark'

function HelpCard({ icon: HelpIcon, title, children, to }: { icon: IconComponent; title: string; children: string; to: string }) {
  return <Link to={to} className="group text-left">
    <Card className="h-full transition-all group-hover:-translate-y-1 group-hover:border-turq/40">
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-[12px] bg-[#eef4f5] text-turq-dark transition-colors group-hover:bg-turq-dark group-hover:text-white"><HelpIcon size={23} /></span>
      <h3 className="mb-1.5 text-[16px] font-bold text-ink">{title}</h3>
      <p className="text-[13.5px] leading-relaxed text-muted">{children}</p>
    </Card>
  </Link>
}

function LandingKnowledge() {
  const categoriesQuery = useCategories()
  const faqsQuery = useFaqs()
  const categories = (categoriesQuery.data ?? []).filter((category) => category.is_active)
  const faqs = (faqsQuery.data ?? []).filter((faq) => faq.is_active).slice(0, 3)

  return <>
    <section id="canales" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="mb-3 text-[30px] font-extrabold text-ink">Categorías frecuentes</h2>
      <p className="mb-8 text-[15px] text-muted">Explora los temas de consulta publicados.</p>
      {categoriesQuery.isLoading && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Cargando categorías">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-[68px]" />)}</div>}
      {categoriesQuery.isError && <Card><ErrorState title="No pudimos cargar las categorías" onRetry={() => { void categoriesQuery.refetch() }} /></Card>}
      {!categoriesQuery.isLoading && !categoriesQuery.isError && categories.length === 0 && <Card><EmptyState icon={Icon.tag} title="Aún no hay categorías disponibles" desc="Cuando se publiquen temas de consulta, aparecerán aquí." /></Card>}
      {!categoriesQuery.isLoading && !categoriesQuery.isError && categories.length > 0 && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => <Link key={category.id} to="/faq" className="flex min-h-[68px] items-center justify-between gap-3 rounded-[12px] border border-[#e6edef] bg-white px-4 py-3.5 text-left transition-all hover:border-turq-dark hover:shadow-sm">
          <span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-[9px] bg-[#eef4f5] text-turq-dark"><Icon.tag size={17} /></span><span className="text-[14px] font-semibold text-ink">{category.name}</span></span>
          <Icon.chevronR size={17} className="shrink-0 text-[#798c96]" />
        </Link>)}
      </div>}
    </section>
    <section className="border-y border-[#e6edef] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-[30px] font-extrabold text-ink">Preguntas frecuentes</h2><p className="mt-2 text-[15px] text-muted">Consulta respuestas publicadas en nuestra base de conocimiento.</p></div><Link className="font-semibold text-turq-dark hover:underline" to="/faq">Ver todas las preguntas</Link></div>
        {faqsQuery.isLoading && <div className="grid gap-4 md:grid-cols-3" role="status" aria-label="Cargando preguntas">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-36" />)}</div>}
        {faqsQuery.isError && <Card><ErrorState title="No pudimos cargar las preguntas" onRetry={() => { void faqsQuery.refetch() }} /></Card>}
        {!faqsQuery.isLoading && !faqsQuery.isError && faqs.length === 0 && <Card><EmptyState icon={Icon.book} title="Aún no hay preguntas disponibles" desc="Cuando se publiquen respuestas, aparecerán aquí." /></Card>}
        {!faqsQuery.isLoading && !faqsQuery.isError && faqs.length > 0 && <div className="grid gap-4 md:grid-cols-3">{faqs.map((faq) => <Card key={faq.id}><h3 className="mb-2 text-[15px] font-bold text-ink">{faq.question}</h3><p className="line-clamp-3 text-[13.5px] leading-relaxed text-muted">{faq.answer}</p></Card>)}</div>}
      </div>
    </section>
  </>
}

export function HomePage() {
  return <>
    <section className="relative overflow-hidden bg-[#06243a] text-white">
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '22px 22px' }} />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="gnb-fade">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[12.5px] font-medium text-[#cfe0e6]"><span className="h-2 w-2 rounded-full bg-green" /> Centro de Atención Digital</span>
          <h1 className="text-[40px] font-extrabold leading-[1.02] tracking-tight text-white sm:text-[54px]">Estamos para <span className="text-green">ayudarte</span></h1>
          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-[#c6d7de]">Resuelve tus consultas, encuentra respuestas y realiza seguimiento a tus solicitudes desde un solo lugar, de forma clara y segura.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link className={actionLink} to="/chat"><Icon.chat size={18} /> Consultar ahora</Link><Link className={`${secondaryActionLink} !border-white/25 !bg-white/10 !text-white hover:!bg-white/15`} to="/faq">Ver preguntas frecuentes</Link></div>
        </div>
        <div className="gnb-fade">
          <div className="mx-auto max-w-sm rounded-[20px] bg-white p-5 text-ink shadow-2xl">
            <div className="flex items-center gap-2.5 border-b border-[#eef2f3] pb-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#06243a] text-white"><Icon.bot size={18} /></span><div><p className="text-[14px] font-bold">Asistente GNB</p><p className="flex items-center gap-1 text-[11.5px] font-medium text-turq-dark"><span className="h-1.5 w-1.5 rounded-full bg-green" /> En línea</p></div></div>
            <div className="space-y-3 py-5"><Skeleton className="h-12 w-[85%] rounded-2xl rounded-tl-md" /><Skeleton className="ml-auto h-10 w-[72%] rounded-2xl rounded-tr-md" /><Skeleton className="h-14 w-[85%] rounded-2xl rounded-tl-md" /></div>
            <div className="flex gap-2"><div className="flex h-10 flex-1 items-center rounded-full border border-[#dbe4e7] px-3.5 text-[13px] text-[#798c96]">Escribe tu consulta…</div><span className="grid h-10 w-10 place-items-center rounded-full bg-turq-dark text-white"><Icon.send size={17} /></span></div>
          </div>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-9 max-w-xl"><h2 className="text-[30px] font-extrabold text-ink">¿Cómo podemos ayudarte?</h2><p className="mt-2 text-[15px] text-muted">Elige el camino que mejor se ajuste a lo que necesitas.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <HelpCard icon={Icon.search} title="Consultar información" to="/faq">Encuentra respuestas publicadas en la base de conocimiento.</HelpCard>
        <HelpCard icon={Icon.bot} title="Hablar con el asistente" to="/chat">Resuelve consultas frecuentes de forma inmediata.</HelpCard>
        <HelpCard icon={Icon.plus} title="Registrar una solicitud" to="/login">Crea un ticket para dar seguimiento a tu consulta.</HelpCard>
        <HelpCard icon={Icon.ticket} title="Dar seguimiento a un ticket" to="/login">Consulta el estado y el historial de tus solicitudes.</HelpCard>
      </div>
    </section>
    <section className="border-y border-[#e6edef] bg-white"><div className="mx-auto max-w-6xl px-4 py-16 sm:px-6"><h2 className="mb-3 text-center text-[30px] font-extrabold text-ink">Atención en tres pasos</h2><p className="mb-11 text-center text-[15px] text-muted">Un proceso simple y transparente de principio a fin.</p><ol className="grid gap-6 md:grid-cols-3"><li><span className="font-display text-[42px] font-extrabold text-[#dbe9ec]">01</span><h3 className="mb-2 mt-1 text-[18px] font-bold text-ink">Cuéntanos tu consulta</h3><p className="text-[14px] leading-relaxed text-muted">Usa el asistente o registra una solicitud describiendo tu caso.</p></li><li><span className="font-display text-[42px] font-extrabold text-[#dbe9ec]">02</span><h3 className="mb-2 mt-1 text-[18px] font-bold text-ink">Recibe un código</h3><p className="text-[14px] leading-relaxed text-muted">Cada solicitud recibe un código de seguimiento.</p></li><li><span className="font-display text-[42px] font-extrabold text-[#dbe9ec]">03</span><h3 className="mb-2 mt-1 text-[18px] font-bold text-ink">Sigue el avance</h3><p className="text-[14px] leading-relaxed text-muted">Consulta el estado, comenta y recibe la resolución.</p></li></ol></div></section>
    <LandingKnowledge />
    <section className="bg-[#0b4963] text-white"><div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3"><div className="flex gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-[12px] bg-white/10 text-green"><Icon.clock size={23} /></span><div><h3 className="mb-1.5 text-[17px] font-bold text-white">Respuestas más rápidas</h3><p className="text-[14px] leading-relaxed text-[#c6d7de]">El asistente atiende consultas frecuentes al instante.</p></div></div><div className="flex gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-[12px] bg-white/10 text-green"><Icon.ticket size={23} /></span><div><h3 className="mb-1.5 text-[17px] font-bold text-white">Seguimiento transparente</h3><p className="text-[14px] leading-relaxed text-[#c6d7de]">Cada solicitud tiene un código y un historial claro.</p></div></div><div className="flex gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-[12px] bg-white/10 text-green"><Icon.shield size={23} /></span><div><h3 className="mb-1.5 text-[17px] font-bold text-white">Atención confiable</h3><p className="text-[14px] leading-relaxed text-[#c6d7de]">Un equipo dedicado gestiona y resuelve tus casos.</p></div></div></div></section>
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6"><Card className="bg-gradient-to-br from-white to-[#eef6f7] !p-10 text-center"><h2 className="text-[26px] font-extrabold text-ink">¿Listo para resolver tu consulta?</h2><p className="mx-auto mb-6 mt-2 max-w-md text-[15px] text-muted">Ingresa con tu cuenta y empieza a gestionar tus solicitudes.</p><div className="flex flex-wrap justify-center gap-3"><Link className={actionLink} to="/login"><Icon.lock size={18} /> Ingresar como cliente</Link><Link className={secondaryActionLink} to="/faq">Ver preguntas frecuentes</Link></div></Card></section>
  </>
}

export function LoginPage() { return <ClientLoginForm /> }
export function StaffLoginPage() { return <StaffLoginForm /> }
export function RegisterPage() { return <RegisterForm /> }
export function RecoverPage() { return <RecoverPasswordForm /> }

export function PanelHomePage() { return <section><div className="eyebrow">Operaciones</div><h1>Panel interno</h1><p className="lead">Vista base para asesores y supervisores.</p></section> }
export function PanelTicketsPage() { return <section><div className="eyebrow">Operaciones</div><h1>Bandeja de tickets</h1><EmptyState title="Bandeja vacía" message="Los tickets disponibles aparecerán aquí." /></section> }
export function PanelTicketDetailPage() { const { ticketId } = useParams(); return <section><Link className="back-link" to="/personal/tickets">← Volver a la bandeja</Link><div className="eyebrow">Gestión interna</div><h1>Ticket {ticketId}</h1><EmptyState title="Detalle no disponible" message="No se encontró información para mostrar." /></section> }
export function KnowledgePage() { return <section><div className="eyebrow">Administración</div><h1>Base de conocimiento</h1><EmptyState title="Sin artículos cargados" message="El contenido disponible aparecerá aquí." /></section> }
export function NotFoundPage() { return <section className="mx-auto max-w-3xl px-4 py-20 text-center"><div className="mb-2 text-[12px] font-bold uppercase tracking-wider text-turq-dark">Error 404</div><h1 className="text-[34px] font-extrabold text-ink">Página no encontrada</h1><p className="mb-6 mt-3 text-muted">La dirección que buscas no existe.</p><Link className={actionLink} to="/">Volver al inicio</Link></section> }
