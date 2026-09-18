import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Icon } from '../ui/icons'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-11 items-center rounded-[9px] px-3 py-2 text-[14px] font-medium transition-colors hover:bg-[#eef4f5] hover:text-turq-dark ${
    isActive ? 'font-semibold text-turq-dark' : 'text-ink'
  }`

export function PublicNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null)
  const location = useLocation()

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (isOpen) firstMobileLinkRef.current?.focus()
  }, [isOpen])

  function close(returnFocus = false): void {
    setIsOpen(false)
    if (returnFocus) window.setTimeout(() => toggleRef.current?.focus(), 0)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Escape') {
      event.preventDefault()
      close(true)
    }
  }

  return (
    <div className="flex items-center gap-2" onKeyDown={handleKeyDown}>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
        <NavLink to="/" end className={navLinkClass}>
          Inicio
        </NavLink>
        <NavLink to="/faq" className={navLinkClass}>
          Preguntas frecuentes
        </NavLink>
        <NavLink to="/chat" className={navLinkClass}>
          Asistente virtual
        </NavLink>
        <NavLink to="/nosotros" className={navLinkClass}>
          Nosotros
        </NavLink>
      </nav>
      <div className="hidden items-center gap-2 md:flex">
        <Link
          to="/personal/login"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] border border-[#cdd9de] bg-white px-3 text-[13px] font-semibold text-ink-800 transition-colors hover:border-turq-dark hover:text-turq-dark"
        >
          <Icon.shield size={14} className="text-[#0b4963]" /> Acceso personal
        </Link>
        <Link
          to="/login"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] bg-turq-dark px-3.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#055b62]"
        >
          <Icon.lock size={15} /> Ingresar como cliente
        </Link>
      </div>
      <button
        ref={toggleRef}
        type="button"
        className="grid min-h-11 min-w-11 place-items-center rounded-[9px] text-ink hover:bg-[#eef4f5] md:hidden"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isOpen}
        aria-controls="public-mobile-navigation"
      >
        {isOpen ? <Icon.x /> : <Icon.menu />}
      </button>
      {isOpen && (
        <nav
          id="public-mobile-navigation"
          aria-label="Navegación móvil"
          className="gnb-fade absolute left-0 right-0 top-full flex flex-col gap-1 border-t border-[#e6edef] bg-white px-4 py-3 shadow-lg md:hidden"
        >
          <NavLink ref={firstMobileLinkRef} to="/" end className={navLinkClass}>
            Inicio
          </NavLink>
          <NavLink to="/faq" className={navLinkClass}>
            Preguntas frecuentes
          </NavLink>
          <NavLink to="/chat" className={navLinkClass}>
            Asistente virtual
          </NavLink>
          <NavLink to="/nosotros" className={navLinkClass}>
            Nosotros
          </NavLink>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link
              to="/personal/login"
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[10px] border border-[#cdd9de] bg-white px-2.5 text-[13px] font-semibold text-ink-800"
            >
              <Icon.shield size={14} /> Acceso personal
            </Link>
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[10px] bg-turq-dark px-2.5 text-[13px] font-semibold text-white"
            >
              <Icon.lock size={15} /> Ingresar
            </Link>
          </div>
        </nav>
      )}
    </div>
  )
}
