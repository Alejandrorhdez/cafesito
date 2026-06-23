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
          <div className="header-content header-content-spaced">
            <Link to="/" className="logo" data-testid="logo">
              Cafesito
            </Link>

            {isAuth && user && (
              <div className="header-actions">
                <div className="user-info user-info-default">
                  <div className="user-text">
                    <span className="greeting">Bienvenido,</span>
                    <span className="account-text">{user.nombre || user.name || "Empleado"}</span>
                  </div>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="logout-btn header-logout-btn" 
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
