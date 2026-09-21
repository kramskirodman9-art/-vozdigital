import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="newspaper-footer">
      <div className="footer-divider">
        <div className="divider-line"></div>
        <div className="divider-ornament">◆</div>
        <div className="divider-line"></div>
      </div>

      <div className="footer-content">
        <div className="footer-section">
          <h3>Voz Digital</h3>
          <p>El periódico digital del Esc. Benemérito</p>
          <p>Dando voz a los estudiantes</p>
        </div>

        <div className="footer-section">
          <h3>Secciones</h3>
          <ul>
            <li><Link to="/noticias">Noticias</Link></li>
            <li><Link to="/anecdotas">Anécdotas</Link></li>
            <li><Link to="/chistes">Chistes</Link></li>
            <li><Link to="/programas">Programas Especiales</Link></li>
            <li><Link to="/cumpleanos">Cumpleaños</Link></li>
            <li><Link to="/galeria">Galería</Link></li>
            <li><Link to="/historial">Historial</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contacto</h3>
          <p>Esc. Benemérito</p>
          <p>vozdigital@escuela.edu</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {year} Voz Digital — Esc. Benemérito. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
