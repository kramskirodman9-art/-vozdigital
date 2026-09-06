import { useState, useEffect } from "react";

const MERITS_KEY = "vozdigital_merits";

function getMerits() {
  try { return JSON.parse(localStorage.getItem(MERITS_KEY)) || []; } catch { return []; }
}
function saveMerits(m) {
  localStorage.setItem(MERITS_KEY, JSON.stringify(m));
}

const defaultMerits = [
  { id: "m1", name: "Sofía Ramírez", grade: "3ro", group: "A", reason: "Mejor promedio del semestre", type: "academico", date: "2026-09-01" },
  { id: "m2", name: "Diego Herrera", grade: "4to", group: "B", reason: "Participación destacada en olimpiadas", type: "academico", date: "2026-08-28" },
  { id: "m3", name: "Luna Fernández", grade: "3ro", group: "A", reason: "Ganadora del concurso de arte", type: "deportivo", date: "2026-08-25" },
  { id: "m4", name: "Mateo Torres", grade: "4to", group: "A", reason: "Campeón intercolegiados de fútbol", type: "deportivo", date: "2026-08-20" },
  { id: "m5", name: "Mtra. Patricia Vega", grade: "", group: "", reason: "Maestro del mes", type: "maestro", date: "2026-09-01" },
];

export default function Merits() {
  const [merits, setMerits] = useState([]);
  const [filter, setFilter] = useState("todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stored = getMerits();
    if (stored.length === 0) {
      stored = defaultMerits;
      saveMerits(stored);
    }
    setMerits(stored);
    setLoading(false);
  }, []);

  const typeIcons = { academico: "📚", deportivo: "⚽", maestro: "👩‍🏫", goodAct: "🌟" };

  const filtered = filter === "todos" ? merits : merits.filter((m) => m.type === filter);

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div><p>Cargando méritos...</p></div>;

  return (
    <main className="section-page">
      <div className="section-page-header">
        <span className="section-icon">🏆</span>
        <h1>Reconocimientos</h1>
        <div className="section-line"></div>
      </div>

      <div className="category-filters">
        <button className={`filter-btn ${filter === "todos" ? "active" : ""}`} onClick={() => setFilter("todos")}>Todos</button>
        <button className={`filter-btn ${filter === "academico" ? "active" : ""}`} onClick={() => setFilter("academico")}>📚 Académico</button>
        <button className={`filter-btn ${filter === "deportivo" ? "active" : ""}`} onClick={() => setFilter("deportivo")}>⚽ Deportivo</button>
        <button className={`filter-btn ${filter === "maestro" ? "active" : ""}`} onClick={() => setFilter("maestro")}>👩‍🏫 Maestro</button>
        <button className={`filter-btn ${filter === "goodAct" ? "active" : ""}`} onClick={() => setFilter("goodAct")}>🌟 Buen Acto</button>
      </div>

      {filtered.length > 0 ? (
        <div className="merits-grid">
          {filtered.map((m) => (
            <div key={m.id} className={`merit-card merit-${m.type}`}>
              <div className="merit-icon">{typeIcons[m.type] || "🏆"}</div>
              <div className="merit-info">
                <h3>{m.name}</h3>
                {m.grade && <p className="merit-grade">{m.grade}° {m.group}</p>}
                <p className="merit-reason">{m.reason}</p>
                <p className="merit-date">{m.date}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-section"><p>No hay reconocimientos en esta categoría.</p></div>
      )}
    </main>
  );
}
