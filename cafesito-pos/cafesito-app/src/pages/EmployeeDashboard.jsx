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

  // Client Selection States
  const [clientTab, setClientTab] = useState('invitado'); // 'invitado' | 'buscar'
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [guestName, setGuestName] = useState('');

  // Notifications State
  const { notifications, deleteNotification } = useNotifications();

  // Auto-select client when returning from /register-client
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
      // Clear the history state
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
        // Redirigir directamente a registrar cliente pre-llenando el telefono
        navigate('/register-client', { state: { phone: searchPhone.trim() } });
      } else {
        setSearchError(error.response?.data?.error || 'Error al buscar el cliente');
      }
    } finally {
      setSearching(false);
    }
  };

  // Emit client info via socket when client changes
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
        // Assuming data is an array or has a data property
        setProducts(data.data || data || []);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Explicit categories list
  const categories = ["Todos", "CALIENTE", "FRIO", "PANADERIA", "PASTELERIA", "ALIMENTOS", "OTROS"];

  const filteredProducts = selectedCategory === "Todos"
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="employee-dashboard">
      <div className="products-section">
        <div className="employee-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <h2>Productos</h2>
          
          {/* Category Filter Tabs */}
          {!loading && (
            <div className="category-tabs" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: '4px',
                    border: '1px solid #94a3b8',
                    backgroundColor: selectedCategory === cat ? '#475569' : '#ffffff',
                    color: selectedCategory === cat ? '#ffffff' : '#1e293b',
                    cursor: 'pointer',
                    fontWeight: selectedCategory === cat ? 'bold' : 'normal',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap'
                  }}
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
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', gridColumn: '1 / -1' }}>
                <h3>NO HAY ARTICULOS DISPONIBLES POR EL MOMENTO</h3>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="cart-section">
        <div className="cart-actions-header" style={{ padding: '1rem', borderBottom: '1px solid #e1e4e8', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Orden Actual</h3>
          <Button variant="secondary" onClick={() => navigate('/orders')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Ver Órdenes</Button>
        </div>

        <div className="client-selection-container" style={{
          padding: '1rem',
          borderBottom: '1px solid #cbd5e1',
          backgroundColor: '#f8fafc'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '0.9rem', fontWeight: 'bold' }}>Cliente para la venta:</h4>
          
          <div className="client-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              onClick={() => {
                setClientTab('invitado');
                setSelectedClient(null);
                setSearchPhone('');
                setSearchError('');
                setGuestName('');
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: clientTab === 'invitado' ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              Invitado
            </button>
            <button
              onClick={() => {
                setClientTab('buscar');
                setSearchError('');
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                fontSize: '0.8rem',
                fontWeight: clientTab === 'buscar' ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              Ya es Cliente
            </button>
            <button
              onClick={() => {
                navigate('/register-client', { state: { phone: searchPhone } });
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Registrar Cliente
            </button>
          </div>

          {clientTab === 'invitado' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              padding: '0.5rem',
              backgroundColor: '#f1f5f9',
              border: '1px solid #94a3b8',
              borderRadius: '4px',
            }}>
              <div style={{ color: '#334155', fontSize: '0.8rem', fontWeight: 'bold' }}>Modo: INVITADO</div>
              <input
                type="text"
                placeholder="Nombre del Invitado (Ej. Javier)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                style={{
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.85rem',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>
          )}

          {clientTab === 'buscar' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {!selectedClient ? (
                <>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="tel"
                      placeholder="Número de Teléfono..."
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearchClient();
                      }}
                      style={{
                        flex: 1,
                        padding: '0.4rem 0.6rem',
                        fontSize: '0.85rem',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={handleSearchClient}
                      disabled={searching}
                      style={{
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        backgroundColor: '#475569',
                        color: '#ffffff',
                        border: '1px solid #334155',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {searching ? 'Buscando...' : 'Validar'}
                    </button>
                  </div>
                  {searchError && (
                    <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: '500' }}>
                      {searchError}
                    </span>
                  )}
                </>
              ) : (
                <div style={{
                  padding: '0.6rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#334155' }}>
                      Cliente Registrado ✓
                    </span>
                    <button
                      onClick={() => {
                        setSelectedClient(null);
                        setSearchPhone('');
                      }}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: '#ef4444',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Cambiar
                    </button>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#1e293b' }}>
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
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Órdenes Terminadas</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            {notifications.length} {notifications.length === 1 ? 'orden terminada' : 'órdenes terminadas'}
          </p>
        </div>
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
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
