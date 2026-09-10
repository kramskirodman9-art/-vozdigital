import { useState, useEffect } from "react";
import PostCard from "../components/PostCard";
import { demoPosts } from "../data/demoData";

const SKIP_FIREBASE = !import.meta.env.VITE_FIREBASE_CONFIGURED;

const POSTS_KEY = "vozdigital_posts";

function getLocalPosts() {
  try { return JSON.parse(localStorage.getItem(POSTS_KEY)) || []; } catch { return []; }
}

async function loadFirebasePosts(category) {
  if (SKIP_FIREBASE) return null;
  try {
    const { db } = await import("../config/firebase");
    const { collection, query, where, orderBy, onSnapshot } = await import("firebase/firestore");

    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 2000);

      const q = query(
        collection(db, "posts"),
        where("category", "==", category),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          clearTimeout(timeout);
          const posts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().createdAt?.toDate?.()
              ? doc.data().createdAt.toDate().toLocaleDateString("es-MX")
              : "Hoy",
          }));
          resolve(posts.length > 0 ? posts : null);
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

export default function SectionPage({ category, title, icon }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const localPosts = getLocalPosts();
      const allPosts = localPosts.length > 0 ? localPosts : demoPosts;
      const demoFiltered = allPosts.filter((p) => p.category === category);
      setPosts(demoFiltered);
      setLoading(false);

      const fbPosts = await loadFirebasePosts(category);
      if (fbPosts) {
        setPosts(fbPosts);
      }
    }
    load();
  }, [category]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Cargando {title}...</p>
      </div>
    );
  }

  return (
    <main className="section-page">
      <div className="section-page-header">
        <span className="section-icon">{icon}</span>
        <h1>{title}</h1>
        <div className="section-line"></div>
      </div>

      {posts.length > 0 ? (
        <div className="posts-grid">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="empty-section">
          <p>No hay publicaciones en esta sección aún.</p>
          <p>¡Sé el primero en escribir algo!</p>
        </div>
      )}
    </main>
  );
}
