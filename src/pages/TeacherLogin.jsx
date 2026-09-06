import { useState } from "react";
import { useTeacher } from "../contexts/TeacherContext";
import { useNavigate, Link } from "react-router-dom";

export default function TeacherLogin() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginTeacher, registerTeacher } = useTeacher();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "register") {
        if (!name.trim() || !password.trim()) {
          setError("Todos los campos son obligatorios.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Las contraseñas no coinciden.");
          setLoading(false);
          return;
        }
        if (password.length < 4) {
          setError("La contraseña debe tener al menos 4 caracteres.");
          setLoading(false);
          return;
        }
        registerTeacher(name.trim(), password);
        setSuccess("Maestro registrado. Ahora puedes iniciar sesión.");
        setMode("login");
        setPassword("");
        setConfirmPassword("");
      } else {
        if (!name.trim() || !password.trim()) {
          setError("Ingresa tu nombre y contraseña.");
          setLoading(false);
          return;
        }
        loginTeacher(name.trim(), password);
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Error al procesar.");
    }
    setLoading(false);
  }

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>{mode === "login" ? "🔑 Acceso de Maestro" : "📝 Registro de Maestro"}</h1>
          <p>
            {mode === "login"
              ? "Ingresa para dejar mensajes y comentarios"
              : "Crea tu cuenta para participar"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre completo"
              required
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••"
              required
            />
          </div>
          {mode === "register" && (
            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••"
                required
              />
            </div>
          )}

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Cargando..." : mode === "login" ? "Iniciar Sesión" : "Registrarse"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
              className="link-button"
            >
              {mode === "login" ? "Registrarse" : "Iniciar Sesión"}
            </button>
          </p>
          <Link to="/" className="back-link">← Volver al periódico</Link>
        </div>
      </div>
    </main>
  );
}
