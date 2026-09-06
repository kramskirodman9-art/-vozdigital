import { useState } from "react";
import { useAuth } from "../contexts/useAuth";
import { containsBadWords } from "../utils/profanityFilter";

const SKIP_FIREBASE = !import.meta.env.VITE_FIREBASE_CONFIGURED;

async function addComment(postId, data) {
  if (SKIP_FIREBASE) return { id: Date.now().toString(), ...data };
  const { db } = await import("../config/firebase");
  const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
  const docRef = await addDoc(collection(db, "posts", postId, "comments"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ...data };
}

async function deleteComment(postId, commentId) {
  if (SKIP_FIREBASE) return true;
  try {
    const { db } = await import("../config/firebase");
    const { doc, deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "posts", postId, "comments", commentId));
    return true;
  } catch { return false; }
}

export default function PostCard({ post, showComments = true }) {
  const { userProfile } = useAuth();
  const [comments, setComments] = useState(post.comments || []);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentName, setCommentName] = useState("");
  const [commentGrade, setCommentGrade] = useState("");
  const [commentGroup, setCommentGroup] = useState("");
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const isAdmin = userProfile?.role === "admin";

  const categoryColors = {
    noticia: "#1a365d",
    anecdota: "#2d5016",
    chiste: "#8b5a00",
    programa: "#5a1a5a",
    cumpleano: "#c41e3a",
    galeria: "#0e7490",
  };

  const categoryLabels = {
    noticia: "Noticia",
    anecdota: "Anécdota",
    chiste: "Chiste",
    programa: "Programa Especial",
    cumpleano: "Cumpleaños",
    galeria: "Galería",
  };

  function handleDownloadImage() {
    if (!post.imageUrl) return;
    const link = document.createElement("a");
    link.href = post.imageUrl;
    link.download = `${post.title || "imagen"}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleShare(platform) {
    const url = window.location.href;
    const text = `${post.title || "Voz Digital"} - Lee más en`;
    let shareUrl = "";

    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url).catch(() => {});
        setShowShareMenu(false);
        return;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
    setShowShareMenu(false);
  }

  async function handleAddComment(e) {
    e.preventDefault();
    setError("");

    if (!commentText.trim()) return;

    if (!commentName.trim()) {
      setError("Debes ingresar tu nombre.");
      return;
    }

    if (containsBadWords(commentText) || containsBadWords(commentName)) {
      setError("El comentario contiene palabras no permitidas.");
      return;
    }

    setLoading(true);
    try {
      const commentData = {
        text: commentText.trim(),
        author: commentName.trim(),
        grade: commentGrade.trim(),
        group: commentGroup.trim(),
      };

      const saved = await addComment(post.id, commentData);
      setComments((prev) => [...prev, saved]);
      setCommentText("");
      setCommentName("");
      setCommentGrade("");
      setCommentGroup("");
      setShowCommentBox(false);
    } catch {
      setError("Error al publicar comentario.");
    }
    setLoading(false);
  }

  async function handleDeleteComment(commentId) {
    await deleteComment(post.id, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  return (
    <article className="post-card">
      {post.category && (
        <span
          className="post-category"
          style={{ backgroundColor: categoryColors[post.category] || "#333" }}
        >
          {categoryLabels[post.category] || post.category}
        </span>
      )}

      {post.imageUrl && (
        <div className="post-image-container">
          <img src={post.imageUrl} alt={post.title || "Imagen"} className="post-image" loading="lazy" />
        </div>
      )}

      <div className="post-content">
        {post.title && <h2 className="post-title">{post.title}</h2>}

        {post.author && (
          <p className="post-author">
            Por <strong>{post.author}</strong>
            {post.date && <span> — {post.date}</span>}
          </p>
        )}

        {post.subtitle && <h3 className="post-subtitle">{post.subtitle}</h3>}
        <p className="post-text">{post.content || post.text}</p>

        <div className="post-actions">
          {post.imageUrl && (
            <button className="btn-download" onClick={handleDownloadImage}>
              📥 Descargar imagen
            </button>
          )}

          <div className="share-container">
            <button className="btn-share" onClick={() => setShowShareMenu(!showShareMenu)}>
              🔗 Compartir
            </button>
            {showShareMenu && (
              <div className="share-menu">
                <button onClick={() => handleShare("whatsapp")}>💬 WhatsApp</button>
                <button onClick={() => handleShare("facebook")}>📘 Facebook</button>
                <button onClick={() => handleShare("twitter")}>🐦 Twitter</button>
                <button onClick={() => handleShare("copy")}>📋 Copiar enlace</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showComments && (
        <div className="post-comments-section">
          <button
            className="comments-toggle"
            onClick={() => setShowCommentBox(!showCommentBox)}
          >
            💬 Comentarios ({comments.length})
          </button>

          {comments.length > 0 && (
            <div className="comments-list">
              {comments.map((comment, idx) => (
                <div key={comment.id || idx} className="comment">
                  <div className="comment-header">
                    <strong>{comment.author}</strong>
                    {comment.grade && comment.group && (
                      <span className="comment-meta">
                        {comment.grade}° {comment.group}
                      </span>
                    )}
                    {isAdmin && (
                      <button className="btn-delete-comment" onClick={() => handleDeleteComment(comment.id)}>
                        ✕
                      </button>
                    )}
                  </div>
                  <p>{comment.text}</p>
                </div>
              ))}
            </div>
          )}

          {showCommentBox && (
            <form className="comment-form" onSubmit={handleAddComment}>
              <div className="comment-form-row">
                <input
                  type="text"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="Tu nombre"
                  className="comment-input"
                  required
                />
                <input
                  type="text"
                  value={commentGrade}
                  onChange={(e) => setCommentGrade(e.target.value)}
                  placeholder="Grado"
                  className="comment-input-small"
                />
                <input
                  type="text"
                  value={commentGroup}
                  onChange={(e) => setCommentGroup(e.target.value)}
                  placeholder="Grupo"
                  className="comment-input-small"
                />
              </div>

              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe tu comentario..."
                rows={3}
                required
              />
              {error && <p className="comment-error">{error}</p>}
              <button type="submit" disabled={loading} className="btn-comment">
                {loading ? "Publicando..." : "Publicar comentario"}
              </button>
            </form>
          )}
        </div>
      )}
    </article>
  );
}
