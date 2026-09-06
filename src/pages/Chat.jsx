import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/useAuth";

const MESSAGES_KEY = "vozdigital_chat";

function getMessages() {
  try { return JSON.parse(localStorage.getItem(MESSAGES_KEY)) || []; } catch { return []; }
}
function saveMessages(m) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(m));
}

export default function Chat() {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [topic, setTopic] = useState("");
  const messagesEnd = useRef(null);

  useEffect(() => {
    const stored = getMessages();
    setMessages(stored);
  }, []);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(e) {
    e.preventDefault();
    if (!newMsg.trim() || !authorName.trim()) return;

    const msg = {
      id: Date.now().toString(),
      text: newMsg.trim(),
      author: authorName.trim(),
      topic: topic.trim() || "General",
      createdAt: new Date().toISOString(),
      role: userProfile?.role || "alumno",
    };

    const updated = [...messages, msg];
    setMessages(updated);
    saveMessages(updated);
    setNewMsg("");
  }

  return (
    <main className="section-page chat-page">
      <div className="section-page-header">
        <span className="section-icon">💬</span>
        <h1>Chat Escolar</h1>
        <p className="history-subtitle">Debate y discute con tus compañeros</p>
        <div className="section-line"></div>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="empty-section"><p>Sé el primero en escribir algo.</p></div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.role === "admin" ? "admin-msg" : msg.role === "maestro" ? "teacher-msg" : ""}`}>
              <div className="chat-msg-header">
                <strong>{msg.author}</strong>
                <span className="chat-topic">{msg.topic}</span>
                <span className="chat-time">
                  {new Date(msg.createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p>{msg.text}</p>
            </div>
          ))}
          <div ref={messagesEnd} />
        </div>

        <form className="chat-input-form" onSubmit={sendMessage}>
          <div className="chat-input-row">
            <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Tu nombre" className="chat-name-input" required />
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Tema (opcional)" className="chat-topic-input" />
          </div>
          <div className="chat-input-row">
            <input type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Escribe tu mensaje..." className="chat-msg-input" required />
            <button type="submit" className="btn-primary">Enviar</button>
          </div>
        </form>
      </div>
    </main>
  );
}
