import { Link } from 'react-router-dom'
import { Card } from '../components/ui/card'
import { Icon } from '../components/ui/icons'
import nosotrosHeroImg from '../assets/brand/nosotros-hero.jpg'
import nosotrosVisionImg from '../assets/brand/nosotros-vision.jpg'

export function AboutPage() {
  return (
    <div className="bg-[#f4f7f8] pb-16">
      {/* Hero Principal */}
      <section className="relative overflow-hidden bg-[#06243a] text-white">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-turq/20 blur-3xl" />
        
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2">
          <div className="gnb-fade">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[13px] font-semibold text-[#cfe0e6] shadow-sm">
              <Icon.shield size={15} className="text-green" /> Institucional · Banco GNB Perú
            </span>
            <h1 className="text-[36px] font-extrabold leading-[1.1] tracking-tight text-white sm:text-[48px]">
              Sobre <span className="text-green">Nosotros</span>
            </h1>
            <p className="mt-4 max-w-xl text-[16.5px] leading-relaxed text-[#c6d7de]">
              Conoce la visión, misión y pilares estratégicos de nuestro Centro Inteligente de Atención Digital y Gestión de Tickets, diseñado para brindarte soporte oportuno, transparencia e innovación constante.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/faq"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-turq-dark px-6 text-[14.5px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-[#055b62]"
              >
                <Icon.book size={18} /> Explorar Preguntas Frecuentes
              </Link>
              <Link
                to="/chat"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-white/25 bg-white/10 px-6 text-[14.5px] font-semibold text-white backdrop-blur-xs transition-transform hover:-translate-y-0.5 hover:bg-white/15"
              >
                <Icon.bot size={18} /> Asistente Virtual
              </Link>
            </div>
          </div>

          <div className="gnb-fade relative">
            <div className="relative overflow-hidden rounded-[20px] border border-white/15 bg-white/5 p-2 shadow-2xl backdrop-blur-sm transition-transform hover:scale-[1.01]">
              <img
                src={nosotrosHeroImg}
                alt="Centro de atención digital de Banco GNB Perú"
                className="h-auto w-full rounded-[16px] object-cover shadow-inner"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-12 text-center">
          <span className="mb-2 inline-block text-[12.5px] font-extrabold uppercase tracking-wider text-turq-dark">
            Nuestra Identidad Institucional
          </span>
          <h2 className="text-[30px] font-extrabold text-ink sm:text-[36px]">Misión y Visión</h2>
          <p className="mx-auto mt-2 max-w-xl text-[15.5px] text-muted">
            Los fundamentos que guían cada desarrollo, respuesta y atención en nuestra plataforma.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Card Misión */}
          <Card className="gnb-fade relative overflow-hidden p-8 transition-all duration-300 hover:-translate-y-1 hover:border-turq/40 hover:shadow-lg">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#eef4f5] text-turq-dark">
              <Icon.target size={28} />
            </div>
            <h3 className="mb-3 text-[22px] font-extrabold text-ink">Nuestra Misión</h3>
            <p className="text-[15px] leading-relaxed text-muted">
              Brindar a nuestros usuarios un canal digital inteligente, eficiente y accesible para resolver consultas, registrar requerimientos y dar seguimiento transparente a sus solicitudes, respaldado por un equipo humano de excelencia operacional y tecnología avanzada.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[13px] font-bold text-turq-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-green" /> Eficiencia · Transparencia · Cercanía
            </div>
          </Card>

          {/* Card Visión */}
          <Card className="gnb-fade relative overflow-hidden p-8 transition-all duration-300 hover:-translate-y-1 hover:border-turq/40 hover:shadow-lg">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#eef4f5] text-turq-dark">
              <Icon.compass size={28} />
            </div>
            <h3 className="mb-3 text-[22px] font-extrabold text-ink">Nuestra Visión</h3>
            <p className="text-[15px] leading-relaxed text-muted">
              Consolidar el Centro de Atención Digital de Banco GNB Perú como un referente de innovación bancaria, donde la tecnología de vanguardia y la empatía humana se unan para ofrecer una experiencia superior e integral en cada interacción con nuestros clientes.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[13px] font-bold text-turq-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-green" /> Innovación · Liderazgo · Confianza
            </div>
          </Card>
        </div>

        {/* Banner Ilustrativo de Innovación */}
        <div className="gnb-fade mt-10 overflow-hidden rounded-[20px] border border-[#e6edef] bg-white p-4 shadow-sm sm:p-6">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_1.2fr]">
            <div className="p-4">
              <span className="mb-2 block text-[12px] font-bold uppercase tracking-wider text-turq-dark">
                Tecnología al Servicio del Cliente
              </span>
              <h3 className="text-[24px] font-extrabold text-ink">Innovación Bancaria Sobria</h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
                Integraciones inteligentes, automatización responsable de consultas e infraestructura segura orientada a ofrecer resultados claros en todo momento.
              </p>
            </div>
            <div className="overflow-hidden rounded-[14px]">
              <img
                src={nosotrosVisionImg}
                alt="Innovación y tecnología financiera en Banco GNB"
                className="h-64 w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Objetivos Estratégicos */}
      <section className="border-y border-[#e6edef] bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <span className="mb-2 inline-block text-[12.5px] font-extrabold uppercase tracking-wider text-turq-dark">
              Pilares de Operación
            </span>
            <h2 className="text-[30px] font-extrabold text-ink sm:text-[36px]">Objetivos Estratégicos</h2>
            <p className="mx-auto mt-2 max-w-lg text-[15.5px] text-muted">
              Las metras clave que rigen la atención continua de nuestra plataforma.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="gnb-fade group rounded-[16px] border border-[#e6edef] bg-[#fafcfc] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-turq-dark hover:bg-white hover:shadow-md">
              <span className="font-display text-[38px] font-extrabold text-[#d2e2e6] transition-colors group-hover:text-turq-dark">
                01
              </span>
              <h3 className="mb-2 mt-1 text-[17px] font-bold text-ink">Resolución Ágil</h3>
              <p className="text-[14px] leading-relaxed text-muted">
                Reducir los tiempos de atención mediante respuestas inmediatas del asistente virtual para preguntas frecuentes.
              </p>
            </div>

            <div className="gnb-fade group rounded-[16px] border border-[#e6edef] bg-[#fafcfc] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-turq-dark hover:bg-white hover:shadow-md">
              <span className="font-display text-[38px] font-extrabold text-[#d2e2e6] transition-colors group-hover:text-turq-dark">
                02
              </span>
              <h3 className="mb-2 mt-1 text-[17px] font-bold text-ink">Trazabilidad 100%</h3>
              <p className="text-[14px] leading-relaxed text-muted">
                Asignar un código único y registrar el historial completo de cada ticket desde la solicitud hasta la solución.
              </p>
            </div>

            <div className="gnb-fade group rounded-[16px] border border-[#e6edef] bg-[#fafcfc] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-turq-dark hover:bg-white hover:shadow-md">
              <span className="font-display text-[38px] font-extrabold text-[#d2e2e6] transition-colors group-hover:text-turq-dark">
                03
              </span>
              <h3 className="mb-2 mt-1 text-[17px] font-bold text-ink">Innovación Continua</h3>
              <p className="text-[14px] leading-relaxed text-muted">
                Actualizar constantemente la base de conocimiento e incorporar mejores prácticas de interacción digital.
              </p>
            </div>

            <div className="gnb-fade group rounded-[16px] border border-[#e6edef] bg-[#fafcfc] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-turq-dark hover:bg-white hover:shadow-md">
              <span className="font-display text-[38px] font-extrabold text-[#d2e2e6] transition-colors group-hover:text-turq-dark">
                04
              </span>
              <h3 className="mb-2 mt-1 text-[17px] font-bold text-ink">Seguridad Garantizada</h3>
              <p className="text-[14px] leading-relaxed text-muted">
                Resguardar la confidencialidad, privacidad e integridad de la información en todo el ciclo de vida del ticket.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Propósito del Sistema (Capacidades del portal) */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-[30px] font-extrabold text-ink sm:text-[34px]">Capacidades de la Plataforma</h2>
          <p className="mt-2 text-[15.5px] text-muted">
            Herramientas integradas creadas para tu tranquilidad y comodidad.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="gnb-fade flex flex-col justify-between p-7 transition-all duration-300 hover:-translate-y-1 hover:border-turq/40 hover:shadow-md">
            <div>
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-[12px] bg-[#eef4f5] text-turq-dark transition-colors group-hover:bg-turq-dark group-hover:text-white">
                <Icon.bot size={24} />
              </span>
              <h3 className="mb-2 text-[18px] font-bold text-ink">Asistencia Inteligente</h3>
              <p className="text-[14.5px] leading-relaxed text-muted">
                Respuestas inmediatas a las consultas más frecuentes mediante nuestro chatbot institucional en todo momento.
              </p>
            </div>
          </Card>

          <Card className="gnb-fade flex flex-col justify-between p-7 transition-all duration-300 hover:-translate-y-1 hover:border-turq/40 hover:shadow-md">
            <div>
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-[12px] bg-[#eef4f5] text-turq-dark">
                <Icon.ticket size={24} />
              </span>
              <h3 className="mb-2 text-[18px] font-bold text-ink">Gestión por Tickets</h3>
              <p className="text-[14.5px] leading-relaxed text-muted">
                Cada requerimiento se convierte en un ticket único con historial transparente, comentarios y atención especializada.
              </p>
            </div>
          </Card>

          <Card className="gnb-fade flex flex-col justify-between p-7 transition-all duration-300 hover:-translate-y-1 hover:border-turq/40 hover:shadow-md">
            <div>
              <span className="mb-5 grid h-12 w-12 place-items-center rounded-[12px] bg-[#eef4f5] text-turq-dark">
                <Icon.shield size={24} />
              </span>
              <h3 className="mb-2 text-[18px] font-bold text-ink">Atención Especializada</h3>
              <p className="text-[14.5px] leading-relaxed text-muted">
                Un equipo dedicado de asesores y supervisores capacitados para gestionar solicitudes y ofrecer resoluciones sobrias.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Aviso Institucional y Canal Oficial */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="gnb-fade rounded-[20px] border border-[#e6edef] bg-white p-8 shadow-sm sm:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-3 inline-block rounded-full bg-[#e4eff4] px-4 py-1 text-[12px] font-extrabold uppercase tracking-wider text-[#0b4963]">
              Aviso Institucional Importante
            </span>
            <h3 className="text-[22px] font-extrabold text-ink sm:text-[26px]">Canal Digital Oficial de Atención</h3>
            <p className="mt-4 text-[15px] leading-relaxed text-[#4a5f69]">
              Este sistema corresponde al portal oficial de atención digital y seguimiento de solicitudes mediante tickets del Banco GNB Perú. Las transacciones bancarias, transferencias de fondos y operaciones financieras confidenciales se ejecutan exclusivamente a través de los canales de Banca por Internet autorizados.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/faq"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-turq-dark px-6 text-[14.5px] font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-[#055b62]"
              >
                <Icon.book size={18} /> Preguntas Frecuentes
              </Link>
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-[#cdd9de] bg-white px-6 text-[14.5px] font-semibold text-ink-800 transition-transform hover:-translate-y-0.5 hover:border-turq-dark hover:text-turq-dark"
              >
                <Icon.lock size={18} /> Ingresar como Cliente
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
