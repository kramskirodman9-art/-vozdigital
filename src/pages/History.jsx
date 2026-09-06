import { useState, useEffect } from "react";
import PostCard from "../components/PostCard";
import { demoPosts } from "../data/demoData";

const SKIP_FIREBASE = !import.meta.env.VITE_FIREBASE_CONFIGURED;

async function loadAllPosts() {
  if (SKIP_FIREBASE) return null;
  try {
    const { db } = await import("../config/firebase");
    const { collection, query, orderBy, onSnapshot } = await import("firebase/firestore");
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 3000);
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snap) => {
        clearTimeout(timeout);
        const posts = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          date: d.data().createdAt?.toDate?.()
            ? d.data().createdAt.toDate().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })
            : "Sin fecha",
          rawDate: d.data().createdAt?.toDate?.() || null,
        }));
        resolve(posts.length > 0 ? posts : null);
        unsubscribe();
      }, () => { clearTimeout(timeout); resolve(null); });
    });
  } catch { return null; }
}

export default function History() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const demoFormatted = demoPosts.map((p) => ({
        ...p,
        rawDate: null,
      }));
      setPosts(demoFormatted);
      setLoading(false);

      const fbPosts = await loadAllPosts();
      if (fbPosts) setPosts(fbPosts);
    }
    load();
  }, []);

  const categories = [
    { value: "todos", label: "Todos" },
    { value: "noticia", label: "📰 Noticias" },
    { value: "anecdota", label: "📖 Anécdotas" },
    { value: "chiste", label: "😄 Chistes" },
    { value: "programa", label: "🎭 Programas" },
    { value: "galeria", label: "📸 Galería" },
  ];

  const filtered = posts.filter((p) => {
    const matchCategory = filter === "todos" || p.category === filter;
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.content?.toLowerCase().includes(search.toLowerCase()) ||
      p.author?.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando historial...</p>
      </div>
    );
  }

  return (
    <main className="section-page history-page">
      <div className="section-page-header">
        <span className="section-icon">📚</span>
        <h1>Historial</h1>
        <p className="history-subtitle">Todas las publicaciones de Voz Digital</p>
        <div className="section-line"></div>
      </div>

      <div className="history-filters">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, contenido o autor..."
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`filter-btn ${filter === cat.value ? "active" : ""}`}
              onClick={() => setFilter(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <p className="history-count">{filtered.length} publicación(es) encontrada(s)</p>

      {filtered.length > 0 ? (
        <div className="posts-grid">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="empty-section">
          <p>No se encontraron publicaciones.</p>
        </div>
      )}
    </main>
  );
}
