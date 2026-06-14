import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '../services/productService';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService';
import { getAllOrders, updateOrderStatus, hideAllOrdersFromAdmin } from '../services/orderService';
import { getFinanceReports, saveFinanceReport } from '../services/financeService';
import { Button, Loading, ErrorMessage } from '../components/atoms';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('productos');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [financeReports, setFinanceReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showPurchasesModal, setShowPurchasesModal] = useState(false);
  const [clientForPurchases, setClientForPurchases] = useState(null);

  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('1');
  const [prodCategory, setProdCategory] = useState('CALIENTE');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

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
    setUserPassword('');
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

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
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
                          <td className="admin-prod-image-cell">
                            <img 
                              src={product.imagen || '/img/products/placeholder.svg'} 
                              alt={product.name} 
                              className="admin-prod-img-preview" 
                              onError={(e) => { e.target.src = '/img/products/placeholder.svg'; }}
                            />
                            <strong>{product.name}</strong>
                          </td>
                          <td>{product.category || 'Sin categoría'}</td>
                          <td>{formatMoney(product.price)}</td>
                          <td>
                            <span className={`admin-badge ${product.stock > 0 ? 'admin-badge-available' : 'admin-badge-unavailable'}`}>
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
                          <td>{order.usuario?.nombre || (order.nombreInvitado ? `${order.nombreInvitado} (Invitado)` : 'INVITADO')} <br/><span className="admin-order-client-email">{order.usuario?.email || ''}</span></td>
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
                            <span className={`admin-badge ${user.rol === 'Administrador' ? 'admin-user-badge-admin' : user.rol === 'Chef' ? 'admin-user-badge-chef' : 'admin-user-badge-cajero'}`}>
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
                                return <span className="admin-client-zero-purchases">0 compras</span>;
                              }
                              return (
                                <button 
                                  className="admin-client-purchases-btn" 
                                  onClick={() => openPurchasesModal(user)}
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

                <div className="section-header admin-section-header-margin-2">
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

                <div className="section-header admin-section-header-margin-3">
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
                          <td colSpan="6" className="admin-table-empty-td">
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
                <div className="admin-flex-gap-1">
                  {prodImage && (
                    <img 
                      src={prodImage} 
                      alt="Vista previa" 
                      className="admin-image-upload-preview" 
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
                  {uploadingImage && <span className="admin-text-uploading">Subiendo...</span>}
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

      {showPurchasesModal && clientForPurchases && (
        <div className="modal-backdrop">
          <div className="modal-box admin-modal-box-purchases">
            <div className="admin-modal-purchases-header">
              <h3 className="admin-modal-title-margin-0">Historial de Compras: {clientForPurchases.nombre}</h3>
              <button 
                onClick={() => setShowPurchasesModal(false)}
                className="admin-modal-close-btn"
              >
                &times;
              </button>
            </div>
            
            <div className="admin-modal-scrollable-body">
              {(() => {
                const clientOrders = orders.filter(
                  o => o.usuario?._id === clientForPurchases._id || o.usuario?.email === clientForPurchases.email
                );
                
                if (clientOrders.length === 0) {
                  return <p className="admin-purchases-empty-p">Este cliente aún no ha realizado compras.</p>;
                }

                return (
                  <div className="admin-purchases-list-container">
                    {clientOrders.map(order => (
                      <div key={order._id} className="admin-purchase-item-card">
                        <div className="admin-purchase-item-header">
                          <span className="admin-purchase-item-order-id">Orden #{order._id.substring(order._id.length - 6)}</span>
                          <span className={`admin-purchase-item-status-badge ${(order.status === 'Completada' || order.status === 'Orden Terminada' || order.status === 'Terminada') ? 'admin-purchase-item-status-completed' : order.status === 'Cancelada' ? 'admin-purchase-item-status-cancelled' : 'admin-purchase-item-status-other'}`}>
                            {order.status === 'Completada' || order.status === 'Terminada' ? 'Orden Terminada' : order.status}
                          </span>
                        </div>
                        <div className="admin-purchase-item-meta">
                          <span>{new Date(order.date).toLocaleString('es-MX')}</span>
                          <span className="admin-purchase-item-meta-dot">•</span>
                          <span>Pago: {order.metodoPago || 'Efectivo'}</span>
                        </div>
                        
                        <div className="admin-purchase-item-products-section">
                          <span className="admin-purchase-item-products-label">Productos:</span>
                          <ul className="admin-purchase-item-products-list">
                            {order.items?.map((item, idx) => (
                              <li key={idx} className="admin-purchase-item-products-li">
                                <span>{item.name || item.title || 'Producto'} (x{item.quantity || 1})</span>
                                <span>{formatMoney((item.price || 0) * (item.quantity || 1))}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="admin-purchase-item-totals-row">
                          <span>Total</span>
                          <span>{formatMoney(order.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            
            <div className="admin-modal-footer">
              <Button onClick={() => setShowPurchasesModal(false)} variant="secondary">Cerrar</Button>
            </div>
          </div>
        </div>
      )}

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
