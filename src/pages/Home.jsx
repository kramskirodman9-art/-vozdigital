import { useState, useEffect } from "react";
import PostCard from "../components/PostCard";
import AdBanner from "../components/AdBanner";
import TeacherMessages from "../components/TeacherMessages";
import { demoPosts, demoBirthdays, demoAds, funFacts } from "../data/demoData";

const SKIP_FIREBASE = !import.meta.env.VITE_FIREBASE_CONFIGURED;

const POSTS_KEY = "vozdigital_posts";

function getLocalPosts() {
  try { return JSON.parse(localStorage.getItem(POSTS_KEY)) || []; } catch { return []; }
}

async function loadFirebasePosts() {
  if (SKIP_FIREBASE) return null;
  try {
    const { db } = await import("../config/firebase");
    const { collection, query, orderBy, limit, onSnapshot } = await import("firebase/firestore");
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 2000);
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(10));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        clearTimeout(timeout);
        const posts = snapshot.docs.map((doc) => ({
          id: doc.id, ...doc.data(),
          date: doc.data().createdAt?.toDate?.() ? doc.data().createdAt.toDate().toLocaleDateString("es-MX") : "Hoy",
        }));
        resolve(posts.length > 0 ? posts : null);
        unsubscribe();
      }, () => { clearTimeout(timeout); resolve(null); });
    });
  } catch { return null; }
}

async function loadFirebaseBirthdays() {
  if (SKIP_FIREBASE) return [];
  try {
    const { db } = await import("../config/firebase");
    const { collection, query, onSnapshot } = await import("firebase/firestore");
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve([]), 2000);
      const q = query(collection(db, "birthdays"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        clearTimeout(timeout);
        resolve(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        unsubscribe();
      }, () => { clearTimeout(timeout); resolve([]); });
    });
  } catch { return []; }
}

export default function Home() {
  const [allPosts, setAllPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [ads, setAds] = useState([]);
  const [fact] = useState(() => funFacts[Math.floor(Math.random() * funFacts.length)]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      const localPosts = getLocalPosts();
      const posts = localPosts.length > 0 ? localPosts : demoPosts;
      setAllPosts(posts);
      setFeaturedPosts(posts.slice(0, 1));
      setLatestPosts(posts.slice(1, 5));
      setAds(demoAds);

      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      const todayB = demoBirthdays.filter((b) => {
        const bdate = new Date(b.date);
        return bdate.getMonth() + 1 === month && bdate.getDate() === day;
      });
      if (todayB.length > 0) setBirthdays(todayB);
      setLoading(false);

      const fbPosts = await loadFirebasePosts();
      if (fbPosts) { setAllPosts(fbPosts); setFeaturedPosts(fbPosts.slice(0, 1)); setLatestPosts(fbPosts.slice(1, 5)); setAds([]); }

      const fbBirthdays = await loadFirebaseBirthdays();
      if (fbBirthdays.length > 0) {
        const todayFB = fbBirthdays.filter((b) => { const bdate = new Date(b.date); return bdate.getMonth() + 1 === month && bdate.getDate() === day; });
        if (todayFB.length > 0) setBirthdays(todayFB);
      }
    }
    load();
  }, []);

  const searchResults = searchQuery ? allPosts.filter((p) => p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.content?.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  if (loading) return <div className="loading-screen"><div className="loading-spinner"></div><p>Cargando edición...</p></div>;

  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">📰 Periódico Digital Escolar</div>
          <h1 className="hero-title">
            <span className="hero-title-accent">Voz</span> Digital
          </h1>
          <p className="hero-tagline">Tu voz, nuestra plataforma. El periódico del Esc. Benemérito.</p>

          <div className="hero-cards">
            <div className="hero-card">
              <span className="hero-card-icon">🎙️</span>
              <h3>Voz</h3>
              <p>Representa la expresión, la participación ciudadana escolar y el derecho de los alumnos a opinar, debatir y comunicar sus ideas.</p>
            </div>
            <div className="hero-card">
              <span className="hero-card-icon">💻</span>
              <h3>Digital</h3>
              <p>Transiciona del tradicional periódico mural a una plataforma web accesible en cualquier momento desde cualquier dispositivo.</p>
            </div>
          </div>

          <div className="hero-objective">
            <h3>📌 Objetivo</h3>
            <p>Diseñar, desarrollar y desplegar la plataforma web "Voz Digital", un periódico escolar interactivo que facilite la difusión de noticias y permita a los estudiantes participar activamente mediante un módulo de comentarios e interacción social.</p>
          </div>
        </div>
      </section>

      {searchQuery ? (
        <section className="search-results">
          <div className="section-header">
            <h2>🔍 Resultados para "{searchQuery}"</h2>
            <div className="section-line"></div>
          </div>
          <button className="search-clear-btn" onClick={() => setSearchQuery("")}>✕ Limpiar búsqueda</button>
          {searchResults.length > 0 ? (
            <div className="posts-grid">{searchResults.map((post) => <PostCard key={post.id} post={post} />)}</div>
          ) : <p className="no-content">No se encontraron resultados.</p>}
        </section>
      ) : (
        <>
          {birthdays.length > 0 && (
            <section className="birthday-banner">
              <div className="birthday-content">
                <span className="birthday-icon">🎂</span>
                <div><h3>¡Feliz Cumpleaños!</h3><p>{birthdays.map((b) => b.name).join(", ")}</p></div>
                <span className="birthday-icon">🎂</span>
              </div>
            </section>
          )}

          <TeacherMessages showSidebar={true} />

          {ads.length > 0 && <div className="top-ads"><AdBanner ad={ads[0]} /></div>}

          {featuredPosts.length > 0 && (
            <section className="featured-section">
              <div className="section-header"><h2>Titular</h2><div className="section-line"></div></div>
              <PostCard post={featuredPosts[0]} />
            </section>
          )}

          <div className="home-grid">
            <section className="latest-section">
              <div className="section-header"><h2>Últimas Publicaciones</h2><div className="section-line"></div></div>
              {latestPosts.length > 0 ? (
                <div className="posts-grid">
                  {latestPosts.map((post, idx) => (
                    <div key={post.id}>
                      <PostCard post={post} />
                      {idx === 1 && ads.length > 1 && <div className="inline-ad"><AdBanner ad={ads[1]} /></div>}
                    </div>
                  ))}
                </div>
              ) : <p className="no-content">Aún no hay publicaciones. ¡Sé el primero en escribir!</p>}
            </section>

            <aside className="sidebar">
              <div className="sidebar-box">
                <h3>🔍 Buscar</h3>
                <div className="sidebar-search">
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar publicaciones..." />
                </div>
              </div>

              <div className="sidebar-box">
                <h3>Secciones</h3>
                <ul className="sidebar-links">
                  <li><a href="/noticias">📰 Noticias</a></li>
                  <li><a href="/anecdotas">📖 Anécdotas</a></li>
                  <li><a href="/chistes">😄 Chistes</a></li>
                  <li><a href="/programas">🎭 Programas</a></li>
                  <li><a href="/cumpleanos">🎂 Cumpleaños</a></li>
                  <li><a href="/galeria">📸 Galería</a></li>
                  <li><a href="/historial">📚 Historial</a></li>
                </ul>
              </div>

              {ads.length > 2 && <div className="sidebar-ad"><AdBanner ad={ads[2]} /></div>}

              <div className="sidebar-box">
                <h3>Dato del día</h3>
                <p className="fun-fact">&ldquo;{fact.text}&rdquo;</p>
                <p className="fact-author">— {fact.author}</p>
              </div>
            </aside>
          </div>
        </>
      )}
    </main>
  );
}
