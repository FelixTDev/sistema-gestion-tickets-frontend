import { Link } from 'react-router-dom'
import { BrandHeader } from './brand-header'

export function Footer() {
  return <footer className="site-footer">
    <div className="footer-main">
      <BrandHeader inverted compact />
      <div><h2>Orientación del prototipo</h2><p>Información demostrativa sobre consultas, respuestas y seguimiento de tickets.</p></div>
      <div><h2>Explora</h2><Link to="/chat">Asistente virtual</Link><Link to="/preguntas-frecuentes">Preguntas frecuentes</Link><Link to="/login">Portal de clientes</Link></div>
      <div><h2>Acceso restringido</h2><p>Solo para cuentas demo autorizadas.</p><Link className="staff-access-link" to="/personal/login">Acceso para personal <span aria-hidden="true">→</span></Link></div>
    </div>
    <div className="footer-bottom"><span>Proyecto académico de gestión de atención.</span><span>No afiliado a canales operativos del banco.</span></div>
  </footer>
}
