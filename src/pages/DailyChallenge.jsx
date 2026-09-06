import { useState, useEffect } from "react";

const puzzles = [
  {
    id: 1,
    type: "acertijo",
    question: "¿Qué tiene ciudades, pero no casas; bosques, pero no árboles; y agua, pero no peces?",
    answer: "un mapa",
    hint: "Piensa en algo que usas en geografía",
  },
  {
    id: 2,
    type: "mate",
    question: "Si un lunes 5 personas tardan 5 minutos en hacer 5 tazas de café, ¿cuántos minutos tardarán 100 personas en hacer 100 tazas?",
    answer: "5",
    hint: "No es 100 minutos...",
  },
  {
    id: 3,
    type: "palabra",
    question: "¿Qué palabra en español tiene todas las vocales en orden (a, e, i, o, u)?",
    answer: "murciélago",
    hint: "Es un animal que vuela de noche",
  },
  {
    id: 4,
    type: "acertijo",
    question: "Cuanto más grande es, menos se ve. ¿Qué es?",
    answer: "la oscuridad",
    hint: "Piensa en algo opuesto a la luz",
  },
  {
    id: 5,
    type: "mate",
    question: "¿Cuánto es 15 × 15 + 25?",
    answer: "250",
    hint: "15 al cuadrado es 225",
  },
];

export default function DailyChallenge() {
  const [todayPuzzle, setTodayPuzzle] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState(null);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    const dayIndex = new Date().getDate() % puzzles.length;
    setTodayPuzzle(puzzles[dayIndex]);
    try {
      const saved = JSON.parse(localStorage.getItem("vozdigital_solved") || "{}");
      if (saved[dayIndex]) setSolved(true);
    } catch { /* empty */ }
  }, []);

  function checkAnswer() {
    if (!todayPuzzle || !userAnswer.trim()) return;
    const normalized = userAnswer.trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const correct = todayPuzzle.answer.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (normalized === correct) {
      setResult("correct");
      setSolved(true);
      try {
        const saved = JSON.parse(localStorage.getItem("vozdigital_solved") || "{}");
        saved[new Date().getDate() % puzzles.length] = true;
        localStorage.setItem("vozdigital_solved", JSON.stringify(saved));
      } catch { /* empty */ }
    } else {
      setResult("wrong");
    }
  }

  if (!todayPuzzle) return <div className="loading-screen"><div className="loading-spinner"></div></div>;

  const typeEmojis = { acertijo: "🧩", mate: "🔢", palabra: "📝" };

  return (
    <main className="section-page">
      <div className="section-page-header">
        <span className="section-icon">🎯</span>
        <h1>Reto del Día</h1>
        <div className="section-line"></div>
      </div>

      <div className="puzzle-card">
        <div className="puzzle-type">
          {typeEmojis[todayPuzzle.type]} {todayPuzzle.type.toUpperCase()}
        </div>
        <h2 className="puzzle-question">{todayPuzzle.question}</h2>

        {!solved ? (
          <>
            <div className="puzzle-input-row">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Tu respuesta..."
                onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
              />
              <button className="btn-primary" onClick={checkAnswer}>Verificar</button>
            </div>

            {result === "wrong" && <p className="form-error">Incorrecto. Intenta de nuevo.</p>}

            {!showHint ? (
              <button className="link-button" onClick={() => setShowHint(true)}>💡 Ver pista</button>
            ) : (
              <p className="puzzle-hint">💡 {todayPuzzle.hint}</p>
            )}
          </>
        ) : (
          <div className="puzzle-solved">
            <span className="puzzle-solved-icon">🎉</span>
            <p>¡Correcto! La respuesta es: <strong>{todayPuzzle.answer}</strong></p>
          </div>
        )}
      </div>
    </main>
  );
}
