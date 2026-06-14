import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from '../../pages/Login';
import Register from '../../pages/Register';
import ClientDashboard from '../../pages/ClientDashboard';
import EmployeeDashboard from '../../pages/EmployeeDashboard';
import ChefDashboard from '../../pages/ChefDashboard';
import AdminDashboard from '../../pages/AdminDashboard';
import ProtectedRoute from '../../pages/ProtectedRoute';
import Cart from '../../pages/Cart';
import Checkout from '../../pages/Checkout';
import Orders from '../../pages/Orders';
import OrderConfirmation from '../../pages/OrderConfirmation';
import { Layout } from '../templates';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route 
          path="/register" 
          element={
            <ProtectedRoute>
              <Register />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/cliente" 
          element={<ClientDashboard />} 
        />
        
        <Route 
          path="/empleado" 
          element={
            <ProtectedRoute allowedRoles={['Cajero', 'Administrador']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/chef" 
          element={
            <ProtectedRoute allowedRoles={['Chef']}>
              <ChefDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['Administrador']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/cart" 
          element={<Cart />} 
        />

        <Route 
          path="/checkout" 
          element={<Checkout />} 
        />

        <Route 
          path="/orders" 
          element={<Orders />} 
        />

        <Route 
          path="/order-confirmation" 
          element={<OrderConfirmation />} 
        />

        <Route 
          path="/register-client" 
          element={
            <ProtectedRoute allowedRoles={['Cajero', 'Administrador']}>
              <Register />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
