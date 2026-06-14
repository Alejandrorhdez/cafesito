import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CartView,
  PaymentForm,
  PaymentList,
  SummarySection,
} from "../components/organisms";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getPaymentMethods } from "../services/paymentMethodService.js";
import { createOrder } from "../services/orderService.js";
import { socket } from "../services/socketService.js";
import { Button, ErrorMessage, Loading } from "../components/atoms";
import { normalizePayment } from "../utils/storageHelpers.js";
import "./Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const selectedClient = location.state?.selectedClient || null;
  const {
    cartItems,
    subtotal: cartSubtotal,
    tax: cartTax,
    total: cartTotal,
    clearCart,
  } = useCart();


  const subtotal = typeof cartSubtotal === "number" ? cartSubtotal : 0;
  const TAX_RATE = Number(process.env.REACT_APP_TAX_RATE);
  const resolvedTaxRate = Number.isFinite(TAX_RATE) ? TAX_RATE : 0.16;
  const isEmployee = user?.role === "Cajero" || user?.role === "Administrador";

  let discountPercentage = 0;
  if (isEmployee && selectedClient && !selectedClient.isGuest && selectedClient.descuento) {
    discountPercentage = selectedClient.descuento;
  } else if (!isEmployee && user && user.descuento) {
    discountPercentage = user.descuento;
  }

  const discountAmount = parseFloat((subtotal * (discountPercentage / 100)).toFixed(2));
  const subtotalAfterDiscount = subtotal - discountAmount;

  const taxAmount = parseFloat((subtotalAfterDiscount * resolvedTaxRate).toFixed(2));

  const grandTotal = parseFloat(
    (subtotalAfterDiscount + taxAmount).toFixed(2),
  );
  const formatMoney = (v) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(v);


  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      if (!suppressRedirect.current) {
        navigate("/cart");
      }
    }
  }, [cartItems, navigate]);

  const suppressRedirect = useRef(false);

  const [payments, setPayments] = useState([]);
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [localError, setLocalError] = useState(null);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentSectionOpen, setPaymentSectionOpen] = useState(true);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [employeePaymentMethod, setEmployeePaymentMethod] = useState("Efectivo");

  useEffect(() => {
    if (!selectedPayment) {
      setPaymentSectionOpen(true);
    }
  }, [selectedPayment]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (isEmployee) {
        if (isMounted) setLoadingLocal(false);
        return;
      }

      setLoadingLocal(true);
      setLocalError(null);
      try {
        const payList = await getPaymentMethods();

        let normalizedPayments = (payList || [])
          .map((pay, idx) => normalizePayment(pay, idx))
          .filter(Boolean);

        if (!isMounted) return;

        setPayments(normalizedPayments);

        const defaultPay =
          normalizedPayments.find((p) => p.isDefault || p.default) ||
          normalizedPayments[0] ||
          null;

        setSelectedPayment(defaultPay);
        setPaymentSectionOpen(!defaultPay);
      } catch (err) {
        if (isMounted) {
          console.warn("No se pudieron cargar datos desde el servidor. Usando listas vacías.");
          setPayments([]);
        }
      } finally {
        if (isMounted) {
          setLoadingLocal(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [isEmployee]);

  const handleRetry = () => {
    window.location.reload();
  };

  const persistPayments = (next) => {
    setPayments(next);
  };

  const handlePaymentToggle = () => {
    setShowPaymentForm(false);
    setEditingPayment(null);
    setPaymentSectionOpen((prev) => !prev);
  };

  const handlePaymentSubmit = (formData) => {
    let normalizedRecord = normalizePayment(
      { ...formData, id: editingPayment?.id },
      payments.length,
    );

    let updatedPayments = editingPayment
      ? payments.map((pay) =>
          pay.id === editingPayment.id ? normalizedRecord : pay,
        )
      : [...payments, normalizedRecord];

    if (normalizedRecord?.isDefault || normalizedRecord?.default) {
      updatedPayments = updatedPayments.map((pay) =>
        pay.id === normalizedRecord.id
          ? { ...pay, default: true, isDefault: true }
          : { ...pay, default: false, isDefault: false },
      );
      normalizedRecord =
        updatedPayments.find((pay) => pay.id === normalizedRecord.id) ||
        normalizedRecord;
    }

    persistPayments(updatedPayments);

    const nextSelection =
      normalizedRecord &&
      (normalizedRecord.isDefault ||
        normalizedRecord.default ||
        !selectedPayment ||
        selectedPayment.id === normalizedRecord.id)
        ? normalizedRecord
        : selectedPayment;

    setSelectedPayment(nextSelection);
    setShowPaymentForm(false);
    setEditingPayment(null);
    setPaymentSectionOpen(false);
  };

  const handlePaymentEdit = (payment) => {
    setEditingPayment(payment);
    setShowPaymentForm(true);
    setPaymentSectionOpen(true);
  };

  const handlePaymentDelete = (paymentId) => {
    let updatedPayments = payments.filter((pay) => pay.id !== paymentId);
    let nextSelection = selectedPayment;

    if (selectedPayment?.id === paymentId) {
      nextSelection = null;
    }

    if (updatedPayments.length > 0) {
      if (!nextSelection) {
        nextSelection =
          updatedPayments.find((pay) => pay.isDefault || pay.default) ||
          updatedPayments[0];
      }

      if (nextSelection) {
        updatedPayments = updatedPayments.map((pay) =>
          pay.id === nextSelection.id
            ? { ...pay, default: true, isDefault: true }
            : { ...pay, default: false, isDefault: false },
        );
        nextSelection =
          updatedPayments.find((pay) => pay.id === nextSelection.id) ||
          nextSelection;
      }
    } else {
      nextSelection = null;
    }

    persistPayments(updatedPayments);
    setSelectedPayment(nextSelection);
  };

  return (
    loadingLocal ? (
      <div className="checkout-loading">
        <Loading message="Cargando métodos de pago..." />
      </div>
    ) : localError ? (
      <div className="checkout-error">
        <ErrorMessage message={localError}>
          <div className="checkout-retry-container">
            <Button onClick={handleRetry} variant="primary">
              Reintentar
            </Button>
          </div>
        </ErrorMessage>
      </div>
    ) : (
      <div className="checkout-container">
        <div className="checkout-left">
          <SummarySection
            title="1. Método de pago"
            selected={isEmployee ? true : selectedPayment}
            summaryContent={
              isEmployee ? (
                <div className="selected-payment-box">
                  <p className="payment-box-title">Cobro en Caja</p>
                  <div className="payment-buttons-row">
                    <Button
                      variant={employeePaymentMethod === "Efectivo" ? "primary" : "secondary"}
                      onClick={(e) => { e.stopPropagation(); setEmployeePaymentMethod("Efectivo"); }}
                      className="payment-select-btn"
                      type="button"
                    >
                      Efectivo
                    </Button>
                    <Button
                      variant={employeePaymentMethod === "Tarjeta física" ? "primary" : "secondary"}
                      onClick={(e) => { e.stopPropagation(); setEmployeePaymentMethod("Tarjeta física"); }}
                      className="payment-select-btn"
                      type="button"
                    >
                      Tarjeta física
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="selected-payment">
                  <p>{selectedPayment?.alias}</p>
                  <p>**** {selectedPayment?.cardNumber?.slice(-4) || "----"}</p>
                </div>
              )
            }
            isExpanded={
              !isEmployee && (showPaymentForm || paymentSectionOpen || !selectedPayment)
            }
            onToggle={isEmployee ? undefined : handlePaymentToggle}
          >
            {!isEmployee && (
              !showPaymentForm && !editingPayment ? (
                <PaymentList
                  payments={payments}
                  selectedPayment={selectedPayment}
                  onSelect={(payment) => {
                    setSelectedPayment(payment);
                    setShowPaymentForm(false);
                    setEditingPayment(null);
                    setPaymentSectionOpen(false);
                  }}
                  onEdit={handlePaymentEdit}
                  onDelete={handlePaymentDelete}
                  onAdd={() => {
                    setEditingPayment(null);
                    setShowPaymentForm(true);
                    setPaymentSectionOpen(true);
                  }}
                />
              ) : (
                <PaymentForm
                  key={editingPayment?.id || "new"}
                  onSubmit={handlePaymentSubmit}
                  onCancel={() => {
                    setShowPaymentForm(false);
                    setEditingPayment(null);
                    setPaymentSectionOpen(true);
                  }}
                  initialValues={editingPayment || {}}
                  isEdit={!!editingPayment}
                />
              )
            )}
          </SummarySection>

          <SummarySection
            title="2. Revisa tu pedido"
            selected={true}
            isExpanded={true}
          >
            <CartView />
          </SummarySection>
        </div>

        <div className="checkout-right">
          <div className="checkout-summary">
            <h3>Resumen de la Orden</h3>

            <div className="summary-items">
              {cartItems.map((item) => (
                <div key={item._id} className="summary-item">
                  <div className="summary-item-info">
                    <span className="summary-item-qty">{item.quantity}x</span>
                    <span className="summary-item-name">{item.name}</span>
                  </div>
                  <span className="summary-item-price">{formatMoney(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="summary-details">
              {selectedClient && (
                <p>
                  <strong>Cliente:</strong> {selectedClient.isGuest ? `${selectedClient.nombre} (Invitado)` : `${selectedClient.nombre || selectedClient.displayName} (${selectedClient.telefono || 'Sin teléfono'})`}
                </p>
              )}
              <p>
                <strong>Método de pago:</strong> {isEmployee ? employeePaymentMethod : (selectedPayment?.alias || "No seleccionado")}
              </p>
              <div className="order-costs">
                <p>
                  <strong>Subtotal:</strong> {formatMoney(subtotal)}
                </p>
                {discountPercentage > 0 && (
                  <p className="discount-applied">
                    <strong>Descuento ({discountPercentage}%):</strong> -{formatMoney(discountAmount)}
                  </p>
                )}
                <p>
                  <strong>IVA (16%):</strong> {formatMoney(taxAmount)}
                </p>
                <hr />
                <p>
                  <strong>Total:</strong> {formatMoney(grandTotal)}
                </p>
              </div>
            </div>
            <Button
              className="pay-button"
              disabled={
                (!isEmployee && !selectedPayment) ||
                !cartItems ||
                cartItems.length === 0
              }
              title={
                !cartItems || cartItems.length === 0
                  ? "No hay productos en el carrito"
                  : !isEmployee && !selectedPayment
                    ? "Selecciona un método de pago"
                    : "Confirmar y realizar el pago"
              }
              onClick={async () => {
                setLoadingLocal(true);
                try {
                  const payload = {
                    usuario: selectedClient?.isGuest ? null : (selectedClient?._id || selectedClient?.id || (isEmployee ? null : (user?._id || user?.id || null))),
                    nombreInvitado: selectedClient?.isGuest ? selectedClient.nombre : null,
                    items: cartItems.map((item) => ({
                      _id: item._id,
                      name: item.name,
                      price: item.price,
                      quantity: item.quantity,
                    })),
                    total: grandTotal,
                    paymentMethod: isEmployee ? { alias: employeePaymentMethod } : (selectedPayment || { alias: "Efectivo" }),
                  };

                  const newOrder = await createOrder(payload);

                  socket.emit("pos-order-created", newOrder);

                  suppressRedirect.current = true;
                  clearCart();

                  navigate("/order-confirmation", {
                    state: { order: newOrder },
                  });
                } catch (error) {
                  setLocalError(
                    error.response?.data?.message ||
                      "Hubo un problema procesando tu orden. Verifica tu stock.",
                  );
                } finally {
                  setLoadingLocal(false);
                }
              }}
              data-testid="confirm-order-btn"
            >
              Confirmar y Pagar
            </Button>
          </div>
        </div>
      </div>
    )
  );
}
