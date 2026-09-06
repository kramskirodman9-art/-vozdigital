import { useState, useEffect } from "react";
import { useAuth } from "../contexts/useAuth";
import { useNavigate } from "react-router-dom";
import ImageUploader from "../components/ImageUploader";
import { containsBadWords } from "../utils/profanityFilter";
import { addTeacherMessage, deleteTeacherMessage, getTeacherMessages } from "../components/TeacherMessages";

const SKIP_FIREBASE = !import.meta.env.VITE_FIREBASE_CONFIGURED;

async function addPost(data) {
  if (SKIP_FIREBASE) return { id: Date.now().toString() };
  const { db } = await import("../config/firebase");
  const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
  const docRef = await addDoc(collection(db, "posts"), { ...data, createdAt: serverTimestamp() });
  return { id: docRef.id };
}

async function loadFolios() {
  if (SKIP_FIREBASE) return [];
  try {
    const { db } = await import("../config/firebase");
    const { collection, onSnapshot } = await import("firebase/firestore");
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve([]), 3000);
      const unsubscribe = onSnapshot(collection(db, "folios"), (snap) => {
        clearTimeout(timeout);
        resolve(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        unsubscribe();
      }, () => { clearTimeout(timeout); resolve([]); });
    });
  } catch { return []; }
}

async function addFoliosBulk(folios) {
  if (SKIP_FIREBASE) return folios.length;
  const { db } = await import("../config/firebase");
  const { collection, addDoc } = await import("firebase/firestore");
  let count = 0;
  for (const f of folios) {
    try { await addDoc(collection(db, "folios"), f); count++; } catch { /* skip */ }
  }
  return count;
}

async function deleteFolio(id) {
  if (SKIP_FIREBASE) return true;
  try {
    const { db } = await import("../config/firebase");
    const { doc, deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "folios", id));
    return true;
  } catch { return false; }
}

async function deletePost(id) {
  if (SKIP_FIREBASE) return true;
  try {
    const { db } = await import("../config/firebase");
    const { doc, deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "posts", id));
    return true;
  } catch { return false; }
}

async function loadPosts() {
  if (SKIP_FIREBASE) return [];
  try {
    const { db } = await import("../config/firebase");
    const { collection, query, orderBy, onSnapshot } = await import("firebase/firestore");
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve([]), 3000);
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snap) => {
        clearTimeout(timeout);
        resolve(snap.docs.map((d) => ({ id: d.id, ...d.data(), date: d.data().createdAt?.toDate?.() ? d.data().createdAt.toDate().toLocaleDateString("es-MX") : "Hoy" })));
        unsubscribe();
      }, () => { clearTimeout(timeout); resolve([]); });
    });
  } catch { return []; }
}

export default function Admin() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");

  if (!currentUser || userProfile?.role !== "admin") {
    return (
      <main className="admin-page">
        <div className="access-denied">
          <h2>Acceso Denegado</h2>
          <p>Solo los administradores pueden acceder a esta sección.</p>
          <button onClick={() => navigate("/")}>Volver al inicio</button>
        </div>
      </main>
    );
  }

  const tabs = [
    { id: "posts", label: "✍️ Publicaciones" },
    { id: "folios", label: "🎫 Folios" },
    { id: "users", label: "👥 Usuarios" },
    { id: "messages", label: "📢 Avisos" },
    { id: "polls", label: "📊 Encuestas" },
    { id: "merits", label: "🏆 Méritos" },
    { id: "events", label: "📅 Eventos" },
    { id: "questions", label: "❓ Preguntas" },
    { id: "stats", label: "📈 Visitas" },
  ];

  return (
    <main className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>⚙️ Panel de Administración</h1>
          <p>Gestiona Voz Digital</p>
        </div>

        <div className="admin-tabs">
          {tabs.map((t) => (
            <button key={t.id} className={`tab-btn ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "posts" && <PostsTab />}
        {activeTab === "folios" && <FoliosTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "messages" && <MessagesTab />}
        {activeTab === "polls" && <PollsTab />}
        {activeTab === "merits" && <MeritsTab />}
        {activeTab === "events" && <EventsTab />}
        {activeTab === "questions" && <QuestionsTab />}
        {activeTab === "stats" && <StatsTab />}
      </div>
    </main>
  );
}

function PostsTab() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState("noticia");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadPosts().then((p) => { if (p.length > 0) setPosts(p); }); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!title.trim() || !content.trim()) { setError("Título y contenido son obligatorios."); return; }
    if (containsBadWords(title) || containsBadWords(content)) { setError("El contenido contiene palabras no permitidas."); return; }
    setLoading(true);
    try {
      await addPost({ category, title: title.trim(), subtitle: subtitle.trim(), content: content.trim(), imageUrl: imageUrl || null, author: "Administrador" });
      setSuccess("¡Publicación creada!");
      setTitle(""); setSubtitle(""); setContent(""); setImageUrl(null);
      const updated = await loadPosts();
      if (updated.length > 0) setPosts(updated);
    } catch { setError("Error al publicar."); }
    setLoading(false);
  }

  async function handleDeletePost(id) { await deletePost(id); setPosts((prev) => prev.filter((p) => p.id !== id)); }

  const categories = [{ value: "noticia", label: "📰 Noticia" }, { value: "anecdota", label: "📖 Anécdota" }, { value: "chiste", label: "😄 Chiste" }, { value: "programa", label: "🎭 Programa" }, { value: "galeria", label: "📸 Galería" }];

  return (
    <div className="tab-content">
      <h2>Nueva Publicación</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group"><label>Categoría</label><select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
        <div className="form-group"><label>Título</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" required /></div>
        <div className="form-group"><label>Subtítulo</label><input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Subtítulo" /></div>
        <div className="form-group"><label>Imagen</label><ImageUploader onImageUploaded={setImageUrl} /></div>
        <div className="form-group"><label>Contenido</label><textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escribe aquí..." rows={10} required /></div>
        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}
        <button type="submit" disabled={loading} className="btn-primary btn-publish">{loading ? "Publicando..." : "📢 Publicar"}</button>
      </form>
      {posts.length > 0 && <>
        <h2 className="mt-2">Publicaciones ({posts.length})</h2>
        <div className="admin-list">{posts.map((p) => (<div key={p.id} className="admin-list-item"><div className="admin-list-info"><strong>{p.title}</strong><span>{p.category} — {p.date}</span></div><button className="btn-delete" onClick={() => handleDeletePost(p.id)}>Eliminar</button></div>))}</div>
      </>}
    </div>
  );
}

function FoliosTab() {
  const [folios, setFolios] = useState([]);
  const [bulkText, setBulkText] = useState("");
  const [singleFolio, setSingleFolio] = useState("");
  const [singleName, setSingleName] = useState("");
  const [singleGrade, setSingleGrade] = useState("");
  const [singleGroup, setSingleGroup] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadFolios().then((f) => { if (f.length > 0) setFolios(f); }); }, []);

  async function handleBulkUpload(e) {
    e.preventDefault(); setError(""); setSuccess(""); setLoading(true);
    const lines = bulkText.split("\n").filter((l) => l.trim());
    if (lines.length === 0) { setError("No hay folios."); setLoading(false); return; }
    const parsed = lines.map((line) => { const p = line.split(/[,\t;|]/).map((x) => x.trim()); return { folio: p[0] || "", name: p[1] || "", grade: p[2] || "", group: p[3] || "" }; }).filter((f) => f.folio);
    const count = await addFoliosBulk(parsed);
    setSuccess(`${count} folio(s) cargado(s).`); setBulkText("");
    const updated = await loadFolios(); if (updated.length > 0) setFolios(updated); setLoading(false);
  }

  async function handleAddSingle(e) {
    e.preventDefault(); setError(""); setSuccess("");
    if (!singleFolio.trim()) { setError("El folio es obligatorio."); return; }
    setLoading(true);
    await addFoliosBulk([{ folio: singleFolio.trim(), name: singleName.trim(), grade: singleGrade.trim(), group: singleGroup.trim() }]);
    setSuccess("Folio agregado."); setSingleFolio(""); setSingleName(""); setSingleGrade(""); setSingleGroup("");
    const updated = await loadFolios(); if (updated.length > 0) setFolios(updated); setLoading(false);
  }

  return (
    <div className="tab-content">
      <h2>Agregar Folio</h2>
      <form onSubmit={handleAddSingle} className="admin-form">
        <div className="form-row"><div className="form-group"><label>Folio</label><input type="text" value={singleFolio} onChange={(e) => setSingleFolio(e.target.value)} placeholder="12345" required /></div><div className="form-group"><label>Nombre</label><input type="text" value={singleName} onChange={(e) => setSingleName(e.target.value)} placeholder="Nombre" /></div></div>
        <div className="form-row"><div className="form-group"><label>Grado</label><input type="text" value={singleGrade} onChange={(e) => setSingleGrade(e.target.value)} placeholder="3ro" /></div><div className="form-group"><label>Grupo</label><input type="text" value={singleGroup} onChange={(e) => setSingleGroup(e.target.value)} placeholder="A" /></div></div>
        <button type="submit" disabled={loading} className="btn-primary">Agregar</button>
      </form>
      <h2 className="mt-2">Carga Masiva</h2>
      <p className="help-text">Formato: <code>folio, nombre, grado, grupo</code> (uno por línea)</p>
      <form onSubmit={handleBulkUpload} className="admin-form">
        <div className="form-group"><textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder={"12345, Juan Pérez, 3ro, A\n12346, María López, 2do, B"} rows={6} className="bulk-textarea" /></div>
        {error && <p className="form-error">{error}</p>}{success && <p className="form-success">{success}</p>}
        <button type="submit" disabled={loading} className="btn-primary">{loading ? "Cargando..." : "📤 Cargar"}</button>
      </form>
      {folios.length > 0 && <><h2 className="mt-2">Folios ({folios.length})</h2><div className="admin-list">{folios.map((f) => (<div key={f.id} className="admin-list-item"><div className="admin-list-info"><strong>Folio: {f.folio}</strong><span>{f.name || "Sin nombre"} — {f.grade || "?"}° {f.group || "?"}</span></div><button className="btn-delete" onClick={async () => { await deleteFolio(f.id); setFolios((prev) => prev.filter((x) => x.id !== f.id)); }}>Eliminar</button></div>))}</div></>}
    </div>
  );
}

function UsersTab() {
  const [folios, setFolios] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFolios().then((f) => { setFolios(f); setLoading(false); }); }, []);

  const filtered = folios.filter((f) => { const t = search.toLowerCase(); return f.folio?.toLowerCase().includes(t) || f.name?.toLowerCase().includes(t) || f.grade?.toLowerCase().includes(t) || f.group?.toLowerCase().includes(t); });

  return (
    <div className="tab-content">
      <h2>Gestionar Usuarios</h2>
      <div className="form-group"><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por folio, nombre, grado o grupo..." className="search-input" /></div>
      {loading ? <p className="no-content">Cargando...</p> : filtered.length > 0 ? (
        <div className="admin-list">{filtered.map((f) => (<div key={f.id} className="admin-list-item"><div className="admin-list-info"><strong>{f.name || "Sin nombre"}</strong><span>Folio: {f.folio} — {f.grade || "?"}° {f.group || "?"}</span></div><button className="btn-delete" onClick={async () => { await deleteFolio(f.id); setFolios((prev) => prev.filter((x) => x.id !== f.id)); }}>Eliminar</button></div>))}</div>
      ) : <p className="no-content">No se encontraron usuarios.</p>}
    </div>
  );
}

function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [teacherName, setTeacherName] = useState("");
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("normal");
  const [success, setSuccess] = useState("");

  useEffect(() => { setMessages(getTeacherMessages()); }, []);

  function handleAdd(e) {
    e.preventDefault(); setSuccess("");
    if (!teacherName.trim() || !text.trim()) return;
    const updated = addTeacherMessage({ teacher: teacherName.trim(), text: text.trim(), priority });
    setMessages(updated); setTeacherName(""); setText(""); setSuccess("Aviso publicado.");
  }

  function handleDelete(id) {
    const updated = deleteTeacherMessage(id);
    setMessages(updated);
  }

  return (
    <div className="tab-content">
      <h2>Publicar Aviso de Maestro</h2>
      <form onSubmit={handleAdd} className="admin-form">
        <div className="form-row"><div className="form-group"><label>Nombre del Maestro</label><input type="text" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="Mtra. García" required /></div><div className="form-group"><label>Prioridad</label><select value={priority} onChange={(e) => setPriority(e.target.value)}><option value="normal">Normal</option><option value="urgente">Urgente</option></select></div></div>
        <div className="form-group"><label>Mensaje</label><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Aviso importante para los alumnos..." rows={4} required /></div>
        {success && <p className="form-success">{success}</p>}
        <button type="submit" className="btn-primary">📢 Publicar Aviso</button>
      </form>
      {messages.length > 0 && <><h2 className="mt-2">Avisos Publicados</h2><div className="admin-list">{messages.map((m) => (<div key={m.id} className="admin-list-item"><div className="admin-list-info"><strong>{m.teacher} {m.priority === "urgente" ? "🔴" : ""}</strong><span>{m.text.substring(0, 80)}...</span></div><button className="btn-delete" onClick={() => handleDelete(m.id)}>Eliminar</button></div>))}</div></>}
    </div>
  );
}

function PollsTab() {
  const [polls, setPolls] = useState([]);
  const [question, setQuestion] = useState("");
  const [optionsText, setOptionsText] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    try { setPolls(JSON.parse(localStorage.getItem("vozdigital_polls")) || []); } catch { setPolls([]); }
  }, []);

  function handleAdd(e) {
    e.preventDefault(); setSuccess("");
    if (!question.trim() || !optionsText.trim()) return;
    const opts = optionsText.split("\n").filter((l) => l.trim()).map((t, i) => ({ id: `opt-${Date.now()}-${i}`, text: t.trim(), votes: 0 }));
    if (opts.length < 2) return;
    const newPoll = { id: `poll-${Date.now()}`, question: question.trim(), options: opts, createdAt: new Date().toISOString(), active: true };
    const updated = [newPoll, ...polls];
    setPolls(updated);
    localStorage.setItem("vozdigital_polls", JSON.stringify(updated));
    setQuestion(""); setOptionsText(""); setSuccess("Encuesta creada.");
  }

  function toggleActive(id) {
    const updated = polls.map((p) => p.id === id ? { ...p, active: !p.active } : p);
    setPolls(updated);
    localStorage.setItem("vozdigital_polls", JSON.stringify(updated));
  }

  return (
    <div className="tab-content">
      <h2>Crear Encuesta</h2>
      <form onSubmit={handleAdd} className="admin-form">
        <div className="form-group"><label>Pregunta</label><input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="¿Qué prefieres?" required /></div>
        <div className="form-group"><label>Opciones (una por línea)</label><textarea value={optionsText} onChange={(e) => setOptionsText(e.target.value)} placeholder={"Opción 1\nOpción 2\nOpción 3"} rows={4} /></div>
        {success && <p className="form-success">{success}</p>}
        <button type="submit" className="btn-primary">📊 Crear Encuesta</button>
      </form>
      {polls.length > 0 && <><h2 className="mt-2">Encuestas</h2><div className="admin-list">{polls.map((p) => (<div key={p.id} className="admin-list-item"><div className="admin-list-info"><strong>{p.question}</strong><span>{p.options.length} opciones — {p.active ? "🟢 Activa" : "🔴 Inactiva"}</span></div><button className="btn-delete" onClick={() => toggleActive(p.id)}>{p.active ? "Desactivar" : "Activar"}</button></div>))}</div></>}
    </div>
  );
}

function MeritsTab() {
  const [merits, setMerits] = useState([]);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [group, setGroup] = useState("");
  const [reason, setReason] = useState("");
  const [type, setType] = useState("academico");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    try { setMerits(JSON.parse(localStorage.getItem("vozdigital_merits")) || []); } catch { setMerits([]); }
  }, []);

  function handleAdd(e) {
    e.preventDefault(); setSuccess("");
    if (!name.trim() || !reason.trim()) return;
    const newM = { id: `m-${Date.now()}`, name: name.trim(), grade: grade.trim(), group: group.trim(), reason: reason.trim(), type, date: new Date().toISOString().split("T")[0] };
    const updated = [newM, ...merits];
    setMerits(updated);
    localStorage.setItem("vozdigital_merits", JSON.stringify(updated));
    setName(""); setGrade(""); setGroup(""); setReason(""); setSuccess("Reconocimiento agregado.");
  }

  function handleDelete(id) {
    const updated = merits.filter((m) => m.id !== id);
    setMerits(updated);
    localStorage.setItem("vozdigital_merits", JSON.stringify(updated));
  }

  return (
    <div className="tab-content">
      <h2>Agregar Reconocimiento</h2>
      <form onSubmit={handleAdd} className="admin-form">
        <div className="form-row"><div className="form-group"><label>Nombre</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required /></div><div className="form-group"><label>Tipo</label><select value={type} onChange={(e) => setType(e.target.value)}><option value="academico">📚 Académico</option><option value="deportivo">⚽ Deportivo</option><option value="maestro">👩‍🏫 Maestro</option><option value="goodAct">🌟 Buen Acto</option></select></div></div>
        <div className="form-row"><div className="form-group"><label>Grado</label><input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="3ro" /></div><div className="form-group"><label>Grupo</label><input type="text" value={group} onChange={(e) => setGroup(e.target.value)} placeholder="A" /></div></div>
        <div className="form-group"><label>Motivo</label><input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Razón del reconocimiento" required /></div>
        {success && <p className="form-success">{success}</p>}
        <button type="submit" className="btn-primary">🏆 Agregar</button>
      </form>
      {merits.length > 0 && <><h2 className="mt-2">Reconocimientos ({merits.length})</h2><div className="admin-list">{merits.map((m) => (<div key={m.id} className="admin-list-item"><div className="admin-list-info"><strong>{m.name}</strong><span>{m.reason} — {m.date}</span></div><button className="btn-delete" onClick={() => handleDelete(m.id)}>Eliminar</button></div>))}</div></>}
    </div>
  );
}

function EventsTab() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("evento");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    try { setEvents(JSON.parse(localStorage.getItem("vozdigital_events")) || []); } catch { setEvents([]); }
  }, []);

  function handleAdd(e) {
    e.preventDefault(); setSuccess("");
    if (!title.trim() || !date) return;
    const newE = { id: `e-${Date.now()}`, title: title.trim(), date, time: time.trim(), location: location.trim(), description: description.trim(), type };
    const updated = [newE, ...events];
    setEvents(updated);
    localStorage.setItem("vozdigital_events", JSON.stringify(updated));
    setTitle(""); setDate(""); setTime(""); setLocation(""); setDescription(""); setSuccess("Evento creado.");
  }

  function handleDelete(id) {
    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    localStorage.setItem("vozdigital_events", JSON.stringify(updated));
  }

  return (
    <div className="tab-content">
      <h2>Crear Evento</h2>
      <form onSubmit={handleAdd} className="admin-form">
        <div className="form-row"><div className="form-group"><label>Título</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required /></div><div className="form-group"><label>Tipo</label><select value={type} onChange={(e) => setType(e.target.value)}><option value="evento">Evento</option><option value="academico">Académico</option></select></div></div>
        <div className="form-row"><div className="form-group"><label>Fecha</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div><div className="form-group"><label>Hora</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div></div>
        <div className="form-group"><label>Lugar</label><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Auditorio" /></div>
        <div className="form-group"><label>Descripción</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
        {success && <p className="form-success">{success}</p>}
        <button type="submit" className="btn-primary">📅 Crear Evento</button>
      </form>
      {events.length > 0 && <><h2 className="mt-2">Eventos ({events.length})</h2><div className="admin-list">{events.map((ev) => (<div key={ev.id} className="admin-list-item"><div className="admin-list-info"><strong>{ev.title}</strong><span>{ev.date} {ev.time} — {ev.location}</span></div><button className="btn-delete" onClick={() => handleDelete(ev.id)}>Eliminar</button></div>))}</div></>}
    </div>
  );
}

function QuestionsTab() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    try { setQuestions(JSON.parse(localStorage.getItem("vozdigital_questions")) || []); } catch { setQuestions([]); }
  }, []);

  function handleAnswer(id) {
    if (!answers[id]?.trim()) return;
    const updated = questions.map((q) => q.id === id ? { ...q, answer: answers[id].trim(), answeredBy: "Director" } : q);
    setQuestions(updated);
    localStorage.setItem("vozdigital_questions", JSON.stringify(updated));
    setAnswers((prev) => ({ ...prev, [id]: "" }));
  }

  const pending = questions.filter((q) => !q.answer);
  const answered = questions.filter((q) => q.answer);

  return (
    <div className="tab-content">
      <h2>Preguntas Pendientes ({pending.length})</h2>
      {pending.length > 0 ? pending.map((q) => (
        <div key={q.id} className="admin-question-card">
          <p className="question-text"><strong>{q.author}:</strong> {q.text}</p>
          <div className="answer-row">
            <input type="text" value={answers[q.id] || ""} onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))} placeholder="Escribe tu respuesta..." />
            <button className="btn-primary" onClick={() => handleAnswer(q.id)}>Responder</button>
          </div>
        </div>
      )) : <p className="no-content">No hay preguntas pendientes.</p>}

      {answered.length > 0 && <><h2 className="mt-2">Respondidas ({answered.length})</h2>{answered.map((q) => (<div key={q.id} className="admin-question-card answered"><p><strong>{q.author}:</strong> {q.text}</p><p className="answer-text">💬 {q.answer}</p></div>))}</>}
    </div>
  );
}

function StatsTab() {
  const [visits, setVisits] = useState({});

  useEffect(() => {
    try { setVisits(JSON.parse(localStorage.getItem("vozdigital_visits")) || {}); } catch { setVisits({}); }
  }, []);

  function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d.toISOString().split("T")[0]); }
    return days;
  }

  const days = getLast7Days();
  const maxV = Math.max(...days.map((d) => visits[d] || 0), 1);
  const totalWeek = days.reduce((sum, d) => sum + (visits[d] || 0), 0);

  return (
    <div className="tab-content">
      <h2>📈 Gráfica Semanal de Visitas</h2>
      <div className="stats-summary">
        <div className="stat-card"><span className="stat-number">{totalWeek}</span><span className="stat-label">Visitas esta semana</span></div>
        <div className="stat-card"><span className="stat-number">{Math.round(totalWeek / 7)}</span><span className="stat-label">Promedio diario</span></div>
        <div className="stat-card"><span className="stat-number">{Object.keys(visits).length}</span><span className="stat-label">Días con actividad</span></div>
      </div>
      <div className="chart-container"><div className="chart-bars">{days.map((day) => { const count = visits[day] || 0; const pct = maxV > 0 ? (count / maxV) * 100 : 0; const dayName = new Date(day + "T12:00:00").toLocaleDateString("es-MX", { weekday: "short" }); return (<div key={day} className="chart-bar-col"><div className="chart-bar-value">{count}</div><div className="chart-bar-wrapper"><div className="chart-bar" style={{ height: `${Math.max(pct, 4)}%` }}></div></div><div className="chart-bar-label">{dayName}</div></div>); })}</div></div>
    </div>
  );
}
