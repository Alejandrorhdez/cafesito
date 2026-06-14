import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./OrderConfirmation.css";
import { Icon } from "../components/atoms";

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};
  const { clearCart } = useCart();
  const clearedRef = useRef(false);

  useEffect(() => {
    if (!order) {
      navigate("/");
      return;
    }

    if (!clearedRef.current) {
      try {
        clearCart();
      } catch (e) {
      }
      clearedRef.current = true;
    }
  }, [order, navigate, clearCart]);

  if (!order) return null;

  const orderDate = order.date
    ? new Date(order.date).toLocaleDateString()
    : "No disponible";

  const money = (v) =>
    typeof v === "number"
      ? new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
          minimumFractionDigits: 2,
        }).format(v)
      : "$0.00";

  const subtotal = order.subtotal ?? 0;
  const tax = order.tax ?? 0;
  const total = order.total ?? subtotal + tax;

  return (
    <div className="order-confirmation">
      <div className="confirmation-content">
        <div className="confirmation-icon">
          <Icon name="checkCircle" size={64} className="success" />
        </div>
        <h1>¡Gracias por tu compra!</h1>
        <p className="confirmation-message">
          Tu pedido #{order.id || "N/A"} ha sido confirmado y está siendo
          procesado.
        </p>
        <div className="confirmation-details">
          <h2>Detalles de tu pedido:</h2>
          <div className="order-info">
            <p>
              <strong>Fecha:</strong> {orderDate}
            </p>

            <h3>Productos</h3>
            <ul className="order-items">
              {(order.items || []).map((it) => (
                <li key={it._id || it.id || it.name}>
                  {it.name} x{it.quantity} — {money(it.price)}
                  <span className="order-item-subtotal">{money(it.subtotal)}</span>
                </li>
              ))}
            </ul>

            <div className="order-totals">
              <p>
                <strong>Subtotal:</strong> {money(subtotal)}
              </p>
              <p>
                <strong>IVA:</strong> {money(tax)}
              </p>
              <hr />
              <p>
                <strong>Total:</strong> {money(total)}
              </p>
            </div>
          </div>
          <p>
            Hemos enviado un correo electrónico con los detalles de tu compra.
            También puedes ver el estado de tu pedido en cualquier momento desde
            tu perfil.
          </p>
        </div>
        <div className="confirmation-actions">
          <Link to="/" className="button primary">
            <Icon name="home" size={20} />
            <span>Volver al inicio</span>
          </Link>
          <Link to="/orders" className="button secondary">
            <Icon name="package" size={20} />
            <span>Ver ordenes</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
