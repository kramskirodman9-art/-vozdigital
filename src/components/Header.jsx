import { useState } from "react";
import { useAuth } from "../contexts/useAuth";
import { useTeacher } from "../contexts/TeacherContext";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const { userProfile, logout } = useAuth();
  const { teacher, logoutTeacher } = useTeacher();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    if (teacher) logoutTeacher();
    else await logout();
    navigate("/");
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const isAdmin = userProfile?.role === "admin";
  const isAlumno = userProfile?.role === "alumno";
  const isTeacherLogged = !!teacher;

  return (
    <header className="newspaper-header">
      <div className="header-top">
        <span className="header-date">{dateStr}</span>
        <span className="header-edition">Edición Digital</span>
      </div>

      <div className="header-logo">
        <Link to="/">
          <div className="logo-container">
            <div className="logo-text">
              <div className="title-line">
                <div className="quill-writing">
                  <svg viewBox="0 0 60 80" className="quill-small">
                    <defs>
                      <linearGradient id="qGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#d4a843" }} />
                        <stop offset="50%" style={{ stopColor: "#f5d78e" }} />
                        <stop offset="100%" style={{ stopColor: "#d4a843" }} />
                      </linearGradient>
                      <linearGradient id="fGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#34d399" }} />
                        <stop offset="100%" style={{ stopColor: "#10b981" }} />
                      </linearGradient>
                    </defs>
                    <path d="M28 2 C22 10, 16 24, 8 48 C7 50, 6 52, 5 54 L9 55 C15 42, 22 28, 27 14 C27.5 11, 28 6, 28 2Z" fill="url(#fGrad)" opacity="0.95"/>
                    <path d="M26 6 C22 12, 16 26, 9 46" fill="none" stroke="#a7f3d0" strokeWidth="0.8" opacity="0.6"/>
                    <path d="M24 4 C20 0, 14 4, 8 18 C14 12, 20 6, 24 4Z" fill="#6ee7b7" opacity="0.4"/>
                    <path d="M8 48 L4 64 L7 63 L9 54Z" fill="url(#qGrad)"/>
                    <path d="M4 64 L2 72 L6 71 L7 63Z" fill="url(#qGrad)"/>
                    <path d="M2 72 L3 68 L6 71Z" fill="#b8860b"/>
                    <circle cx="1.5" cy="73.5" r="1.5" fill="#10b981" opacity="0.8"/>
                  </svg>
                </div>
                <h1 className="newspaper-title">
                  <span className="letter-animate" style={{animationDelay: '0.0s'}}>V</span>
                  <span className="letter-animate" style={{animationDelay: '0.4s'}}>o</span>
                  <span className="letter-animate" style={{animationDelay: '0.8s'}}>z</span>
                  <span className="letter-space"></span>
                  <span className="letter-animate" style={{animationDelay: '1.8s'}}>D</span>
                  <span className="letter-animate" style={{animationDelay: '2.2s'}}>i</span>
                  <span className="letter-animate" style={{animationDelay: '2.6s'}}>g</span>
                  <span className="letter-animate" style={{animationDelay: '3.0s'}}>i</span>
                  <span className="letter-animate" style={{animationDelay: '3.4s'}}>t</span>
                  <span className="letter-animate" style={{animationDelay: '3.8s'}}>a</span>
                  <span className="letter-animate" style={{animationDelay: '4.2s'}}>l</span>
                </h1>
              </div>
              <p className="newspaper-subtitle">Periódico Digital del Esc. Benemérito</p>
            </div>
          </div>
        </Link>
      </div>

      <nav className="header-nav">
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link></li>
          <li><Link to="/noticias" onClick={() => setMenuOpen(false)}>Noticias</Link></li>
          <li><Link to="/anecdotas" onClick={() => setMenuOpen(false)}>Anécdotas</Link></li>
          <li><Link to="/chistes" onClick={() => setMenuOpen(false)}>Chistes</Link></li>
          <li><Link to="/galeria" onClick={() => setMenuOpen(false)}>Galería</Link></li>
          <li><Link to="/cumpleanos" onClick={() => setMenuOpen(false)}>Cumpleaños</Link></li>
          <li className="nav-dropdown">
            <button className="nav-dropdown-toggle" onClick={() => setMoreOpen(!moreOpen)}>
              Más ▾
            </button>
            {moreOpen && (
              <div className="nav-dropdown-menu">
                <Link to="/programas" onClick={() => { setMoreOpen(false); setMenuOpen(false); }}>🎭 Programas</Link>
                <Link to="/historial" onClick={() => { setMoreOpen(false); setMenuOpen(false); }}>📚 Historial</Link>
                <Link to="/encuestas" onClick={() => { setMoreOpen(false); setMenuOpen(false); }}>📊 Encuestas</Link>
                <Link to="/meritos" onClick={() => { setMoreOpen(false); setMenuOpen(false); }}>🏆 Méritos</Link>
                <Link to="/calendario" onClick={() => { setMoreOpen(false); setMenuOpen(false); }}>📅 Calendario</Link>
                <Link to="/reto-del-dia" onClick={() => { setMoreOpen(false); setMenuOpen(false); }}>🎯 Reto del Día</Link>
                <Link to="/guia-de-estudios" onClick={() => { setMoreOpen(false); setMenuOpen(false); }}>📖 Guía de Estudios</Link>
                <Link to="/concurso-de-fotos" onClick={() => { setMoreOpen(false); setMenuOpen(false); }}>🏆 Concurso Fotos</Link>
                <Link to="/newsletter" onClick={() => { setMoreOpen(false); setMenuOpen(false); }}>📰 Newsletter</Link>
                <Link to="/chat" onClick={() => { setMoreOpen(false); setMenuOpen(false); }}>💬 Chat</Link>
                <Link to="/avisos-maestros" onClick={() => { setMoreOpen(false); setMenuOpen(false); }}>📢 Avisos Maestros</Link>
                <Link to="/pregunta-al-director" onClick={() => { setMoreOpen(false); setMenuOpen(false); }}>❓ Pregúntale</Link>
              </div>
            )}
          </li>
          {isAdmin && <li><Link to="/admin" className="nav-admin" onClick={() => setMenuOpen(false)}>⚙️ Admin</Link></li>}
        </ul>

        <div className="auth-section">
          {isAdmin || isTeacherLogged ? (
            <div className="user-menu">
              <span className="user-name">
                {isAdmin ? "⚙️ Admin" : isTeacherLogged ? `👩‍🏫 ${teacher.name}` : ""}
              </span>
              <button onClick={handleLogout} className="btn-logout">Salir</button>
            </div>
          ) : isAlumno ? (
            <div className="user-menu">
              <span className="user-name">🎫 {userProfile?.folio}</span>
              <button onClick={handleLogout} className="btn-logout">Salir</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">Acceder</Link>
              <Link to="/login-maestro" className="btn-login btn-teacher">👩‍🏫</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
