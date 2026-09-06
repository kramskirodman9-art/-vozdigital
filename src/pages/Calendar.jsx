import { useState, useEffect } from "react";

const EVENTS_KEY = "vozdigital_events";

function getEvents() {
  try { return JSON.parse(localStorage.getItem(EVENTS_KEY)) || []; } catch { return []; }
}
function saveEvents(e) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(e));
}

const defaultEvents = [
  { id: "e1", title: "Festival de Talentos", date: "2026-09-15", time: "14:00", location: "Auditorio", type: "evento", description: "Muestra de talentos de todos los grados" },
  { id: "e2", title: "Entrega de boletas", date: "2026-09-20", time: "08:00", location: "Dirección", type: "academico", description: "Entrega de calificaciones del primer parcial" },
  { id: "e3", title: "Día del Niño", date: "2026-09-30", time: "10:00", location: "Patio", type: "evento", description: "Actividades recreativas y juegos" },
  { id: "e4", title: "Reunión de padres", date: "2026-10-05", time: "17:00", location: "Aulas", type: "academico", description: "Junta de padres de familia" },
  { id: "e5", title: "Concurso de Fotografía", date: "2026-10-10", time: "12:00", location: "Salón de usos múltiples", type: "evento", description: "Concurso abierto para todos los alumnos" },
];

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stored = getEvents();
    if (stored.length === 0) {
      stored = defaultEvents;
      saveEvents(stored);
    }
    setEvents(stored);
    setLoading(false);
  }, []);

  const today = new Date();
  const upcoming = events.filter((e) => new Date(e.date) >= today).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = events.filter((e) => new Date(e.date) < today).sort((a, b) => new Date(b.date) - new Date(a.date));

  const typeColors = { evento: "var(--green-500)", academico: "var(--accent-blue)" };

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div><p>Cargando eventos...</p></div>;

  return (
    <main className="section-page">
      <div className="section-page-header">
        <span className="section-icon">📅</span>
        <h1>Calendario</h1>
        <div className="section-line"></div>
      </div>

      {upcoming.length > 0 && (
        <div className="calendar-section">
          <h2>🎯 Próximos Eventos</h2>
          <div className="events-list">
            {upcoming.map((ev) => (
              <div key={ev.id} className="event-card" style={{ borderLeftColor: typeColors[ev.type] || "var(--green-500)" }}>
                <div className="event-date-badge">
                  <span className="event-day">{new Date(ev.date + "T00:00:00").getDate()}</span>
                  <span className="event-month">{new Date(ev.date + "T00:00:00").toLocaleDateString("es-MX", { month: "short" })}</span>
                </div>
                <div className="event-info">
                  <h3>{ev.title}</h3>
                  <p className="event-meta">🕐 {ev.time} — 📍 {ev.location}</p>
                  <p className="event-desc">{ev.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div className="calendar-section">
          <h2>📜 Eventos Anteriores</h2>
          <div className="events-list">
            {past.map((ev) => (
              <div key={ev.id} className="event-card event-past" style={{ borderLeftColor: "var(--gray-300)" }}>
                <div className="event-date-badge past">
                  <span className="event-day">{new Date(ev.date + "T00:00:00").getDate()}</span>
                  <span className="event-month">{new Date(ev.date + "T00:00:00").toLocaleDateString("es-MX", { month: "short" })}</span>
                </div>
                <div className="event-info">
                  <h3>{ev.title}</h3>
                  <p className="event-meta">🕐 {ev.time} — 📍 {ev.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
