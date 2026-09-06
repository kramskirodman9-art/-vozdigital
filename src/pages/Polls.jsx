import { useState, useEffect } from "react";

const POLLS_KEY = "vozdigital_polls";

function getPolls() {
  try { return JSON.parse(localStorage.getItem(POLLS_KEY)) || []; } catch { return []; }
}
function savePolls(polls) {
  localStorage.setItem(POLLS_KEY, JSON.stringify(polls));
}

const defaultPolls = [
  {
    id: "poll-1",
    question: "¿Qué sección te gusta más?",
    options: [
      { id: "o1", text: "Noticias", votes: 12 },
      { id: "o2", text: "Anécdotas", votes: 8 },
      { id: "o3", text: "Chistes", votes: 15 },
      { id: "o4", text: "Galería", votes: 6 },
    ],
    createdAt: "2026-09-01",
    active: true,
  },
];

export default function Polls() {
  const [polls, setPolls] = useState([]);
  const [voted, setVoted] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stored = getPolls();
    if (stored.length === 0) {
      stored = defaultPolls;
      savePolls(stored);
    }
    setPolls(stored);
    try {
      const v = JSON.parse(localStorage.getItem("vozdigital_voted") || "{}");
      setVoted(v);
    } catch { /* empty */ }
    setLoading(false);
  }, []);

  function handleVote(pollId, optionId) {
    if (voted[pollId]) return;
    const updated = polls.map((p) => {
      if (p.id !== pollId) return p;
      return {
        ...p,
        options: p.options.map((o) => o.id === optionId ? { ...o, votes: o.votes + 1 } : o),
      };
    });
    setPolls(updated);
    savePolls(updated);
    const newVoted = { ...voted, [pollId]: optionId };
    setVoted(newVoted);
    localStorage.setItem("vozdigital_voted", JSON.stringify(newVoted));
  }

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div><p>Cargando encuestas...</p></div>;

  const activePolls = polls.filter((p) => p.active);

  return (
    <main className="section-page">
      <div className="section-page-header">
        <span className="section-icon">📊</span>
        <h1>Encuestas</h1>
        <div className="section-line"></div>
      </div>

      {activePolls.length > 0 ? (
        <div className="polls-grid">
          {activePolls.map((poll) => {
            const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
            const hasVoted = !!voted[poll.id];
            return (
              <div key={poll.id} className="poll-card">
                <h3>{poll.question}</h3>
                <div className="poll-options">
                  {poll.options.map((opt) => {
                    const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                    const isSelected = voted[poll.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        className={`poll-option ${hasVoted ? "voted" : ""} ${isSelected ? "selected" : ""}`}
                        onClick={() => handleVote(poll.id, opt.id)}
                        disabled={hasVoted}
                      >
                        <span className="poll-option-text">{opt.text}</span>
                        {hasVoted && (
                          <span className="poll-option-bar" style={{ width: `${pct}%` }}></span>
                        )}
                        {hasVoted && <span className="poll-option-pct">{pct}%</span>}
                      </button>
                    );
                  })}
                </div>
                <p className="poll-total">{totalVotes} voto(s) total</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-section">
          <p>No hay encuestas activas.</p>
        </div>
      )}
    </main>
  );
}
