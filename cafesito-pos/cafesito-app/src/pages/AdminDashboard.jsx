import React, { useState, useEffect } from 'react';
import { Button, Loading, ErrorMessage } from '../components/atoms';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '../services/productService';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService';
import { getAllOrders, updateOrderStatus, hideOrderFromAdmin, hideAllOrdersFromAdmin } from '../services/orderService';
import { saveFinanceReport, getFinanceReports } from '../services/financeService';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('productos');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [financeReports, setFinanceReports] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showPurchasesModal, setShowPurchasesModal] = useState(false);
  const [clientForPurchases, setClientForPurchases] = useState(null);

  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('1'); // Default to Available ('1')
  const [prodCategory, setProdCategory] = useState('CALIENTE');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // User Form State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('Seleccionar Rol');
  const [userPhone, setUserPhone] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setError('');
    setLoading(true);
    try {
      if (activeTab === 'productos') {
        const data = await getProducts();
        setProducts(data.data || data || []);
      } else if (activeTab === 'usuarios') {
        const data = await getUsers();
        setUsers(data || []);
      } else if (activeTab === 'clientes') {
        const [usersData, ordersData] = await Promise.all([getUsers(), getAllOrders()]);
        setUsers(usersData || []);
        setOrders(ordersData.orders || ordersData || []);
      } else if (activeTab === 'ordenes') {
        const data = await getAllOrders();
        setOrders(data.orders || data || []);
      } else if (activeTab === 'finanzas') {
        const [ordersData, reportsData] = await Promise.all([
          getAllOrders(),
          getFinanceReports().catch(() => [])
        ]);
        setOrders(ordersData.orders || ordersData || []);
        setFinanceReports(reportsData || []);
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
      setError('No se pudo cargar la información desde el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // PRODUCT CRUD HANDLERS
  const openNewProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdPrice('');
    setProdStock('1');
    setProdCategory('CALIENTE');
    setProdDescription('');
    setProdImage('');
    setShowProductModal(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdPrice(product.price);
    setProdStock(product.stock > 0 ? '1' : '0');
    setProdCategory(product.category || 'CALIENTE');
    setProdDescription(product.description || '');
    setProdImage(product.imagen || '');
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const productPayload = {
      name: prodName,
      price: Number(prodPrice),
      stock: Number(prodStock),
      category: prodCategory,
      description: prodDescription,
      imagen: prodImage
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, productPayload);
      } else {
        await createProduct(productPayload);
      }
      setShowProductModal(false);
      loadData();
    } catch (err) {
      console.error("Error saving product:", err);
      setError('No se pudo guardar el producto. Verifica los datos.');
    }
  };

  const handleProductDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await deleteProduct(id);
        loadData();
      } catch (err) {
        console.error("Error deleting product:", err);
        setError('Error al intentar eliminar el producto.');
      }
    }
  };

  // CLIENT CRUD HANDLERS
  const openEditClientModal = (client) => {
    setEditingClient(client);
    setUserName(client.nombre);
    setUserEmail(client.email);
    setUserPhone(client.telefono || '');
    setShowClientModal(true);
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userName || userName.trim().length < 3) {
      setError('El nombre del cliente debe tener al menos 3 letras.');
      return;
    }
    if (!userEmail || !userEmail.includes('@')) {
      setError("El email del cliente debe contener '@'.");
      return;
    }
    if (userPhone && !/^\d{10}$/.test(userPhone.trim())) {
      setError('El número de teléfono debe tener exactamente 10 números.');
      return;
    }

    const clientPayload = {
      nombre: userName.trim(),
      email: userEmail.trim(),
      telefono: userPhone.trim(),
      rol: 'Cliente'
    };

    try {
      if (editingClient) {
        await updateUser(editingClient._id, clientPayload);
        setShowClientModal(false);
        loadData();
      }
    } catch (err) {
      console.error("Error saving client:", err);
      setError('Error al guardar el cliente. Verifica si el email ya existe.');
    }
  };

  const openPurchasesModal = (client) => {
    setClientForPurchases(client);
    setShowPurchasesModal(true);
  };

  // USER CRUD HANDLERS
  const openNewUserModal = () => {
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setUserRole('Seleccionar Rol');
    setUserPhone('');
    setShowUserModal(true);
  };

  const openEditUserModal = (user) => {
    setEditingUser(user);
    setUserName(user.nombre);
    setUserEmail(user.email);
    setUserPassword(''); // Leave blank unless updating
    setUserRole(user.role || 'Seleccionar Rol');
    setUserPhone(user.telefono || '');
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userName || userName.trim().length < 3) {
      setError('El nombre del usuario debe tener al menos 3 letras.');
      return;
    }
    if (!userEmail || !userEmail.includes('@')) {
      setError("El email del usuario debe contener '@'.");
      return;
    }
    if (userPhone && !/^\d{10}$/.test(userPhone.trim())) {
      setError('El número de teléfono debe tener exactamente 10 números.');
      return;
    }

    const userPayload = {
      nombre: userName.trim(),
      email: userEmail.trim(),
      rol: userRole,
      telefono: userPhone.trim(),
    };
    if (userPassword) {
      userPayload.password = userPassword;
    } else if (!editingUser) {
      setError('La contraseña es requerida para nuevos usuarios.');
      return;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser._id, userPayload);
      } else {
        await createUser(userPayload);
      }
      setShowUserModal(false);
      loadData();
    } catch (err) {
      console.error("Error saving user:", err);
      setError('Error al guardar el usuario. Verifica si el email ya existe.');
    }
  };

  const handleUserDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await deleteUser(id);
        loadData();
      } catch (err) {
        console.error("Error deleting user:", err);
        setError('Error al intentar eliminar al usuario.');
      }
    }
  };

  // ORDER STATUS HANDLERS
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Update locally
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus, estado: newStatus } : o));
    } catch (err) {
      console.error("Error changing order status:", err);
      setError('No se pudo actualizar el estado de la orden.');
    }
  };

  const handleHideAllOrders = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar todas las órdenes de la vista de administrador?')) {
      try {
        await hideAllOrdersFromAdmin();
        loadData();
      } catch (err) {
        console.error("Error hiding all orders:", err);
        setError('No se pudo vaciar la lista de órdenes.');
      }
    }
  };

  // FINANCIAL CALCULATIONS
  const getTodaySales = () => {
    const todayStr = new Date().toDateString();
    return orders
      .filter(o => (o.status === 'Completada' || o.status === 'Orden Terminada' || o.status === 'Terminada') && new Date(o.date).toDateString() === todayStr)
      .reduce((sum, o) => sum + (o.total || 0), 0);
  };

  const getMonthSales = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return orders
      .filter(o => {
        if (o.status !== 'Completada' && o.status !== 'Orden Terminada' && o.status !== 'Terminada') return false;
        const d = new Date(o.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, o) => sum + (o.total || 0), 0);
  };

  const getHistoricalSales = () => {
    return orders
      .filter(o => o.status === 'Completada' || o.status === 'Orden Terminada' || o.status === 'Terminada')
      .reduce((sum, o) => sum + (o.total || 0), 0);
  };

  const handleSaveFinanceReport = async () => {
    if (window.confirm('¿Deseas guardar el reporte financiero actual en la base de datos?')) {
      try {
        await saveFinanceReport({
          ventasHoy: getTodaySales(),
          ventasMes: getMonthSales(),
          ventasHistoricas: getHistoricalSales(),
          ordenesTotales: orders.length
        });
        loadData();
      } catch (err) {
        console.error("Error saving finance report:", err);
        setError('No se pudo guardar el reporte financiero.');
      }
    }
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h2>Panel Admin</h2>
        <ul className="admin-nav">
          <li className={activeTab === 'productos' ? 'active' : ''} onClick={() => setActiveTab('productos')}>📁 Productos</li>
          <li className={activeTab === 'ordenes' ? 'active' : ''} onClick={() => setActiveTab('ordenes')}>📋 Órdenes</li>
          <li className={activeTab === 'usuarios' ? 'active' : ''} onClick={() => setActiveTab('usuarios')}>👥 Usuarios</li>
          <li className={activeTab === 'clientes' ? 'active' : ''} onClick={() => setActiveTab('clientes')}>🧑‍🤝‍🧑 Clientes</li>
          <li className={activeTab === 'finanzas' ? 'active' : ''} onClick={() => setActiveTab('finanzas')}>💰 Finanzas</li>
        </ul>
      </div>

      <div className="admin-content">
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {loading ? (
          <div className="loading-container">
            <Loading message="Cargando información..." />
          </div>
        ) : (
          <>
            {activeTab === 'productos' && (
              <div className="admin-section">
                <div className="section-header">
                  <h2>Gestión de Productos</h2>
                  <Button variant="primary" onClick={openNewProductModal}>+ Crear Nuevo Producto</Button>
                </div>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Disponibilidad</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product._id}>
                          <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img 
                              src={product.imagen || '/img/products/placeholder.svg'} 
                              alt={product.name} 
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                              onError={(e) => { e.target.src = '/img/products/placeholder.svg'; }}
                            />
                            <strong>{product.name}</strong>
                          </td>
                          <td>{product.category || 'Sin categoría'}</td>
                          <td>{formatMoney(product.price)}</td>
                          <td>
                            <span style={{
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '6px', 
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              backgroundColor: product.stock > 0 ? '#dcfce7' : '#fee2e2',
                              color: product.stock > 0 ? '#15803d' : '#991b1b'
                            }}>
                              {product.stock > 0 ? 'Disponible' : 'No disponible'}
                            </span>
                          </td>
                          <td>{product.description || '-'}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon btn-edit" onClick={() => openEditProductModal(product)} title="Editar">✏️</button>
                              <button className="btn-icon btn-delete" onClick={() => handleProductDelete(product._id)} title="Eliminar">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'ordenes' && (
              <div className="admin-section">
                <div className="section-header">
                  <h2>Gestión de Órdenes</h2>
                  {orders.some(o => !o.eliminadoAdmin) && (
                    <Button variant="danger" onClick={handleHideAllOrders}>
                      🗑️ Borrar Todas
                    </Button>
                  )}
                </div>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID Orden</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Pago</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.filter(order => !order.eliminadoAdmin).map(order => (
                        <tr key={order._id}>
                          <td>#{order._id.substring(order._id.length - 6)}</td>
                          <td>{order.usuario?.nombre || (order.nombreInvitado ? `${order.nombreInvitado} (Invitado)` : 'INVITADO')} <br/><span style={{fontSize:'0.75rem', color:'#64748b'}}>{order.usuario?.email || ''}</span></td>
                          <td>{new Date(order.date).toLocaleString('es-MX')}</td>
                          <td><strong>{formatMoney(order.total)}</strong></td>
                          <td>{order.metodoPago || 'Efectivo'}</td>
                          <td>
                            <select 
                              className="status-select"
                              value={
                                order.status === 'Completada' || order.status === 'Terminada'
                                  ? 'Orden Terminada'
                                  : order.status
                              }
                              onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                            >
                              <option value="Pendiente">Pendiente</option>
                              <option value="En preparación">En preparación</option>
                              <option value="Orden Terminada">Orden Terminada</option>
                              <option value="Cancelada">Cancelada</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'usuarios' && (
              <div className="admin-section">
                <div className="section-header">
                  <h2>Gestión de Usuarios</h2>
                  <Button variant="primary" onClick={openNewUserModal}>+ Añadir Usuario</Button>
                </div>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => u.rol !== 'Cliente').map(user => (
                        <tr key={user._id}>
                          <td><strong>{user.nombre}</strong></td>
                          <td>{user.email}</td>
                          <td>{user.telefono || '-'}</td>
                          <td>
                            <span style={{
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '6px', 
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              backgroundColor: user.rol === 'Administrador' ? '#fee2e2' : user.rol === 'Chef' ? '#fef9c3' : '#e0f2fe',
                              color: user.rol === 'Administrador' ? '#991b1b' : user.rol === 'Chef' ? '#854d0e' : '#0369a1'
                            }}>
                              {user.rol}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon btn-edit" onClick={() => openEditUserModal(user)} title="Editar">✏️</button>
                              <button className="btn-icon btn-delete" onClick={() => handleUserDelete(user._id)} title="Eliminar">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'clientes' && (
              <div className="admin-section">
                <div className="section-header">
                  <h2>Gestión de Clientes</h2>
                </div>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Compras</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => u.rol === 'Cliente').map(user => (
                        <tr key={user._id}>
                          <td><strong>{user.nombre}</strong></td>
                          <td>{user.email}</td>
                          <td>{user.telefono || '-'}</td>
                          <td>
                            {(() => {
                              const clientOrders = orders.filter(o => o.usuario?._id === user._id || o.usuario?.email === user.email);
                              if (clientOrders.length === 0) {
                                return <span style={{ color: '#64748b' }}>0 compras</span>;
                              }
                              return (
                                <button 
                                  className="btn-link" 
                                  onClick={() => openPurchasesModal(user)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#16a34a',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    padding: 0,
                                    fontFamily: 'inherit',
                                    fontSize: 'inherit',
                                    fontWeight: '600',
                                    textAlign: 'left'
                                  }}
                                >
                                  {clientOrders.length} {clientOrders.length === 1 ? 'compra' : 'compras'}
                                </button>
                              );
                            })()}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon btn-edit" onClick={() => openEditClientModal(user)} title="Editar">✏️</button>
                              <button className="btn-icon btn-delete" onClick={() => handleUserDelete(user._id)} title="Eliminar">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'finanzas' && (
              <div className="admin-section">
                <div className="section-header">
                  <h2>Ganancias y Finanzas</h2>
                  <Button variant="primary" onClick={handleSaveFinanceReport}>💾 Guardar Reporte Actual</Button>
                </div>

                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>Ventas Hoy</h3>
                    <p>{formatMoney(getTodaySales())}</p>
                  </div>
                  <div className="stat-card blue">
                    <h3>Ventas Mes</h3>
                    <p>{formatMoney(getMonthSales())}</p>
                  </div>
                  <div className="stat-card orange">
                    <h3>Ventas Históricas</h3>
                    <p>{formatMoney(getHistoricalSales())}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Órdenes Totales</h3>
                    <p>{orders.length}</p>
                  </div>
                </div>

                <div className="section-header" style={{ marginTop: '2rem', borderBottom: 'none' }}>
                  <h3>Detalle de Ventas Completadas</h3>
                </div>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID Orden</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Método Pago</th>
                        <th>Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders
                        .filter(o => o.status === 'Completada' || o.status === 'Orden Terminada' || o.status === 'Terminada')
                        .map(order => (
                          <tr key={order._id}>
                            <td>#{order._id.substring(order._id.length - 6)}</td>
                            <td>{order.usuario?.nombre || (order.nombreInvitado ? `${order.nombreInvitado} (Invitado)` : 'INVITADO')}</td>
                            <td>{new Date(order.date).toLocaleString('es-MX')}</td>
                            <td>{order.metodoPago}</td>
                            <td><strong>{formatMoney(order.total)}</strong></td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="section-header" style={{ marginTop: '3rem', borderBottom: 'none' }}>
                  <h3>Historial de Reportes Guardados</h3>
                </div>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Fecha del Reporte</th>
                        <th>Registrado Por</th>
                        <th>Ventas Hoy</th>
                        <th>Ventas Mes</th>
                        <th>Ventas Históricas</th>
                        <th>Órdenes Totales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financeReports.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                            No hay reportes financieros guardados aún.
                          </td>
                        </tr>
                      ) : (
                        financeReports.map(report => (
                          <tr key={report._id}>
                            <td>{new Date(report.fechaReporte).toLocaleString('es-MX')}</td>
                            <td>{report.registradoPor?.nombre || 'Administrador'}</td>
                            <td>{formatMoney(report.ventasHoy)}</td>
                            <td>{formatMoney(report.ventasMes)}</td>
                            <td>{formatMoney(report.ventasHistoricas)}</td>
                            <td>{report.ordenesTotales}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* PRODUCT MODAL */}
      {showProductModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>{editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}</h3>
            <form onSubmit={handleProductSubmit}>
              <div className="form-row">
                <label>Nombre del Producto *</label>
                <input 
                  type="text" 
                  value={prodName} 
                  onChange={(e) => setProdName(e.target.value)} 
                  required 
                  placeholder="Ej. Café Espresso"
                />
              </div>
              <div className="form-row">
                <label>Precio *</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={prodPrice} 
                  onChange={(e) => setProdPrice(e.target.value)} 
                  required 
                  placeholder="Ej. 45.00"
                />
              </div>
              <div className="form-row">
                <label>Disponibilidad *</label>
                <select 
                  value={prodStock} 
                  onChange={(e) => setProdStock(e.target.value)}
                  required
                >
                  <option value="1">Disponible</option>
                  <option value="0">No disponible</option>
                </select>
              </div>
              <div className="form-row">
                <label>Imagen del Producto</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {prodImage && (
                    <img 
                      src={prodImage} 
                      alt="Vista previa" 
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} 
                      onError={(e) => { e.target.src = '/img/products/placeholder.svg'; }}
                    />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setUploadingImage(true);
                      try {
                        const res = await uploadProductImage(file);
                        setProdImage(res.imageUrl);
                      } catch (err) {
                        alert("Error al subir la imagen");
                      } finally {
                        setUploadingImage(false);
                      }
                    }}
                  />
                  {uploadingImage && <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Subiendo...</span>}
                </div>
              </div>
              <div className="form-row">
                <label>Categoría *</label>
                <select 
                  value={prodCategory} 
                  onChange={(e) => setProdCategory(e.target.value)}
                >
                  <option value="CALIENTE">CALIENTE</option>
                  <option value="FRIO">FRIO</option>
                  <option value="PANADERIA">PANADERIA</option>
                  <option value="PASTELERIA">PASTELERIA</option>
                  <option value="ALIMENTOS">ALIMENTOS</option>
                  <option value="OTROS">OTROS</option>
                </select>
              </div>
              <div className="form-row">
                <label>Descripción</label>
                <textarea 
                  value={prodDescription} 
                  onChange={(e) => setProdDescription(e.target.value)} 
                  placeholder="Ingresa la descripción del producto..."
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <Button type="button" variant="secondary" onClick={() => setShowProductModal(false)}>Cancelar</Button>
                <Button type="submit" variant="primary">Guardar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLIENT MODAL */}
      {showClientModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>Editar Cliente</h3>
            <form onSubmit={handleClientSubmit}>
              <div className="form-row">
                <label>Nombre Completo *</label>
                <input 
                  type="text" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)} 
                  required 
                  minLength={3}
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div className="form-row">
                <label>Email *</label>
                <input 
                  type="email" 
                  value={userEmail} 
                  onChange={(e) => setUserEmail(e.target.value)} 
                  required 
                  placeholder="ejemplo@cafesito.com"
                />
              </div>
              <div className="form-row">
                <label>Teléfono</label>
                <input 
                  type="tel" 
                  value={userPhone} 
                  onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} 
                  placeholder="Ej. 5551234567"
                  pattern="\d{10}"
                  maxLength={10}
                />
              </div>
              <div className="modal-actions">
                <Button type="button" variant="secondary" onClick={() => setShowClientModal(false)}>Cancelar</Button>
                <Button type="submit" variant="primary">Guardar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PURCHASES MODAL */}
      {showPurchasesModal && clientForPurchases && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: '650px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0 }}>Historial de Compras: {clientForPurchases.nombre}</h3>
              <button 
                onClick={() => setShowPurchasesModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
              {(() => {
                const clientOrders = orders.filter(
                  o => o.usuario?._id === clientForPurchases._id || o.usuario?.email === clientForPurchases.email
                );
                
                if (clientOrders.length === 0) {
                  return <p style={{ color: '#64748b', textAlign: 'center', margin: '2rem 0' }}>Este cliente aún no ha realizado compras.</p>;
                }

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {clientOrders.map(order => (
                      <div key={order._id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', backgroundColor: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: '700', color: '#1e293b' }}>Orden #{order._id.substring(order._id.length - 6)}</span>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: (order.status === 'Completada' || order.status === 'Orden Terminada' || order.status === 'Terminada') ? '#dcfce7' : order.status === 'Cancelada' ? '#fee2e2' : '#fef9c3',
                            color: (order.status === 'Completada' || order.status === 'Orden Terminada' || order.status === 'Terminada') ? '#15803d' : order.status === 'Cancelada' ? '#991b1b' : '#854d0e'
                          }}>
                            {order.status === 'Completada' || order.status === 'Terminada' ? 'Orden Terminada' : order.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
                          <span>{new Date(order.date).toLocaleString('es-MX')}</span>
                          <span style={{ margin: '0 0.5rem' }}>•</span>
                          <span>Pago: {order.metodoPago || 'Efectivo'}</span>
                        </div>
                        
                        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>Productos:</span>
                          <ul style={{ listStyle: 'none', padding: 0, margin: '0.25rem 0 0 0' }}>
                            {order.items?.map((item, idx) => (
                              <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#334155', margin: '0.2rem 0' }}>
                                <span>{item.name || item.title || 'Producto'} (x{item.quantity || 1})</span>
                                <span>{formatMoney((item.price || 0) * (item.quantity || 1))}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #cbd5e1', marginTop: '0.75rem', paddingTop: '0.5rem', fontWeight: '700' }}>
                          <span>Total</span>
                          <span>{formatMoney(order.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <Button onClick={() => setShowPurchasesModal(false)} variant="secondary">Cerrar</Button>
            </div>
          </div>
        </div>
      )}

      {/* USER MODAL */}
      {showUserModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>{editingUser ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</h3>
            <form onSubmit={handleUserSubmit}>
              <div className="form-row">
                <label>Nombre Completo *</label>
                <input 
                  type="text" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)} 
                  required 
                  minLength={3}
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div className="form-row">
                <label>Email *</label>
                <input 
                  type="email" 
                  value={userEmail} 
                  onChange={(e) => setUserEmail(e.target.value)} 
                  required 
                  placeholder="ejemplo@cafesito.com"
                />
              </div>
              <div className="form-row">
                <label>Teléfono</label>
                <input 
                  type="tel" 
                  value={userPhone} 
                  onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} 
                  placeholder="Ej. 5551234567"
                  pattern="\d{10}"
                  maxLength={10}
                />
              </div>
              <div className="form-row">
                <label>{editingUser ? 'Nueva Contraseña (dejar vacío para mantener actual)' : 'Contraseña *'}</label>
                <input 
                  type="password" 
                  value={userPassword} 
                  onChange={(e) => setUserPassword(e.target.value)} 
                  required={!editingUser}
                  placeholder="Contraseña"
                />
              </div>
              <div className="form-row">
                <label>Rol *</label>
                <select 
                  value={userRole} 
                  onChange={(e) => setUserRole(e.target.value)}
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Cajero">Cajero</option>
                  <option value="Chef">Chef</option>
                  <option value="Seleccionar Rol">Seleccioner Rol</option>
                </select>
              </div>
              <div className="modal-actions">
                <Button type="button" variant="secondary" onClick={() => setShowUserModal(false)}>Cancelar</Button>
                <Button type="submit" variant="primary">Guardar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
