import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import "./Header.css";

export default function Header() {
  const { isAuth, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-main">
        <div className="container">
          <div className="header-content" style={{ justifyContent: 'space-between' }}>
            {/* Logo */}
            <Link to="/" className="logo" data-testid="logo">
              Cafesito
              <span className="logo-extension"> POS</span>
            </Link>

            {/* Auth Actions */}
            {isAuth && user && (
              <div className="header-actions">
                <div className="user-info" style={{ cursor: "default" }}>
                  <div className="user-text">
                    <span className="greeting">Bienvenido,</span>
                    <span className="account-text">{user.nombre || user.name || "Empleado"}</span>
                  </div>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="logout-btn" 
                  style={{ width: "auto", padding: "8px 16px", marginTop: 0 }}
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
