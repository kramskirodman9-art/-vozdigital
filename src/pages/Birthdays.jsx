import { useState, useEffect } from "react";
import { useAuth } from "../contexts/useAuth";
import { containsBadWords } from "../utils/profanityFilter";
import { demoBirthdays } from "../data/demoData";

const SKIP_FIREBASE = !import.meta.env.VITE_FIREBASE_CONFIGURED;

async function loadFirebaseBirthdays() {
  if (SKIP_FIREBASE) return null;
  try {
    const { db } = await import("../config/firebase");
    const { collection, query, orderBy, onSnapshot } = await import("firebase/firestore");

    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 2000);

      const q = query(collection(db, "birthdays"), orderBy("date", "asc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          clearTimeout(timeout);
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          resolve(items.length > 0 ? items : null);
          unsubscribe();
        },
        () => {
          clearTimeout(timeout);
          resolve(null);
        }
      );
    });
  } catch {
    return null;
  }
}

async function addFirebaseBirthday(data) {
  if (SKIP_FIREBASE) return false;
  try {
    const { db } = await import("../config/firebase");
    const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
    await addDoc(collection(db, "birthdays"), { ...data, createdAt: serverTimestamp() });
    return true;
  } catch {
    return false;
  }
}

async function deleteFirebaseBirthday(id) {
  if (SKIP_FIREBASE) return false;
  try {
    const { db } = await import("../config/firebase");
    const { doc, deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "birthdays", id));
    return true;
  } catch {
    return false;
  }
}

export default function Birthdays() {
  const { currentUser, userProfile } = useAuth();
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [grade, setGrade] = useState("");
  const [type, setType] = useState("alumno");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function load() {
      setBirthdays(demoBirthdays);
      setLoading(false);

      const fbBirthdays = await loadFirebaseBirthdays();
      if (fbBirthdays) {
        setBirthdays(fbBirthdays);
      }
    }
    load();
  }, []);

  function getMonthDay(dateStr) {
    const d = new Date(dateStr);
    return { month: d.getMonth(), day: d.getDate() };
  }

  function isBirthdayToday(dateStr) {
    const today = new Date();
    const { month, day } = getMonthDay(dateStr);
    return today.getMonth() === month && today.getDate() === day;
  }

  function isBirthdayThisMonth(dateStr) {
    const today = new Date();
    const { month } = getMonthDay(dateStr);
    return today.getMonth() === month;
  }

  async function handleAddBirthday(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !date) {
      setError("Nombre y fecha son obligatorios.");
      return;
    }

    if (containsBadWords(name)) {
      setError("El nombre contiene palabras no permitidas.");
      return;
    }

    const success = await addFirebaseBirthday({
      name: name.trim(),
      date,
      grade: grade.trim(),
      type,
      createdBy: currentUser?.uid || "anonymous",
    });

    if (success || SKIP_FIREBASE) {
      setBirthdays((prev) => [...prev, { id: Date.now().toString(), name: name.trim(), date, grade: grade.trim(), type }]);
      setSuccess("¡Cumpleaños agregado!");
      setName("");
      setDate("");
      setGrade("");
      setShowForm(false);
    } else {
      setError("Error al guardar.");
    }
  }

  async function handleDelete(id) {
    await deleteFirebaseBirthday(id);
    setBirthdays((prev) => prev.filter((b) => b.id !== id));
  }

  const todayBirthdays = birthdays.filter((b) => isBirthdayToday(b.date));
  const monthBirthdays = birthdays.filter(
    (b) => isBirthdayThisMonth(b.date) && !isBirthdayToday(b.date)
  );

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando cumpleaños...</p>
      </div>
    );
  }

  return (
    <main className="section-page birthdays-page">
      <div className="section-page-header">
        <span className="section-icon">🎂</span>
        <h1>Cumpleaños</h1>
        <div className="section-line"></div>
      </div>

      {currentUser && userProfile?.role === "admin" && (
        <div className="admin-actions">
          <button
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancelar" : "+ Agregar Cumpleaños"}
          </button>
        </div>
      )}

      {showForm && (
        <form className="birthday-form" onSubmit={handleAddBirthday}>
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del cumpleañero"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Fecha de Cumpleaños</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Grado/Grupo (opcional)</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Ej: 3ro A"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="alumno">Alumno</option>
              <option value="asesor">Asesor</option>
            </select>
          </div>
          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}
          <button type="submit" className="btn-primary">
            Guardar
          </button>
        </form>
      )}

      {todayBirthdays.length > 0 && (
        <div className="birthday-section today">
          <h2>🎉 ¡Hoy Celebramos!</h2>
          <div className="birthday-cards">
            {todayBirthdays.map((b) => (
              <div key={b.id} className="birthday-card today-card">
                <div className="birthday-confetti">🎂</div>
                <h3>{b.name}</h3>
                {b.grade && <p>{b.grade}</p>}
                <span className={`badge badge-${b.type}`}>
                  {b.type === "alumno" ? "Alumno" : "Asesor"}
                </span>
                {currentUser && userProfile?.role === "admin" && (
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(b.id)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {monthBirthdays.length > 0 && (
        <div className="birthday-section this-month">
          <h2>📅 Este Mes</h2>
          <div className="birthday-cards">
            {monthBirthdays.map((b) => {
              const { day } = getMonthDay(b.date);
              return (
                <div key={b.id} className="birthday-card">
                  <div className="birthday-date-circle">
                    <span className="day">{day}</span>
                  </div>
                  <h3>{b.name}</h3>
                  {b.grade && <p>{b.grade}</p>}
                  <span className={`badge badge-${b.type}`}>
                    {b.type === "alumno" ? "Alumno" : "Asesor"}
                  </span>
                  {currentUser && userProfile?.role === "admin" && (
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(b.id)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {birthdays.length === 0 && (
        <div className="empty-section">
          <p>No hay cumpleaños registrados.</p>
          <p>¡Agrega el primero!</p>
        </div>
      )}
    </main>
  );
}
