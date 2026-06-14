import React, { useEffect } from 'react';
import CartView from '../components/organisms/Cart/CartView';
import { useCart } from '../context/CartContext';
import './ClientDashboard.css';

export default function ClientDashboard() {
  const { clearCart, subtotal, tax, total, posClientName } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="client-dashboard">
      {posClientName && (
        <div className="client-welcome-banner">
          <h2>Bienvenid@ {posClientName}</h2>
        </div>
      )}
      <div className="client-header">
        <h1>Tu Pedido</h1>
        <p>Revisa los artículos de tu orden actual</p>
      </div>
      
      <div className="client-cart-container">
        <CartView />
      </div>

      <div className="client-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>${subtotal?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="summary-row">
          <span>Impuesto (16%):</span>
          <span>${tax?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="summary-row total">
          <span>Total a Pagar:</span>
          <span>${total?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
    </div>
  );
}
