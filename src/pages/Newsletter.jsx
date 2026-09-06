import { useState, useEffect } from "react";

const NEWSLETTER_KEY = "vozdigital_newsletter";

function getNewsletters() {
  try { return JSON.parse(localStorage.getItem(NEWSLETTER_KEY)) || []; } catch { return []; }
}

const defaultNewsletters = [
  {
    id: "n1",
    title: "Semana del 1 al 5 de Septiembre",
    date: "2026-09-05",
    summary: "Inicio del ciclo escolar 2026-2027. Se presentaron los nuevos maestros y se dieron a conocer las actividades del primer bimestre.",
    highlights: ["🎉 Bienvenida a nuevos alumnos", "📋 Calendario escolar publicado", "🏆 Reconocimientos del semestre anterior"],
  },
  {
    id: "n2",
    title: "Semana del 8 al 12 de Septiembre",
    date: "2026-09-12",
    summary: "Semana de integración. Se realizaron actividades deportivas y culturales para fomentar el trabajo en equipo.",
    highlights: ["⚽ Torneo intergrados", "🎭 Festival de talentos preliminary", "📸 Concurso de fotos activo"],
  },
];

export default function Newsletter() {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getNewsletters();
    setNewsletters(stored.length > 0 ? stored : defaultNewsletters);
    setLoading(false);
  }, []);

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div><p>Cargando newsletters...</p></div>;

  return (
    <main className="section-page">
      <div className="section-page-header">
        <span className="section-icon">📰</span>
        <h1>Newsletter Semanal</h1>
        <p className="history-subtitle">Resumen de lo más importante de la semana</p>
        <div className="section-line"></div>
      </div>

      <div className="newsletters-list">
        {newsletters.map((nl) => (
          <div key={nl.id} className="newsletter-card">
            <div className="newsletter-date">{nl.date}</div>
            <h3>{nl.title}</h3>
            <p className="newsletter-summary">{nl.summary}</p>
            <ul className="newsletter-highlights">
              {nl.highlights.map((h, idx) => (
                <li key={idx}>{h}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
