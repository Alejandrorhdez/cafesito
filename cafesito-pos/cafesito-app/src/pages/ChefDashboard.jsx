import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../services/orderService';
import { Button, Badge } from '../components/atoms';
import { socket } from '../services/socketService';
import './ChefDashboard.css';

export default function ChefDashboard() {
  const [orders, setOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hiddenOrderIds, setHiddenOrderIds] = useState(() => JSON.parse(localStorage.getItem('hiddenChefOrders') || '[]'));

  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await getAllOrders();
      const allOrders = Array.isArray(data) ? data : (data?.orders || []);
      const activeOrders = allOrders.filter(
        order => order.status !== 'Terminada' && order.status !== 'Orden Terminada' && order.status !== 'Completada' && order.status !== 'Cancelada'
      );
      const completed = allOrders.filter(
        order => order.status === 'Terminada' || order.status === 'Orden Terminada' || order.status === 'Completada'
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setOrders(activeOrders);
      setCompletedOrders(completed);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);

    const handleSyncOrders = () => {
      fetchOrders(false);
    };

    socket.on('sync-orders', handleSyncOrders);

    const intervalId = setInterval(() => {
      fetchOrders(false);
    }, 20000);

    return () => {
      clearInterval(intervalId);
      socket.off('sync-orders', handleSyncOrders);
    };
  }, []);

  const handleStatusChange = async (orderId, currentStatus, orderObj) => {
    let newStatus = '';
    if (currentStatus === 'Pendiente') newStatus = 'En preparación';
    else if (currentStatus === 'En preparación') newStatus = 'Orden Terminada';

    if (newStatus) {
      try {
        await updateOrderStatus(orderId, newStatus);
        
        if (newStatus === 'Orden Terminada' && orderObj) {
          const clientName = orderObj.usuario?.nombre || orderObj.usuario?.displayName || (orderObj.nombreInvitado ? `${orderObj.nombreInvitado} (Invitado)` : 'INVITADO');
          const preparedProducts = orderObj.items.map(item => `${item.quantity}x ${item.product?.name || item.name}`);
          
          socket.emit('pos-order-finished', {
            orderId: orderId,
            clientName,
            products: preparedProducts,
            timestamp: new Date().toISOString()
          });
        }
        
        fetchOrders(false);
      } catch (error) {
        console.error("Error updating status:", error);
      }
    }
  };

  const handleClearCompleted = () => {
    const idsToHide = completedOrders.map(o => o._id);
    const newHidden = [...new Set([...hiddenOrderIds, ...idsToHide])];
    setHiddenOrderIds(newHidden);
    localStorage.setItem('hiddenChefOrders', JSON.stringify(newHidden));
  };

  if (loading) return <div className="chef-dashboard"><p>Cargando órdenes...</p></div>;

  return (
    <div className="chef-dashboard">
      <div className="chef-header">
        <h1>Vista Chef - {showCompleted ? 'Órdenes Terminadas' : 'Órdenes Activas'}</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {showCompleted && (
            <Button variant="danger" onClick={handleClearCompleted}>Borrar Órdenes</Button>
          )}
          <Button variant="secondary" onClick={() => fetchOrders(true)}>Actualizar</Button>
          <Button variant={showCompleted ? 'secondary' : 'primary'} onClick={() => setShowCompleted(!showCompleted)}>
            {showCompleted ? 'Ver Órdenes Activas' : 'Ver Órdenes Terminadas'}
          </Button>
        </div>
      </div>

      <div className="orders-grid">
        {!showCompleted ? (
          orders.length === 0 ? (
            <p>No hay órdenes activas.</p>
          ) : (
            orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <h3>Orden #{order._id.substring(order._id.length - 6)}</h3>
                  <Badge 
                    text={order.status} 
                    variant={
                      order.status === 'Pendiente' 
                        ? 'warning' 
                        : order.status === 'En preparación' 
                          ? 'info' 
                          : 'success'
                    } 
                  />
                </div>
                <div className="order-items">
                  {order.items.map(item => (
                    <div key={item.product?._id || item._id} className="order-item-row">
                      <span>{item.quantity}x {item.product?.name || item.name}</span>
                    </div>
                  ))}
                </div>
                <div className="order-actions">
                  <Button 
                    variant="primary" 
                    onClick={() => handleStatusChange(order._id, order.status, order)}
                  >
                    {order.status === 'Pendiente' ? 'Comenzar Preparación' : 'Marcar como Terminada'}
                  </Button>
                </div>
              </div>
            ))
          )
        ) : (
          completedOrders.filter(o => !hiddenOrderIds.includes(o._id)).length === 0 ? (
            <p>No hay órdenes terminadas.</p>
          ) : (
            completedOrders.filter(o => !hiddenOrderIds.includes(o._id)).map(order => (
              <div key={order._id} className="order-card completed">
                <div className="order-header">
                  <h3>Orden #{order._id.substring(order._id.length - 6)}</h3>
                  <Badge text={order.status} variant="success" />
                </div>
                <div className="order-items">
                  {order.items?.map(item => (
                    <div key={item.product?._id || item._id} className="order-item-row">
                      <span>{item.quantity}x {item.product?.name || item.name}</span>
                    </div>
                  ))}
                </div>
                <div className="order-actions" style={{ flexDirection: 'column', alignItems: 'flex-start', fontSize: '0.9rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                  <p style={{ margin: '0 0 5px 0' }}><strong>Terminada a las:</strong> {new Date(order.updatedAt).toLocaleTimeString()}</p>
                  <p style={{ margin: '0' }}><strong>Por el chef:</strong> {order.completadaPor?.nombre || 'Desconocido'}</p>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
