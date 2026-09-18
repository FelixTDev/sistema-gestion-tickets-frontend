import { Link } from 'react-router-dom'
import { Icon } from '../ui/icons'
import { BrandHeader } from './brand-header'

export function Footer() {
  return <footer className="mt-20 bg-[#06243a] text-[#b9cdd6]">
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
      <div className="md:col-span-2">
        <BrandHeader inverted compact />
        <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed">Centro de atención digital para consultas, preguntas frecuentes y seguimiento de solicitudes mediante tickets.</p>
      </div>
      <div>
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-white">Atención</h2>
        <ul className="space-y-2 text-[13.5px]">
          <li><Link className="inline-flex min-h-11 items-center hover:text-white" to="/faq">Preguntas frecuentes</Link></li>
          <li><Link className="inline-flex min-h-11 items-center hover:text-white" to="/login">Portal del cliente</Link></li>
          <li><Link className="inline-flex min-h-11 items-center hover:text-white" to="/#canales">Canales de atención</Link></li>
        </ul>
      </div>
      <div>
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-white">Institucional</h2>
        <ul className="space-y-2 text-[13.5px]">
          <li><Link className="inline-flex min-h-11 items-center hover:text-white" to="/design-system">Design System</Link></li>
          <li><Link className="inline-flex min-h-11 items-center gap-1.5 text-[#a9bec7] hover:text-white" to="/personal/login"><Icon.shield size={13} /> Acceso personal interno</Link></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-[12px] sm:flex-row sm:px-6">
        <p>© 2026 Banco GNB Perú</p>
        <p className="text-[#a9bec7]">Portal de consultas y tickets</p>
      </div>
    </div>
  </footer>
}
