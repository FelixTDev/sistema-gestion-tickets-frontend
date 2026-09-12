import { Link } from 'react-router-dom'

export function PublicNavigation() {
  return <nav className="public-navigation" aria-label="Navegación principal">
    <div className="public-nav-links"><Link to="/#servicios">Servicios informativos</Link><Link to="/#proceso">Cómo funciona</Link><Link to="/preguntas-frecuentes">Preguntas frecuentes</Link><Link to="/chat">Asistente</Link></div>
    <div className="public-nav-actions"><Link className="button button-ghost button-small" to="/registro">Registrarse</Link><Link className="button button-small" to="/login">Ingresar</Link></div>
  </nav>
}
