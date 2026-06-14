import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Icon, Loading } from "../components/atoms";
import { useAuth } from "../context/AuthContext";
import { getMyOrders, getAllOrders } from "../services/orderService";
import "./Orders.css";

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);

const formatDate = (isoString) => {
  if (!isoString) return "Fecha desconocida";
  try {
    return new Date(isoString).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    return "Fecha inválida";
  }
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hiddenOrders, setHiddenOrders] = useState(() => JSON.parse(localStorage.getItem("hiddenOrdersClient") || "[]"));
  const { user, isAuth } = useAuth();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        let fetchedOrders = [];
        if (user) {
          if (user.role === "Cajero" || user.role === "Administrador") {
            fetchedOrders = await getAllOrders();
          } else {
            fetchedOrders = await getMyOrders(user._id || user.id);
          }
        }
        const orderList = Array.isArray(fetchedOrders)
          ? fetchedOrders
          : fetchedOrders?.orders || [];

        const sortedOrders = [...orderList].sort(
          (a, b) => new Date(b.date) - new Date(a.date),
        );
        setOrders(sortedOrders);
        setSelectedOrderId((current) => current ?? sortedOrders[0]?.id ?? null);
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuth) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [user, isAuth]);

  const handleClearCompleted = () => {
    const idsToHide = orders
      .filter((o) => {
        const status = (o.status || "Confirmado").toLowerCase();
        return status !== "pendiente" && status !== "en preparación" && status !== "en preparacion";
      })
      .map((o) => o.id || o._id);
    const newHidden = [...new Set([...hiddenOrders, ...idsToHide])];
    setHiddenOrders(newHidden);
    localStorage.setItem("hiddenOrdersClient", JSON.stringify(newHidden));
    if (selectedOrderId && idsToHide.includes(selectedOrderId)) {
      setSelectedOrderId(null);
    }
  };

  const visibleOrders = orders.filter((o) => !hiddenOrders.includes(o.id || o._id));

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId],
  );

  const detailStatusToken = selectedOrder
    ? (selectedOrder.status || "confirmed").toLowerCase()
    : "confirmed";
  const detailStatusLabel = selectedOrder?.status || "Confirmado";

  if (loading) {
    return (
      <div className="orders-page">
        <Loading message="Cargando pedidos..." />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="orders-page orders-empty" data-testid="orders-empty">
        <Icon name="package" size={48} />
        <h1>No tienes pedidos registrados</h1>
        <p>
          Una vez que realices pedidos, podrás consultarlos aquí en tiempo real.
        </p>
        <Link to="/" className="orders-link">
          <Button>Descubrir productos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <p className="eyebrow">Historial de compras</p>
          <h1>Mis pedidos</h1>
          <p className="muted">
            {visibleOrders.length === 1
              ? "Tienes 1 pedido registrado"
              : `Tienes ${visibleOrders.length} pedidos registrados`}
          </p>
        </div>
        <div className="orders-header-actions">
          <Button variant="danger" onClick={handleClearCompleted}>
            Borrar Terminadas
          </Button>
          <Button
            variant="secondary"
            onClick={() => setSelectedOrderId(visibleOrders[0]?.id ?? visibleOrders[0]?._id ?? null)}
          >
            Ver más reciente
          </Button>
        </div>
      </div>

      <div className="orders-content">
        <div className="orders-list card">
          <div className="orders-list-header">
            <h2>Pedidos</h2>
            <span>{visibleOrders.length}</span>
          </div>
          <div className="orders-list-body">
            {visibleOrders.map((order) => {
              const itemCount = order.items?.length || order.productos?.length || 0;
              const statusToken = (order.status || "confirmed").toLowerCase();
              const orderId = order.id || order._id;
              const isActive = selectedOrderId === orderId;
              const clientName = order.usuario?.nombre || order.usuario?.displayName || (order.nombreInvitado ? `${order.nombreInvitado} (Invitado)` : 'INVITADO');
              
              return (
                <button
                  key={orderId}
                  className={`order-card${isActive ? " active" : ""}`}
                  onClick={() => setSelectedOrderId(orderId)}
                  data-testid="order-item"
                >
                  <div className="order-card-head">
                    <span className="order-id">#{orderId?.substring(orderId.length - 6) || orderId}</span>
                    <span
                      className={`order-status order-status-${statusToken}`}
                    >
                      {order.status || "Confirmado"}
                    </span>
                  </div>
                  <p className="order-date">{formatDate(order.date)}</p>
                  <div className="order-card-meta">
                    <span className="order-card-client-label">
                      Cliente: {clientName}
                    </span>
                    <div className="order-card-meta-row">
                      <span>{itemCount} artículos</span>
                      <strong>{formatMoney(order.total || 0)}</strong>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="orders-detail card" data-testid="order-detail">
          {selectedOrder ? (
            <>
              <div className="order-detail-header">
                <div>
                  <p className="eyebrow">Pedido #{selectedOrder.id}</p>
                  <h2>{formatMoney(selectedOrder.total || 0)}</h2>
                  <p className="muted">{formatDate(selectedOrder.date)}</p>
                </div>
                <span
                  className={`order-status order-status-${detailStatusToken}`}
                >
                  {detailStatusLabel}
                </span>
              </div>

              <div className="order-section">
                <h3>Resumen del pago</h3>
                <ul className="order-summary-list">
                  <li>
                    <span>Subtotal</span>
                    <strong>{formatMoney(selectedOrder.subtotal || 0)}</strong>
                  </li>
                  <li>
                    <span>IVA</span>
                    <strong>{formatMoney(selectedOrder.tax || 0)}</strong>
                  </li>
                  <li className="order-summary-total">
                    <span>Total</span>
                    <strong>{formatMoney(selectedOrder.total || 0)}</strong>
                  </li>
                </ul>
              </div>

              <div className="order-section">
                <h3>Método de pago</h3>
                {selectedOrder.paymentMethod ? (
                  <div>
                    <p>{selectedOrder.paymentMethod.alias}</p>
                    <p>
                      ****{" "}
                      {selectedOrder.paymentMethod.cardNumber?.slice(-4) ||
                        "----"}
                    </p>
                  </div>
                ) : (
                  <p className="muted">Sin método de pago registrado.</p>
                )}
              </div>

              <div className="order-section">
                <h3>Productos</h3>
                <ul className="order-items">
                  {selectedOrder.items?.map((item, index) => (
                    <li key={`${selectedOrder.id}-${item.id || index}`}>
                      <div>
                        <p>{item.name || item.title || "Producto"}</p>
                        <span>
                          Cantidad: {item.quantity || 1} · Precio:{" "}
                          {formatMoney(item.price || 0)}
                        </span>
                      </div>
                      <strong>
                        {formatMoney(
                          item.subtotal ||
                            (item.price || 0) * (item.quantity || 1),
                        )}
                      </strong>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="orders-empty">
              <h3>Selecciona un pedido de la lista</h3>
              <p className="muted">
                Aquí verás el detalle completo: productos y método de
                pago utilizados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
