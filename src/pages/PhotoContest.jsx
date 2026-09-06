import { useState } from "react";

const defaultEntries = [
  { id: "c1", title: "Atardecer en la escuela", author: "Sofía Ramírez", grade: "3ro A", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop", votes: 24 },
  { id: "c2", title: "Mi mascota favorita", author: "Diego Herrera", grade: "4to B", url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop", votes: 18 },
  { id: "c3", title: "Naturaleza escolar", author: "Luna Fernández", grade: "3ro A", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop", votes: 31 },
];

export default function PhotoContest() {
  const [entries, setEntries] = useState(defaultEntries);
  const [voted, setVoted] = useState({});

  function handleVote(id) {
    if (voted[id]) return;
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, votes: e.votes + 1 } : e));
    setVoted((prev) => ({ ...prev, [id]: true }));
  }

  const sorted = [...entries].sort((a, b) => b.votes - a.votes);

  return (
    <main className="section-page">
      <div className="section-page-header">
        <span className="section-icon">🏆</span>
        <h1>Concurso de Fotos</h1>
        <p className="history-subtitle">Vota por tu foto favorita</p>
        <div className="section-line"></div>
      </div>

      <div className="contest-grid">
        {sorted.map((entry, idx) => (
          <div key={entry.id} className={`contest-card ${idx === 0 ? "contest-winner" : ""}`}>
            {idx === 0 && <span className="contest-badge">🥇 Líder</span>}
            <img src={entry.url} alt={entry.title} loading="lazy" />
            <div className="contest-info">
              <h3>{entry.title}</h3>
              <p>Por {entry.author} — {entry.grade}</p>
              <div className="contest-votes">
                <button
                  className={`btn-vote ${voted[entry.id] ? "voted" : ""}`}
                  onClick={() => handleVote(entry.id)}
                  disabled={!!voted[entry.id]}
                >
                  ❤️ {entry.votes}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
