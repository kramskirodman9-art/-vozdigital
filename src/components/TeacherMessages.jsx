import { useState, useEffect } from "react";

const MESSAGES_KEY = "vozdigital_teacher_messages";

function getMessages() {
  try { return JSON.parse(localStorage.getItem(MESSAGES_KEY)) || []; } catch { return []; }
}
function saveMessages(m) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(m));
}

const defaultMessages = [
  { id: "tm1", teacher: "Mtra. Patricia Vega", text: "Recordatorio: El proyecto de ciencias se entrega el viernes 12 de septiembre. No olviden traer los materiales.", priority: "normal", createdAt: "2026-09-01" },
  { id: "tm2", teacher: "Prof. Alejandro Díaz", text: "Reunión de padres de familia el próximo lunes a las 5pm. Es obligatoria la asistencia.", priority: "urgente", createdAt: "2026-09-03" },
];

export default function TeacherMessages({ showSidebar = false }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const stored = getMessages();
    setMessages(stored.length > 0 ? stored : defaultMessages);
  }, []);

  if (showSidebar) {
    return (
      <div className="teacher-messages-sidebar">
        <h3>📢 Avisos de Maestros</h3>
        {messages.length > 0 ? messages.map((msg) => (
          <div key={msg.id} className={`teacher-msg ${msg.priority === "urgente" ? "urgent" : ""}`}>
            <div className="teacher-msg-header">
              <strong>{msg.teacher}</strong>
              {msg.priority === "urgente" && <span className="urgent-badge">Urgente</span>}
            </div>
            <p>{msg.text}</p>
            <span className="teacher-msg-date">{msg.createdAt}</span>
          </div>
        )) : (
          <p className="no-content">No hay avisos nuevos.</p>
        )}
      </div>
    );
  }

  return (
    <main className="section-page">
      <div className="section-page-header">
        <span className="section-icon">📢</span>
        <h1>Avisos de Maestros</h1>
        <div className="section-line"></div>
      </div>

      <div className="teacher-messages-list">
        {messages.length > 0 ? messages.map((msg) => (
          <div key={msg.id} className={`teacher-msg-card ${msg.priority === "urgente" ? "urgent-card" : ""}`}>
            <div className="teacher-msg-card-header">
              <span className="teacher-msg-icon">👩‍🏫</span>
              <div>
                <strong>{msg.teacher}</strong>
                <span className="teacher-msg-date">{msg.createdAt}</span>
              </div>
              {msg.priority === "urgente" && <span className="urgent-badge">Urgente</span>}
            </div>
            <p>{msg.text}</p>
          </div>
        )) : (
          <div className="empty-section"><p>No hay avisos de maestros.</p></div>
        )}
      </div>
    </main>
  );
}

export function getTeacherMessages() {
  return getMessages();
}

export function addTeacherMessage(msg) {
  const messages = getMessages();
  messages.unshift({ ...msg, id: Date.now().toString(), createdAt: new Date().toISOString() });
  saveMessages(messages);
  return messages;
}

export function deleteTeacherMessage(id) {
  const messages = getMessages().filter((m) => m.id !== id);
  saveMessages(messages);
  return messages;
}
