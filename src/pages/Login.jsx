import { useState } from "react";
import { useAuth } from "../contexts/useAuth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [mode, setMode] = useState("alumno");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [folio, setFolio] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginAdmin, registerAdmin, loginAlumno } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "alumno") {
        if (!folio.trim()) {
          setError("Ingresa tu folio.");
          setLoading(false);
          return;
        }
        await loginAlumno(folio.trim());
        navigate("/");
      } else {
        if (isRegister) {
          if (!displayName.trim()) {
            setError("Ingresa tu nombre.");
            setLoading(false);
            return;
          }
          await registerAdmin(email, password, displayName);
        } else {
          await loginAdmin(email, password);
        }
        navigate("/admin");
      }
    } catch (err) {
      if (mode === "alumno") {
        if (err.message === "Folio no registrado") {
          setError("Folio no registrado. Contacta al administrador.");
        } else {
          setError("Error al iniciar sesión.");
        }
      } else {
        if (err.message === "Credenciales incorrectas") {
          setError("Usuario o contraseña incorrectos.");
        } else if (err.code === "auth/user-not-found") {
          setError("No se encontró una cuenta con ese usuario.");
        } else if (err.code === "auth/wrong-password") {
          setError("Contraseña incorrecta.");
        } else if (err.code === "auth/email-already-in-use") {
          setError("Ya existe una cuenta con ese usuario.");
        } else if (err.code === "auth/weak-password") {
          setError("La contraseña debe tener al menos 6 caracteres.");
        } else {
          setError("Error al " + (isRegister ? "registrarse" : "iniciar sesión") + ".");
        }
      }
    }
    setLoading(false);
  }

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>{mode === "alumno" ? "Acceso de Alumno" : isRegister ? "Registro de Administrador" : "Acceso de Administrador"}</h1>
          <p>
            {mode === "alumno"
              ? "Ingresa con el folio de tu credencial"
              : isRegister
              ? "Crea tu cuenta de administrador"
              : "Ingresa para administrar Voz Digital"}
          </p>
        </div>

        <div className="login-mode-toggle">
          <button
            className={`mode-btn ${mode === "alumno" ? "active" : ""}`}
            onClick={() => { setMode("alumno"); setError(""); }}
          >
            🎓 Soy Alumno
          </button>
          <button
            className={`mode-btn ${mode === "admin" ? "active" : ""}`}
            onClick={() => { setMode("admin"); setError(""); }}
          >
            🔑 Soy Administrador
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === "alumno" ? (
            <div className="form-group">
              <label>Folio de Credencial</label>
              <input
                type="text"
                value={folio}
                onChange={(e) => setFolio(e.target.value)}
                placeholder="Ej: 12345"
                required
                autoFocus
              />
            </div>
          ) : (
            <>
              {isRegister && (
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label>Usuario</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu usuario"
                  required
                />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </>
          )}

          {error && <p className="form-error">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading
              ? "Cargando..."
              : mode === "alumno"
              ? "Entrar"
              : isRegister
              ? "Registrarse"
              : "Iniciar Sesión"}
          </button>
        </form>

        <div className="login-footer">
          {mode === "admin" && (
            <p>
              {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
              <button
                onClick={() => { setIsRegister(!isRegister); setError(""); }}
                className="link-button"
              >
                {isRegister ? "Iniciar Sesión" : "Registrarse"}
              </button>
            </p>
          )}
          <Link to="/" className="back-link">
            ← Volver al periódico
          </Link>
        </div>
      </div>
    </main>
  );
}
