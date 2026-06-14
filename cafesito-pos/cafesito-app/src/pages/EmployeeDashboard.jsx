import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/productService';
import ProductCard from '../components/organisms/ProductCard/ProductCard';
import CartView from '../components/organisms/Cart/CartView';
import { useCart } from '../context/CartContext';
import { Button } from '../components/atoms';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserByPhone } from '../services/userService';
import { socket } from '../services/socketService';
import { useNotifications } from '../context/NotificationContext';
import './EmployeeDashboard.css';

export default function EmployeeDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const { cartItems, subtotal, tax, total } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [clientTab, setClientTab] = useState('invitado');
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [guestName, setGuestName] = useState('');

  const { notifications, deleteNotification } = useNotifications();

  useEffect(() => {
    if (location.state?.registeredPhone) {
      const autoFetch = async () => {
        setSearching(true);
        setSearchError('');
        try {
          const data = await getUserByPhone(location.state.registeredPhone);
          setSelectedClient(data);
          setClientTab('buscar');
          setSearchPhone(location.state.registeredPhone);
        } catch (error) {
          console.error("Error auto-fetching client:", error);
        } finally {
          setSearching(false);
        }
      };
      autoFetch();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSearchClient = async () => {
    if (!searchPhone.trim()) {
      setSearchError('Por favor ingresa un número de teléfono');
      return;
    }
    setSearching(true);
    setSearchError('');
    try {
      const data = await getUserByPhone(searchPhone.trim());
      setSelectedClient(data);
    } catch (error) {
      if (error.response?.status === 404) {
        navigate('/register-client', { state: { phone: searchPhone.trim() } });
      } else {
        setSearchError(error.response?.data?.error || 'Error al buscar el cliente');
      }
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (clientTab === 'buscar' && selectedClient) {
      const clientName = selectedClient.nombre || selectedClient.displayName;
      socket.emit('pos-client-update', clientName);
    } else {
      socket.emit('pos-client-update', null);
    }
  }, [selectedClient, clientTab]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data.data || data || []);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ["Todos", "CALIENTE", "FRIO", "PANADERIA", "PASTELERIA", "ALIMENTOS", "OTROS"];

  const filteredProducts = selectedCategory === "Todos"
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="employee-dashboard">
      <div className="products-section">
        <div className="employee-actions-container">
          <h2>Productos</h2>
          
          {!loading && (
            <div className="category-tabs-container">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {loading ? (
          <p>Cargando productos...</p>
        ) : (
          <div className="products-list">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} orientation="horizontal" />
              ))
            ) : (
              <div className="products-empty-msg">
                <h3>NO HAY ARTICULOS DISPONIBLES POR EL MOMENTO</h3>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="cart-section">
        <div className="cart-actions-header-container">
          <h3 className="cart-header-title-text">Orden Actual</h3>
          <Button variant="secondary" onClick={() => navigate('/orders')} className="view-orders-btn">Ver Órdenes</Button>
        </div>

        <div className="client-selection-box">
          <h4 className="client-selection-title">Cliente para la venta:</h4>
          
          <div className="client-tabs-bar">
            <button
              onClick={() => {
                setClientTab('invitado');
                setSelectedClient(null);
                setSearchPhone('');
                setSearchError('');
                setGuestName('');
              }}
              className={`client-tab-btn ${clientTab === 'invitado' ? 'active' : ''}`}
            >
              Invitado
            </button>
            <button
              onClick={() => {
                setClientTab('buscar');
                setSearchError('');
              }}
              className={`client-tab-btn ${clientTab === 'buscar' ? 'active' : ''}`}
            >
              Ya es Cliente
            </button>
            <button
              onClick={() => {
                navigate('/register-client', { state: { phone: searchPhone } });
              }}
              className="client-tab-btn"
            >
              Registrar Cliente
            </button>
          </div>

          {clientTab === 'invitado' && (
            <div className="guest-mode-box">
              <div className="guest-mode-title">Modo: INVITADO</div>
              <input
                type="text"
                placeholder="Nombre del Invitado (Ej. Javier)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="guest-name-input"
              />
            </div>
          )}

          {clientTab === 'buscar' && (
            <div className="client-search-box">
              {!selectedClient ? (
                <>
                  <div className="client-search-row">
                    <input
                      type="tel"
                      placeholder="Número de Teléfono..."
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearchClient();
                      }}
                      className="client-phone-input"
                    />
                    <button
                      onClick={handleSearchClient}
                      disabled={searching}
                      className="client-validate-btn"
                    >
                      {searching ? 'Buscando...' : 'Validar'}
                    </button>
                  </div>
                  {searchError && (
                    <span className="client-search-error">
                      {searchError}
                    </span>
                  )}
                </>
              ) : (
                <div className="client-info-card">
                  <div className="client-info-header">
                    <span className="guest-mode-title">
                      Cliente Registrado ✓
                    </span>
                    <button
                      onClick={() => {
                        setSelectedClient(null);
                        setSearchPhone('');
                      }}
                      className="client-change-btn"
                    >
                      Cambiar
                    </button>
                  </div>
                  <div className="client-info-details">
                    <strong>Nombre:</strong> {selectedClient.nombre || selectedClient.displayName}<br />
                    <strong>Email:</strong> {selectedClient.email}<br />
                    <strong>Teléfono:</strong> {selectedClient.telefono}<br />
                    <strong>Compras Realizadas:</strong> {selectedClient.comprasRealizadas ?? 0}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="cart-content-wrapper">
          <CartView />
          
          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="summary-row">
              <span>Impuesto (16%):</span>
              <span>${tax?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${total?.toFixed(2) || '0.00'}</span>
            </div>
            <Button
              variant="primary"
              className="checkout-btn"
              onClick={() => navigate('/checkout', { state: { selectedClient: clientTab === 'invitado' ? { isGuest: true, nombre: guestName.trim() } : selectedClient } })}
              disabled={!cartItems || cartItems.length === 0 || (clientTab === 'buscar' && !selectedClient) || (clientTab === 'invitado' && !guestName.trim())}
            >
              Cobrar
            </Button>
          </div>
        </div>
      </div>

      <div className="notifications-section">
        <div className="notifications-header">
          <h3 className="orders-finished-title">Órdenes Terminadas</h3>
          <p className="orders-finished-subtitle">
            {notifications.length} {notifications.length === 1 ? 'orden terminada' : 'órdenes terminadas'}
          </p>
        </div>
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="notifications-empty-msg">
              No hay notificaciones recientes.
            </div>
          ) : (
            notifications.map((notif, index) => (
              <div key={index} className="notification-card">
                <button className="btn-delete-notif" onClick={() => deleteNotification(index)} title="Eliminar notificación">×</button>
                <div className="order-num">Orden #{notif.orderId?.substring(notif.orderId.length - 6) || notif.orderId}</div>
                <h4>{notif.clientName}</h4>
                <ul>
                  {notif.products?.map((prod, i) => (
                    <li key={i}>{prod}</li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
