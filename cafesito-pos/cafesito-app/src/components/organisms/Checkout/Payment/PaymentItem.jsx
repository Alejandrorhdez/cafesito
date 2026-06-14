import { Button } from "../../../atoms";
import "./PaymentItem.css";

const PaymentItem = ({ payment, isSelected, onSelect, onEdit, onDelete }) => {
  const maskCardNumber = (number) => {
    if (!number) return "**** **** **** ****";
    return `**** **** **** ${number.slice(-4)}`;
  };

  return (
    <div
      className={`payment-item ${isSelected ? "selected" : ""} ${
        payment.isDefault ? "default" : ""
      }`}
      data-testid="payment-item"
    >
      <div className="payment-content">
        <h4>{payment.alias}</h4>
        <p>{maskCardNumber(payment.cardNumber)}</p>
        <p>Vence: {payment.expireDate}</p>
        <p>Titular: {payment.placeHolder}</p>
        {payment.isDefault && (
          <span className="default-badge">Predeterminada</span>
        )}
      </div>
      <div className="payment-actions">
        <Button
          onClick={() => onSelect(payment)}
          disabled={isSelected}
          data-testid="select-payment-btn"
        >
          {isSelected ? "Seleccionada" : "Seleccionar"}
        </Button>
        <Button variant="secondary" onClick={() => onEdit(payment)}>
          Editar
        </Button>
        <Button variant="danger" onClick={() => onDelete(payment.id)}>
          Eliminar
        </Button>
      </div>
    </div>
  );
};

export default PaymentItem;
