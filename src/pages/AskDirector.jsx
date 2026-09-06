import { useState, useEffect } from "react";

const QUESTIONS_KEY = "vozdigital_questions";

function getQuestions() {
  try { return JSON.parse(localStorage.getItem(QUESTIONS_KEY)) || []; } catch { return []; }
}
function saveQuestions(q) {
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(q));
}

export default function AskDirector() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQuestions(getQuestions());
    setLoading(false);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!newQuestion.trim()) { setError("Escribe tu pregunta."); return; }
    if (!authorName.trim()) { setError("Ingresa tu nombre."); return; }

    const q = {
      id: Date.now().toString(),
      text: newQuestion.trim(),
      author: authorName.trim(),
      answer: null,
      answeredBy: null,
      createdAt: new Date().toISOString(),
    };

    const updated = [q, ...questions];
    setQuestions(updated);
    saveQuestions(updated);
    setNewQuestion("");
    setAuthorName("");
    setSuccess("¡Pregunta enviada! Espera la respuesta del director.");
  }

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div><p>Cargando...</p></div>;

  return (
    <main className="section-page">
      <div className="section-page-header">
        <span className="section-icon">❓</span>
        <h1>Pregúntale al Director</h1>
        <p className="history-subtitle">Envía tu pregunta de forma anónima y recibe una respuesta</p>
        <div className="section-line"></div>
      </div>

      <form className="ask-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tu nombre</label>
          <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Nombre (opcional pero recomendado)" />
        </div>
        <div className="form-group">
          <label>Tu pregunta</label>
          <textarea value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="Escribe tu pregunta aquí..." rows={4} required />
        </div>
        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}
        <button type="submit" className="btn-primary">Enviar pregunta</button>
      </form>

      <div className="questions-list">
        {questions.length > 0 ? questions.map((q) => (
          <div key={q.id} className="question-card">
            <div className="question-text">
              <span className="question-author">👤 {q.author}</span>
              <p>{q.text}</p>
            </div>
            {q.answer ? (
              <div className="question-answer">
                <span className="answer-label">💬 Respuesta del director:</span>
                <p>{q.answer}</p>
                <span className="answer-by">— {q.answeredBy}</span>
              </div>
            ) : (
              <p className="question-pending">⏳ Esperando respuesta...</p>
            )}
          </div>
        )) : (
          <div className="empty-section"><p>Aún no hay preguntas. Sé el primero en preguntar.</p></div>
        )}
      </div>
    </main>
  );
}
