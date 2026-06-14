import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { checkEmail } from "../../../services/auth";
import { Button, ErrorMessage, Input } from "../../atoms";
import "./RegisterForm.css";

export default function RegisterForm({ onSuccess }) {
  const location = useLocation();
  // =========================
  // State del formulario
  // =========================
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(location.state?.phone || "");
  const [password, setPassword] = useState("");
  const [verifyPassword, setverifyPassword] = useState("");

  const isClientRegistration = window.location.pathname === "/register-client";

  // UX state
  const [error, setError] = useState("");
  const [emailCheck, setEmailCheck] = useState({ status: "idle", message: "" });

  // Navegación
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  // =========================
  // Helpers de validación
  // =========================
  const isValidEmail = (value) => {
    const v = value.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  };

  const hasPasswordPolicy = (value) => {
    const hasNumber = /\d/.test(value);
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasSymbol = /[^a-zA-Z0-9]/.test(value);
    return hasNumber && hasLetter && hasSymbol;
  };

  const validateForm = () => {
    // Limpiar el error
    setError("");
    if (!displayName.trim()) {
      setError("Tu nombre es obligatorio");
      return false;
    }
    if (displayName.trim().length < 3) {
      setError("El nombre debe tener al menos 3 letras");
      return false;
    }
    if (!email.includes("@")) {
      setError("El correo debe contener '@'");
      return false;
    }
    if (!isValidEmail(email)) {
      setError("Parece que el email que capturaste no es correcto");
      return false;
    }
    if (isClientRegistration && !phone.trim()) {
      setError("El número de teléfono es obligatorio");
      return false;
    }
    if (phone.trim() && !/^\d{10}$/.test(phone.trim())) {
      setError("El número de teléfono debe tener exactamente 10 números");
      return false;
    }
    if (!isClientRegistration) {
      if (password.length < 8 || !hasPasswordPolicy(password)) {
        setError(
          "La contraseña debe tener al menos 8 caracteres e incluir una letra, un número y un símbolo.",
        );
        return false;
      }
      if (password !== verifyPassword) {
        setError("Tus contraseñas no coinciden.");
        return false;
      }
    }
    if (emailCheck.status === "taken") {
      setError("Ese email ya está registrado");
      return false;
    }
    return true;
  };

  const setCustomMessage = (e, messages) => {
    const input = e.target;
    const { validity } = input;

    if (validity.valueMissing && messages.valueMissing) {
      input.setCustomValidity(messages.valueMissing);
      return;
    }

    if (validity.typeMismatch && messages.typeMismatch) {
      input.setCustomValidity(messages.typeMismatch);
      return;
    }

    if (validity.tooShort && messages.tooShort) {
      input.setCustomValidity(messages.tooShort);
      return;
    }

    if (validity.patternMismatch && messages.patternMismatch) {
      input.setCustomValidity(messages.patternMismatch);
      return;
    }

    input.setCustomValidity(messages.default ?? "Campo inválido");
  };

  const clearCustomMessage = (e) => {
    e.target.setCustomValidity("");
  };

  const runEmailAvailabilityCheck = async (emailValue, inputEl) => {
    const value = emailValue.trim();
    if (!isValidEmail(value)) {
      setEmailCheck({ status: "idle", message: "" });
      inputEl?.setCustomValidity("Invalid mail");
      return;
    }
    setEmailCheck({ status: "checking", message: "Validando email..." });
    try {
      const taken = await checkEmail(value);
      if (taken) {
        setEmailCheck({
          status: "taken",
          message: "Ese mail ya está registrado.",
        });
        inputEl?.setCustomValidity("Ese mail ya está registrado.");
      } else {
        setEmailCheck({ status: "available", message: "Email disponible." });
        inputEl?.setCustomValidity("");
      }
    } catch (error) {
      setEmailCheck({ status: "idle", message: "" });
      inputEl?.setCustomValidity("");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }

    if (!validateForm()) return;

    const userData = {
      nombre: displayName.trim(),
      displayName: displayName.trim(),
      email: email.trim().toLowerCase(),
      telefono: phone.trim(),
      password: isClientRegistration ? "Cafesito123!" : password,
    };

    const result = await register(userData);

    if (result.success) {
      if (isClientRegistration) {
        navigate("/empleado", {
          state: {
            message: `Cliente ${userData.nombre} registrado exitosamente.`,
            registeredPhone: userData.telefono,
          },
        });
      } else {
        navigate("/login", {
          state: {
            message: "Registro exitoso. Por favor inicia sesión.",
            email: userData.email,
          },
        });
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>{isClientRegistration ? "Registrar Cliente" : "Registrar usuario"}</h2>
        <form className="register-form" onSubmit={onSubmit}>
          {/* Display name */}
          <div className="form-group">
            <Input
              id="displayName"
              data-testid="register-name-input"
              label="Nombre Completo: "
              type="text"
              value={displayName}
              onChange={(e) => {
                clearCustomMessage(e);
                setDisplayName(e.target.value);
              }}
              placeholder="Ingresa tu nombre completo"
              required
              minLength={3}
              onInvalid={(e) =>
                setCustomMessage(e, {
                  valueMissing: "El nombre es obligatorio",
                  tooShort: "El nombre debe tener al menos 3 letras",
                  default: "Captura un nombre válido (mínimo 3 letras).",
                })
              }
              onInput={clearCustomMessage}
            />
          </div>
          {/* Email */}
          <div className="form-group">
            <Input
              id="email"
              data-testid="register-email-input"
              label="Email: "
              type="email"
              value={email}
              onChange={(e) => {
                clearCustomMessage(e);
                setEmail(e.target.value);
              }}
              placeholder="Ingresa tu email"
              required
              onBlur={(e) => {
                //Aqui vamos a validar con la API
                runEmailAvailabilityCheck(e.target.value, e.target);
              }}
              onFocus={() => {
                // Solo UX: limpiamos estado y mensajes anteriores
                setEmailCheck({ status: "idle", message: "" });
              }}
              onInvalid={(e) =>
                setCustomMessage(e, {
                  valueMissing: "El email es obligatorio",
                  typeMismatch:
                    "El correo debe contener '@' y ser válido. Ej: nombre@dominio.com",
                  default: "Captura un email válido",
                })
              }
            />
            {emailCheck.message && (
              <p
                data-testid="register-email-status"
                className={`email-status email-status--${emailCheck.status}`}
              >
                {emailCheck.message}
              </p>
            )}
          </div>
          {/* Teléfono */}
          <div className="form-group">
            <Input
              id="phone"
              data-testid="register-phone-input"
              label="Número de Teléfono: "
              type="tel"
              value={phone}
              onChange={(e) => {
                clearCustomMessage(e);
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
              }}
              placeholder="Ingresa el número de teléfono (10 dígitos)"
              required={isClientRegistration}
              pattern="\d{10}"
              maxLength={10}
              onInvalid={(e) =>
                setCustomMessage(e, {
                  valueMissing: "El número de teléfono es obligatorio",
                  patternMismatch: "El número de teléfono debe tener exactamente 10 números",
                  default: "Captura un teléfono válido (10 números).",
                })
              }
              onInput={clearCustomMessage}
            />
          </div>
          
          {!isClientRegistration && (
            <>
              {/* Password */}
              <div className="form-group">
                <Input
                  id="password"
                  data-testid="register-password-input"
                  label="Contraseña: "
                  type="password"
                  value={password}
                  onChange={(e) => {
                    clearCustomMessage(e);
                    setPassword(e.target.value);
                  }}
                  placeholder="Ingresa tu contraseña"
                  required
                  minLength={8}
                  onInvalid={(e) =>
                    setCustomMessage(e, {
                      valueMissing: "La contraseña es obligatoria.",
                      tooShort: "La contraseña debe tener al menos 8 caracteres.",
                      default: "Captura una contraseña válida",
                    })
                  }
                  onInput={clearCustomMessage}
                />
              </div>
              {/* Verify Password*/}
              <div className="form-group">
                <Input
                  id="verifyPassword"
                  data-testid="register-verify-password-input"
                  label="Repite tu contraseña: "
                  type="password"
                  value={verifyPassword}
                  onChange={(e) => {
                    clearCustomMessage(e);
                    setverifyPassword(e.target.value);
                  }}
                  placeholder="Ingresa nuevamente tu contraseña"
                  required
                  minLength={8}
                  onInvalid={(e) => {
                    setCustomMessage(e, {
                      valueMissing: "Repite tu contraseña.",
                      tooShort: "La contraseña debe tener al menos 8 caracteres.",
                      default: "Confirma tu contraseña correctamente.",
                    });
                  }}
                  onInput={clearCustomMessage}
                />
              </div>
            </>
          )}
          {error && (
            <ErrorMessage data-testid="register-error-msg">
              {error}
            </ErrorMessage>
          )}

          <Button
            disabled={loading}
            type="submit"
            variant="primary"
            data-testid="register-submit-btn"
          >
            {loading ? "Registrando..." : (isClientRegistration ? "Registrar Cliente" : "Registrar")}
          </Button>
        </form>
        <div className="register-footer">
          <Link to={isClientRegistration ? "/empleado" : "/"}>
            {isClientRegistration ? "Volver al panel" : "Volver al inicio"}
          </Link>
        </div>
      </div>
    </div>
  );
}
