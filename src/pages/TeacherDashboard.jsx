import { useState } from "react";
import { useTeacher } from "../contexts/TeacherContext";
import { Link } from "react-router-dom";

export default function TeacherDashboard() {
  const {
    teacher,
    studentMessages,
    documents,
    chatMessages,
    myMessages,
    addMessage,
    deleteMessage,
    replyToStudent,
    getResponsesForMessage,
    addDocument,
    deleteDocument,
    sendChatMessage,
    getStats,
  } = useTeacher();

  const [tab, setTab] = useState("mensajes");
  const [replyText, setReplyText] = useState({});
  const [showReplyFor, setShowReplyFor] = useState(null);
  const [newMsgText, setNewMsgText] = useState("");
  const [newMsgPriority, setNewMsgPriority] = useState("normal");
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState("guia");
  const [newDocDesc, setNewDocDesc] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [filterRead, setFilterRead] = useState("all");

  if (!teacher) {
    return (
      <main className="section-page">
        <div className="empty-section">
          <p>Debes iniciar sesión como maestro.</p>
          <Link to="/login-maestro" className="btn-primary">Iniciar Sesión</Link>
        </div>
      </main>
    );
  }

  const stats = getStats();
  const unreadMsgs = studentMessages.filter(m => !m.read);
  const filteredMsgs = filterRead === "unread" ? unreadMsgs : filterRead === "read" ? studentMessages.filter(m => m.read) : studentMessages;

  function handleReply(msgId) {
    const text = replyText[msgId];
    if (!text?.trim()) return;
    replyToStudent(msgId, text.trim());
    setReplyText(prev => ({ ...prev, [msgId]: "" }));
    setShowReplyFor(null);
  }

  function handleAddMessage(e) {
    e.preventDefault();
    if (!newMsgText.trim()) return;
    addMessage(newMsgText.trim(), newMsgPriority);
    setNewMsgText("");
    setNewMsgPriority("normal");
  }

  function handleAddDoc(e) {
    e.preventDefault();
    if (!newDocName.trim()) return;
    addDocument(newDocName.trim(), newDocType, newDocDesc.trim());
    setNewDocName("");
    setNewDocDesc("");
  }

  function handleSendChat(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput.trim());
    setChatInput("");
  }

  const tabs = [
    { id: "mensajes", label: "📨 Mensajes de Alumnos", count: stats.unread },
    { id: "avisos", label: "📢 Mis Avisos", count: myMessages.length },
    { id: "docs", label: "📚 Documentos", count: stats.totalDocs },
    { id: "chat", label: "💬 Chat", count: stats.totalChats },
  ];

  return (
    <main className="section-page teacher-dashboard">
      <div className="section-page-header">
        <span className="section-icon">👩‍🏫</span>
        <h1>Panel de {teacher.name}</h1>
        <div className="section-line"></div>
      </div>

      <div className="teacher-stats">
        <div className="stat-card">
          <span className="stat-number">{stats.unread}</span>
          <span className="stat-label">Sin leer</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Mensajes</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.totalDocs}</span>
          <span className="stat-label">Documentos</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.totalChats}</span>
          <span className="stat-label">Chats</span>
        </div>
      </div>

      <div className="teacher-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`teacher-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.count > 0 && <span className="tab-badge">{t.count}</span>}
          </button>
        ))}
      </div>

      <div className="teacher-tab-content">
        {/* ---- MENSAJES DE ALUMNOS ---- */}
        {tab === "mensajes" && (
          <div className="teacher-section">
            <div className="section-controls">
              <h2>Mensajes de Alumnos</h2>
              <div className="filter-buttons">
                <button className={filterRead === "all" ? "active" : ""} onClick={() => setFilterRead("all")}>Todos</button>
                <button className={filterRead === "unread" ? "active" : ""} onClick={() => setFilterRead("unread")}>Sin leer ({stats.unread})</button>
                <button className={filterRead === "read" ? "active" : ""} onClick={() => setFilterRead("read")}>Leídos</button>
              </div>
            </div>

            {filteredMsgs.length === 0 ? (
              <p className="no-content">No hay mensajes {filterRead === "unread" ? "sin leer" : ""}.</p>
            ) : (
              <div className="messages-list">
                {filteredMsgs.map((msg) => {
                  const msgResponses = getResponsesForMessage(msg.id);
                  return (
                    <div key={msg.id} className={`student-message-card ${!msg.read ? "unread" : ""}`}>
                      <div className="msg-header">
                        <div className="msg-student">
                          <span className="student-avatar">🎓</span>
                          <div>
                            <strong>{msg.student}</strong>
                            <span className="msg-folio">Folio: {msg.folio}</span>
                          </div>
                        </div>
                        <span className="msg-date">{new Date(msg.createdAt).toLocaleDateString("es-MX")}</span>
                      </div>
                      <p className="msg-text">{msg.text}</p>

                      {msgResponses.length > 0 && (
                        <div className="msg-responses">
                          {msgResponses.map((r) => (
                            <div key={r.id} className="response-item">
                              <strong>Tu respuesta:</strong>
                              <p>{r.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="msg-actions">
                        {showReplyFor === msg.id ? (
                          <div className="reply-form">
                            <textarea
                              value={replyText[msg.id] || ""}
                              onChange={(e) => setReplyText(prev => ({ ...prev, [msg.id]: e.target.value }))}
                              placeholder="Escribe tu respuesta..."
                              rows={3}
                            />
                            <div className="reply-actions">
                              <button className="btn-primary btn-sm" onClick={() => handleReply(msg.id)}>Enviar</button>
                              <button className="btn-secondary btn-sm" onClick={() => setShowReplyFor(null)}>Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <button className="btn-reply" onClick={() => setShowReplyFor(msg.id)}>
                            💬 Responder
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ---- MIS AVISOS ---- */}
        {tab === "avisos" && (
          <div className="teacher-section">
            <h2>Mis Avisos</h2>

            <form className="add-form" onSubmit={handleAddMessage}>
              <textarea
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                placeholder="Escribe un aviso para tus alumnos..."
                rows={3}
                required
              />
              <div className="form-row">
                <select value={newMsgPriority} onChange={(e) => setNewMsgPriority(e.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="urgente">Urgente</option>
                </select>
                <button type="submit" className="btn-primary">Publicar Aviso</button>
              </div>
            </form>

            {myMessages.length === 0 ? (
              <p className="no-content">Aún no has publicado avisos.</p>
            ) : (
              <div className="messages-list">
                {myMessages.map((msg) => (
                  <div key={msg.id} className={`teacher-msg-card ${msg.priority === "urgente" ? "urgent-card" : ""}`}>
                    <div className="teacher-msg-card-header">
                      <span className="teacher-msg-icon">👩‍🏫</span>
                      <div>
                        <strong>{msg.teacher}</strong>
                        <span className="teacher-msg-date">{new Date(msg.createdAt).toLocaleDateString("es-MX")}</span>
                      </div>
                      {msg.priority === "urgente" && <span className="urgent-badge">Urgente</span>}
                      <button className="btn-delete" onClick={() => deleteMessage(msg.id)} title="Eliminar">✕</button>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---- DOCUMENTOS ---- */}
        {tab === "docs" && (
          <div className="teacher-section">
            <h2>Mis Documentos</h2>

            <form className="add-form" onSubmit={handleAddDoc}>
              <input
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="Nombre del documento"
                required
              />
              <select value={newDocType} onChange={(e) => setNewDocType(e.target.value)}>
                <option value="guia">📖 Guía de Estudio</option>
                <option value="tarea">📝 Tarea</option>
                <option value="aviso">📢 Aviso</option>
                <option value="otro">📄 Otro</option>
              </select>
              <textarea
                value={newDocDesc}
                onChange={(e) => setNewDocDesc(e.target.value)}
                placeholder="Descripción (opcional)"
                rows={2}
              />
              <button type="submit" className="btn-primary">Subir Documento</button>
            </form>

            {documents.length === 0 ? (
              <p className="no-content">Aún no has subido documentos.</p>
            ) : (
              <div className="docs-grid">
                {documents.map((doc) => (
                  <div key={doc.id} className="doc-card">
                    <div className="doc-icon">
                      {doc.type === "guia" ? "📖" : doc.type === "tarea" ? "📝" : doc.type === "aviso" ? "📢" : "📄"}
                    </div>
                    <div className="doc-info">
                      <strong>{doc.name}</strong>
                      <p>{doc.description}</p>
                      <span className="doc-date">{new Date(doc.createdAt).toLocaleDateString("es-MX")}</span>
                    </div>
                    <button className="btn-delete" onClick={() => deleteDocument(doc.id)} title="Eliminar">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---- CHAT ---- */}
        {tab === "chat" && (
          <div className="teacher-section chat-section">
            <h2>💬 Chat con Alumnos</h2>

            <div className="chat-container">
              <div className="chat-messages">
                {chatMessages.length === 0 ? (
                  <p className="no-content">No hay mensajes en el chat.</p>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className={`chat-msg ${msg.senderType === "teacher" ? "own" : "other"}`}>
                      <div className="chat-msg-header">
                        <strong>{msg.sender}</strong>
                        <span>{new Date(msg.createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form className="chat-input" onSubmit={handleSendChat}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Escribe un mensaje..."
                />
                <button type="submit" className="btn-primary">Enviar</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
