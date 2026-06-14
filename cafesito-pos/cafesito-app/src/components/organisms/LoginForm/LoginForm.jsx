import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Button, ErrorMessage, Input } from "../../atoms";
import "./LoginForm.css";

export default function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(email, password);
    if (result.success) {
      if (onSuccess) {
        onSuccess(result.user);
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <form className="login-form" onSubmit={onSubmit}>
          <div className="form-group">
            <Input
              id="email"
              data-testid="login-email-input"
              label="Email: "
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Ingresa tu email"
              required
            />
          </div>
          <div className="form-group">
            <Input
              id="password"
              data-testid="login-password-input"
              label="Contraseña: "
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          {error && (
            <ErrorMessage data-testid="login-error-msg">{error}</ErrorMessage>
          )}

          <Button
            disabled={loading}
            type="submit"
            variant="primary"
            data-testid="login-submit-btn"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
        <div className="login-footer">
          <Link to="/">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
