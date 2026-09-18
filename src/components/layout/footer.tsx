import { Link } from 'react-router-dom'
import { Icon } from '../ui/icons'
import { BrandHeader } from './brand-header'

export function Footer() {
  return (
    <footer className="mt-16 bg-[#06243a] text-[#b9cdd6]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <BrandHeader inverted compact />
          <p className="mt-4 text-[13.5px] leading-relaxed text-[#a2c4d3]">
            Centro de atención digital para consultas, preguntas frecuentes y seguimiento de solicitudes mediante tickets.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-white">Atención al cliente</h2>
          <ul className="space-y-2 text-[13.5px]">
            <li>
              <Link className="inline-flex min-h-11 items-center hover:text-white transition-colors" to="/faq">
                Preguntas frecuentes
              </Link>
            </li>
            <li>
              <Link className="inline-flex min-h-11 items-center hover:text-white transition-colors" to="/chat">
                Asistente virtual
              </Link>
            </li>
            <li>
              <Link className="inline-flex min-h-11 items-center hover:text-white transition-colors" to="/nosotros">
                Nosotros
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-white">Portal de cliente</h2>
          <ul className="space-y-2 text-[13.5px]">
            <li>
              <Link className="inline-flex min-h-11 items-center gap-1.5 hover:text-white transition-colors" to="/login">
                <Icon.lock size={14} /> Ingresar como cliente
              </Link>
            </li>
            <li>
              <Link className="inline-flex min-h-11 items-center hover:text-white transition-colors" to="/register">
                Crear cuenta
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-white">Institucional</h2>
          <ul className="space-y-2 text-[13.5px]">
            <li>
              <Link className="inline-flex min-h-11 items-center gap-1.5 text-white font-medium hover:text-[#8bc63e] transition-colors" to="/personal/login">
                <Icon.shield size={14} className="text-[#8bc63e]" /> Acceso personal interno
              </Link>
            </li>
            <li>
              <Link className="inline-flex min-h-11 items-center hover:text-white transition-colors" to="/design-system">
                Design System
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-[12px] sm:flex-row sm:px-6">
          <p>© 2026 Banco GNB Perú</p>
          <p className="text-[#a9bec7]">
            Portal de consultas y tickets. Las operaciones bancarias se realizan únicamente por los canales oficiales del banco.
          </p>
        </div>
      </div>
    </footer>
  )
}
