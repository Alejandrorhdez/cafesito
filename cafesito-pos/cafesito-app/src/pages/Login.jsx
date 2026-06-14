import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/organisms/LoginForm/LoginForm";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Login() {
  const navigate = useNavigate();
  const { isAuth, user } = useAuth();
  const { clearCart } = useCart();

  useEffect(() => {
    if (isAuth && user) {
      const role = user?.role;
      if (role === "Administrador") {
        navigate("/admin", { replace: true });
      } else if (role === "Chef") {
        navigate("/chef", { replace: true });
        navigate("/empleado", { replace: true });
      }
    }
  }, [isAuth, user, navigate]);

  const handleSuccess = (user) => {
    const role = user?.role;
    if (role === "Administrador" || role === "Cajero") {
      clearCart();
    }

    if (role === "Administrador") {
      navigate("/admin", { replace: true });
    } else if (role === "Chef") {
      navigate("/chef", { replace: true });
      navigate("/empleado", { replace: true });
    }
  };

  return <LoginForm onSuccess={handleSuccess} />;
}
