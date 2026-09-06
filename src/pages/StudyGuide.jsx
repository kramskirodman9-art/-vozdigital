import { useState } from "react";

const guides = [
  { id: "g1", subject: "Matemáticas", grade: "3ro", icon: "🔢", resources: [
    { title: "Fracciones y decimales", type: "pdf", url: "#" },
    { title: "Geometría básica", type: "pdf", url: "#" },
    { title: "Videos de ejercicios", type: "video", url: "#" },
  ]},
  { id: "g2", subject: "Español", grade: "3ro", icon: "📖", resources: [
    { title: "Análisis literario", type: "pdf", url: "#" },
    { title: "Gramática avanzada", type: "pdf", url: "#" },
  ]},
  { id: "g3", subject: "Ciencias", grade: "4to", icon: "🔬", resources: [
    { title: "El sistema solar", type: "pdf", url: "#" },
    { title: "Experimentos caseros", type: "video", url: "#" },
  ]},
  { id: "g4", subject: "Historia", grade: "4to", icon: "🏛️", resources: [
    { title: "Revolución Mexicana", type: "pdf", url: "#" },
    { title: "Línea del tiempo", type: "pdf", url: "#" },
  ]},
  { id: "g5", subject: "Inglés", grade: "2do", icon: "🌍", resources: [
    { title: "Vocabulario básico", type: "pdf", url: "#" },
    { title: "Verbos regulares", type: "pdf", url: "#" },
  ]},
  { id: "g6", subject: "Física", grade: "4to", icon: "⚡", resources: [
    { title: "Leyes de Newton", type: "pdf", url: "#" },
    { title: "Ejercicios de fuerza", type: "video", url: "#" },
  ]},
];

export default function StudyGuide() {
  const [filterGrade, setFilterGrade] = useState("todos");
  const grades = ["todos", "2do", "3ro", "4to"];

  const filtered = filterGrade === "todos" ? guides : guides.filter((g) => g.grade === filterGrade);

  return (
    <main className="section-page">
      <div className="section-page-header">
        <span className="section-icon">📚</span>
        <h1>Guía de Estudios</h1>
        <p className="history-subtitle">Recursos y materiales por materia y grado</p>
        <div className="section-line"></div>
      </div>

      <div className="category-filters">
        {grades.map((g) => (
          <button key={g} className={`filter-btn ${filterGrade === g ? "active" : ""}`} onClick={() => setFilterGrade(g)}>
            {g === "todos" ? "Todos" : `${g} Grado`}
          </button>
        ))}
      </div>

      <div className="guides-grid">
        {filtered.map((guide) => (
          <div key={guide.id} className="guide-card">
            <div className="guide-header">
              <span className="guide-icon">{guide.icon}</span>
              <div>
                <h3>{guide.subject}</h3>
                <p className="guide-grade">{guide.grade} Grado</p>
              </div>
            </div>
            <ul className="guide-resources">
              {guide.resources.map((r, idx) => (
                <li key={idx}>
                  <span className="resource-icon">{r.type === "pdf" ? "📄" : "🎬"}</span>
                  <a href={r.url}>{r.title}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
