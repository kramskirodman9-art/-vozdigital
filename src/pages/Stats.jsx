import { useState, useEffect } from "react";

const VISITS_KEY = "vozdigital_visits";

function getVisits() {
  try { return JSON.parse(localStorage.getItem(VISITS_KEY)) || {}; } catch { return {}; }
}
function recordVisit() {
  const visits = getVisits();
  const today = new Date().toISOString().split("T")[0];
  visits[today] = (visits[today] || 0) + 1;
  localStorage.setItem(VISITS_KEY, JSON.stringify(visits));
}

export { recordVisit };

export default function Stats() {
  const [visits, setVisits] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setVisits(getVisits());
    setLoading(false);
  }, []);

  function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  }

  const days = getLast7Days();
  const maxVisits = Math.max(...days.map((d) => visits[d] || 0), 1);
  const totalWeek = days.reduce((sum, d) => sum + (visits[d] || 0), 0);

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div><p>Cargando estadísticas...</p></div>;

  return (
    <div className="tab-content">
      <h2>📊 Gráfica Semanal de Visitas</h2>
      <div className="stats-summary">
        <div className="stat-card">
          <span className="stat-number">{totalWeek}</span>
          <span className="stat-label">Visitas esta semana</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{Math.round(totalWeek / 7)}</span>
          <span className="stat-label">Promedio diario</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{Object.keys(visits).length}</span>
          <span className="stat-label">Días con actividad</span>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-bars">
          {days.map((day) => {
            const count = visits[day] || 0;
            const pct = maxVisits > 0 ? (count / maxVisits) * 100 : 0;
            const dayName = new Date(day + "T12:00:00").toLocaleDateString("es-MX", { weekday: "short" });
            return (
              <div key={day} className="chart-bar-col">
                <div className="chart-bar-value">{count}</div>
                <div className="chart-bar-wrapper">
                  <div className="chart-bar" style={{ height: `${Math.max(pct, 4)}%` }}></div>
                </div>
                <div className="chart-bar-label">{dayName}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
