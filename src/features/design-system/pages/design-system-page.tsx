import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BankLogo } from '../../../components/brand/bank-logo'
import { Button } from '../../../components/ui/button'
import { Breadcrumbs } from '../../../components/ui/breadcrumbs'
import { Card } from '../../../components/ui/card'
import { Checkbox, Field, Input, Select, Textarea } from '../../../components/ui/form-controls'
import { Icon } from '../../../components/ui/icons'
import { Modal } from '../../../components/ui/modal'
import { Skeleton } from '../../../components/ui/skeleton'
import { Tabs } from '../../../components/ui/tabs'
import { useToast } from '../../../components/ui/toast-provider'
import { EmptyState, ErrorState } from '../../../components/ui/states'

type ColorToken = { name: string; hex: string; token: string }
type AlertTone = 'success' | 'error' | 'info' | 'warn'

const colors: ColorToken[] = [
  { name: 'Azul profundo', hex: '#06243A', token: 'ink-900' },
  { name: 'Azul secundario', hex: '#0B4963', token: 'ink-800' },
  { name: 'Turquesa acción', hex: '#078F98', token: 'turq' },
  { name: 'Verde GNB', hex: '#8BC63E', token: 'green' },
  { name: 'Texto principal', hex: '#102A43', token: 'ink' },
  { name: 'Texto secundario', hex: '#526875', token: 'muted' },
  { name: 'Fondo claro', hex: '#F4F7F8', token: 'surface' },
  { name: 'Error', hex: '#C62828', token: 'danger' },
  { name: 'Advertencia', hex: '#C47A00', token: 'warn' },
]

function Section({ id, title, desc, children }: { id: string; title: string; desc?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-[22px] font-extrabold text-ink">{title}</h2>
      {desc ? <p className="mb-5 mt-1 max-w-2xl text-[14px] text-muted">{desc}</p> : <div className="mb-5" />}
      {children}
    </section>
  )
}

function AlertMessage({ tone, title, children }: { tone: AlertTone; title: string; children: ReactNode }) {
  const details: Record<AlertTone, { icon: typeof Icon.check; classes: string }> = {
    success: { icon: Icon.check, classes: 'border-[#cce5a5] bg-[#eef8df] text-[#4c7a15]' },
    error: { icon: Icon.alert, classes: 'border-[#edcbc7] bg-[#fbe3e2] text-danger' },
    info: { icon: Icon.info, classes: 'border-[#c8dfe7] bg-[#eef4f5] text-ink-800' },
    warn: { icon: Icon.warn, classes: 'border-[#ecd6a7] bg-[#fff6e4] text-warn' },
  }
  const { icon: AlertIcon, classes } = details[tone]
  return <div role={tone === 'error' ? 'alert' : 'status'} className={`flex gap-2.5 rounded-[12px] border px-3.5 py-3 text-[13.5px] ${classes}`}><AlertIcon size={18} className="mt-0.5 shrink-0" /><p><strong className="mr-1 font-bold">{title}</strong>{children}</p></div>
}

function StatusExample({ label, tone }: { label: string; tone: 'turq' | 'green' | 'muted' | 'danger' }) {
  const classes = {
    turq: 'border-[#b6e3e5] bg-[#e5f7f7] text-turq-dark',
    green: 'border-[#cce5a5] bg-[#eef8df] text-[#4c7a15]',
    muted: 'border-[#d4e2e8] bg-[#eef4f5] text-ink-800',
    danger: 'border-[#edcbc7] bg-[#fbe3e2] text-danger',
  }
  return <span className={`inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${classes[tone]}`}>{label}</span>
}

function Timeline() {
  const events = [
    { at: '09:14', label: 'Elemento creado', by: 'Persona usuaria' },
    { at: '11:20', label: 'Asignación actualizada', by: 'Equipo de atención' },
    { at: '08:05', label: 'Estado actualizado', by: 'Persona responsable' },
  ]
  return <ol className="space-y-4">{events.map((event, index) => <li key={event.at} className="relative flex gap-3"><span className="relative z-10 mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e5f7f7] text-turq"><Icon.check size={14} /></span><div className="min-w-0"><p className="text-[13.5px] font-semibold text-ink">{event.label}</p><p className="text-[12px] text-muted">{event.at} · {event.by}</p></div>{index < events.length - 1 ? <span className="absolute bottom-[-16px] left-[13px] top-7 w-px bg-[#d9e5e8]" aria-hidden="true" /> : null}</li>)}</ol>
}

function Pagination() {
  return <nav aria-label="Paginación de ejemplo" className="flex items-center justify-between gap-3 text-[13px]"><span className="text-muted">Mostrando una página</span><div className="flex items-center gap-1"><Button size="sm" variant="secondary" disabled aria-label="Página anterior"><Icon.arrowL size={15} /></Button><span aria-current="page" className="grid h-9 min-w-9 place-items-center rounded-[9px] bg-turq px-2 font-semibold text-white">1</span><Button size="sm" variant="secondary" aria-label="Página siguiente"><Icon.chevronR size={15} /></Button></div></nav>
}

function StatExample() {
  return <Card><div className="flex items-start justify-between gap-3"><div><p className="text-[12px] font-semibold uppercase tracking-wider text-muted">Valor de referencia</p><p className="mt-1 font-display text-[28px] font-extrabold text-ink">128</p></div><span className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#e5f7f7] text-turq"><Icon.chart size={19} /></span></div></Card>
}

export function DesignSystemPage() {
  const [checked, setChecked] = useState(true)
  const [tab, setTab] = useState('summary')
  const [modalOpen, setModalOpen] = useState(false)
  const { toast } = useToast()

  return <div className="min-h-screen bg-surface">
    <header className="sticky top-0 z-30 border-b border-[#e6edef] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="Banco GNB Perú, ir al inicio"><BankLogo /></Link>
        <nav aria-label="Navegación del design system" className="flex items-center gap-1">
          <a href="#logo" className="hidden rounded-[9px] px-3 py-2 text-[14px] font-semibold text-turq hover:bg-[#eef4f5] sm:inline-flex">Componentes</a>
          <a href="#colors" className="hidden rounded-[9px] px-3 py-2 text-[14px] font-semibold text-ink hover:bg-[#eef4f5] sm:inline-flex">Tokens</a>
          <Link to="/" className="ml-1 inline-flex min-h-9 items-center justify-center rounded-[10px] border border-[#cdd9de] bg-white px-3.5 text-[13px] font-semibold text-ink-800 hover:border-turq-dark hover:text-turq-dark">Ir al sitio</Link>
        </nav>
      </div>
    </header>

    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-10"><span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-turq">Fundamentos</span><h1 className="mt-1 text-[36px] font-extrabold text-ink">Design System</h1><p className="mt-2 max-w-2xl text-[15px] text-muted">Biblioteca de componentes, estilos y patrones que mantienen una experiencia clara, consistente y accesible.</p></div>

      <div className="space-y-14">
        <Section id="logo" title="Logo" desc="Marca institucional en versiones horizontal y apilada para superficies claras y oscuras."><div className="grid gap-4 sm:grid-cols-2"><Card className="flex items-center justify-center py-10"><BankLogo /></Card><Card className="flex items-center justify-center bg-[#06243a] py-10"><BankLogo surface="dark" /></Card><Card className="flex items-center justify-center gap-4 py-8"><BankLogo variant="stacked" /><span className="text-[13px] text-muted">Versión apilada para espacios compactos</span></Card><Card className="flex items-center justify-center gap-4 bg-[#06243a] py-8"><BankLogo variant="stacked" surface="dark" /><span className="text-[13px] text-[#9ec7d6]">Sobre fondo oscuro</span></Card></div></Section>

        <Section id="colors" title="Colores y variables" desc="Paleta institucional expuesta como variables de tema."><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{colors.map((color) => <Card key={color.token} className="!p-0 overflow-hidden"><div className="h-20" style={{ background: color.hex }} /><div className="p-3"><p className="text-[13px] font-semibold text-ink">{color.name}</p><p className="font-mono text-[12px] text-muted">{color.hex}</p><p className="mt-0.5 font-mono text-[11px] text-turq">--color-{color.token}</p></div></Card>)}</div></Section>

        <Section id="type" title="Tipografía" desc="Manrope para títulos, Inter para cuerpo y JetBrains Mono para datos."><Card className="space-y-5"><div className="flex flex-wrap items-baseline gap-4 border-b border-[#eef2f3] pb-4"><span className="w-28 shrink-0 text-[12px] text-muted">Display / H1</span><span className="font-display text-[40px] font-extrabold text-ink">Texto de muestra</span></div><div className="flex flex-wrap items-baseline gap-4 border-b border-[#eef2f3] pb-4"><span className="w-28 shrink-0 text-[12px] text-muted">Título / H2</span><span className="font-display text-[26px] font-bold text-ink">Jerarquía visual</span></div><div className="flex flex-wrap items-baseline gap-4 border-b border-[#eef2f3] pb-4"><span className="w-28 shrink-0 text-[12px] text-muted">Cuerpo</span><span className="max-w-lg text-[15px] text-ink">Contenido legible con una escala que facilita la lectura.</span></div><div className="flex flex-wrap items-baseline gap-4"><span className="w-28 shrink-0 text-[12px] text-muted">Mono / Datos</span><span className="font-mono text-[15px] text-ink-800">ITEM-001 · 2026-09-13</span></div></Card></Section>

        <Section id="spacing" title="Escala de espaciado" desc="Basada en múltiplos de 4px para un ritmo vertical consistente."><Card className="flex flex-wrap items-end gap-4">{[4, 8, 12, 16, 24, 32, 48].map((size) => <div key={size} className="text-center"><div className="rounded bg-turq" style={{ width: size, height: size }} /><p className="mt-2 font-mono text-[11px] text-muted">{size}px</p></div>)}</Card></Section>

        <Section id="buttons" title="Botones" desc="Variantes y estados: primario, secundario, terciario, peligro, deshabilitado y cargando."><Card className="flex flex-wrap items-center gap-3"><Button>Primario</Button><Button variant="secondary">Secundario</Button><Button variant="tertiary">Terciario</Button><Button variant="danger" icon={Icon.trash}>Peligro</Button><Button disabled>Deshabilitado</Button><Button loading>Cargando…</Button></Card></Section>

        <Section id="forms" title="Formularios" desc="Inputs, selects, textarea, checkbox y selector de fecha con estados de error."><div className="grid gap-4 sm:grid-cols-2"><Card className="space-y-4"><Field label="Input de texto" hint="Texto de ayuda opcional."><Input placeholder="Escribe aquí…" /></Field><Field label="Input con error" error="Este campo es obligatorio."><Input error placeholder="Valor inválido" /></Field><Field label="Selector de fecha"><Input type="date" /></Field></Card><Card className="space-y-4"><Field label="Select"><Select><option>Opción uno</option><option>Opción dos</option></Select></Field><Field label="Textarea"><Textarea placeholder="Escribe un mensaje…" /></Field><Checkbox label="Acepto los términos" checked={checked} onChange={setChecked} /></Card></div></Section>

        <Section id="badges" title="Badges de estado y prioridad" desc="Comunican estados y niveles de prioridad con color y texto."><div className="grid gap-4 sm:grid-cols-2"><Card><p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted">Estados</p><div className="flex flex-wrap gap-2"><StatusExample label="Disponible" tone="turq" /><StatusExample label="En curso" tone="green" /><StatusExample label="Pendiente" tone="muted" /><StatusExample label="Requiere atención" tone="danger" /></div></Card><Card><p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted">Prioridades</p><div className="flex flex-wrap gap-2"><StatusExample label="Baja" tone="muted" /><StatusExample label="Media" tone="turq" /><StatusExample label="Alta" tone="danger" /></div></Card></div></Section>

        <Section id="cards" title="Cards" desc="Contenedor base para agrupar contenido."><div className="grid gap-4 sm:grid-cols-3"><Card><h3 className="mb-1 text-[15px] font-bold text-ink">Card simple</h3><p className="text-[13.5px] text-muted">Contenedor con borde suave y sombra ligera.</p></Card><StatExample /><Card className="border-none bg-[#06243a] text-white"><h3 className="mb-1 text-[15px] font-bold text-white">Card destacada</h3><p className="text-[13.5px] text-[#c6d7de]">Variante sobre fondo oscuro.</p></Card></div></Section>

        <Section id="feedback" title="Alerts, banners y toast" desc="Mensajes de retroalimentación en distintos tonos."><div className="grid gap-3 sm:grid-cols-2"><AlertMessage tone="success" title="Operación exitosa">Los cambios se guardaron correctamente.</AlertMessage><AlertMessage tone="error" title="Ocurrió un error">No pudimos completar la acción.</AlertMessage><AlertMessage tone="info" title="Información">Consulta el detalle para continuar.</AlertMessage><AlertMessage tone="warn" title="Advertencia">Esta acción quedará registrada.</AlertMessage><div className="sm:col-span-2"><div className="flex items-start gap-2.5 rounded-[12px] border border-[#c8dfe7] bg-[#eef4f5] px-3.5 py-3 text-[13.5px] text-ink-800"><Icon.info size={18} className="mt-0.5 shrink-0" /><span>Los avisos importantes deben tener texto y un estado visible.</span></div></div></div><div className="mt-3 flex gap-2"><Button variant="secondary" onClick={() => toast('Este es un toast de ejemplo', 'success')}>Ver toast</Button></div></Section>

        <Section id="nav" title="Modal, tabs y breadcrumbs"><div className="grid gap-4 lg:grid-cols-3"><Card><p className="mb-3 text-[13px] font-semibold text-ink">Modal de confirmación</p><Button variant="danger" onClick={() => setModalOpen(true)}>Abrir modal</Button></Card><Card><p className="mb-3 text-[13px] font-semibold text-ink">Tabs</p><Tabs tabs={[{ id: 'summary', label: 'Resumen' }, { id: 'detail', label: 'Detalle' }, { id: 'history', label: 'Historial' }]} value={tab} onChange={setTab} /></Card><Card><p className="mb-3 text-[13px] font-semibold text-ink">Breadcrumbs</p><Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Sección', to: '#nav' }, { label: 'Actual' }]} /></Card></div></Section>

        <Section id="chrome" title="Navbar y sidebar" desc="Navegación pública y navegación interna institucional."><div className="grid gap-4 lg:grid-cols-2"><Card pad={false} className="overflow-hidden"><div className="flex h-14 items-center justify-between border-b bg-white px-4"><BankLogo /><div className="flex gap-2"><Button size="sm" variant="secondary">Sección</Button><Button size="sm">Ingresar</Button></div></div><p className="p-3 text-[12px] text-muted">Navbar pública</p></Card><Card pad={false} className="overflow-hidden"><div className="flex flex-col gap-1 bg-[#06243a] p-3"><div className="flex items-center gap-2 rounded-[9px] bg-turq px-3 py-2 text-[13px] font-semibold text-white"><Icon.inbox size={17} /> Bandeja</div><div className="flex items-center gap-2 rounded-[9px] px-3 py-2 text-[13px] font-semibold text-[#c6d7de]"><Icon.chart size={17} /> Resumen</div></div><p className="p-3 text-[12px] text-muted">Sidebar interna</p></Card></div></Section>

        <Section id="table" title="Tabla responsive" desc="Se muestra como tabla en escritorio y como tarjetas en móvil."><Card pad={false}><div className="overflow-x-auto"><table className="w-full text-left"><caption className="sr-only">Ejemplos neutrales de filas</caption><thead><tr className="border-b text-[12px] uppercase tracking-wider text-muted"><th className="px-4 py-3 font-semibold">Referencia</th><th className="px-4 py-3 font-semibold">Descripción</th><th className="px-4 py-3 font-semibold">Estado</th></tr></thead><tbody className="divide-y divide-[#eef2f3]"><tr><td className="px-4 py-3 font-mono text-[13px]">ITEM-001</td><td className="px-4 py-3 text-[14px]">Elemento A</td><td className="px-4 py-3"><StatusExample label="Disponible" tone="green" /></td></tr><tr><td className="px-4 py-3 font-mono text-[13px]">ITEM-002</td><td className="px-4 py-3 text-[14px]">Elemento B</td><td className="px-4 py-3"><StatusExample label="Pendiente" tone="muted" /></td></tr></tbody></table></div></Card></Section>

        <Section id="pagination" title="Paginación" desc="Control para recorrer colecciones cuando el servicio ofrece páginas."><Card><Pagination /></Card></Section>

        <Section id="timeline" title="Timeline y comentarios"><div className="grid gap-4 lg:grid-cols-2"><Card><p className="mb-4 text-[13px] font-semibold text-ink">Timeline de historial</p><Timeline /></Card><Card><p className="mb-4 text-[13px] font-semibold text-ink">Comentario</p><div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e4eff4] font-bold text-ink-800">U</span><div><p className="mb-1 text-[12px] text-muted"><span className="font-semibold text-ink">Persona usuaria</span> · Equipo</p><div className="rounded-2xl rounded-tl-md bg-[#f4f7f8] px-3.5 py-2.5 text-[13.5px]">Estamos revisando la información y te confirmaremos en breve.</div></div></div></Card></div></Section>

        <Section id="states" title="Empty, error y loading" desc="Estados para colecciones vacías, errores de carga y esqueletos."><div className="grid gap-4 lg:grid-cols-3"><Card pad={false}><EmptyState title="Sin resultados" desc="No hay elementos para mostrar." /></Card><Card pad={false}><ErrorState /></Card><Card><p className="mb-3 text-[12px] text-muted">Loading skeleton</p><Skeleton className="mb-3 h-11 w-11" /><Skeleton className="mb-2 h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></Card></div></Section>

        <Section id="chatbot" title="Chatbot widget" desc="El asistente flotante aparece en el sitio público y el portal del cliente. Nunca en pantallas internas."><Card className="flex flex-wrap items-center gap-6"><span className="grid h-[60px] w-[60px] place-items-center rounded-full bg-[#06243a] text-white"><Icon.chat size={26} /></span><div className="max-w-md"><p className="mb-1 text-[14px] font-semibold text-ink">Asistente GNB</p><p className="text-[13.5px] text-muted">Widget con estados inicial, escribiendo, respuesta, ausencia de resultados y error de conexión.</p></div></Card></Section>
      </div>
    </main>

    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="¿Confirmar acción?" danger footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button variant="danger" onClick={() => setModalOpen(false)}>Confirmar</Button></>}>Este es un modal de confirmación para una acción.</Modal>
  </div>
}
