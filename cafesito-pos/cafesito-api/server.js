import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import conectarDB from './src/config/database.js';

// Import Routes
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import paymentMethodRoutes from './src/routes/paymentMethodRoutes.js';
import financeRoutes from './src/routes/financeRoutes.js';
import { actionLogger } from './src/middlewares/loggerMiddleware.js';

dotenv.config();

// Connect to Database
conectarDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado (socket):', socket.id);

  socket.on('pos-cart-update', (cartItems) => {
    // Re-transmitir el carrito actualizado a los demás clientes
    socket.broadcast.emit('sync-pos-cart', cartItems);
  });

  socket.on('pos-client-update', (clientName) => {
    // Re-transmitir el nombre del cliente a los demás clientes
    socket.broadcast.emit('sync-pos-client', clientName);
  });

  socket.on('pos-order-finished', (orderData) => {
    // Re-transmitir notificación de orden terminada al Dashboard de Empleado
    socket.broadcast.emit('sync-order-finished', orderData);
  });

  socket.on('pos-order-created', (orderData) => {
    // Re-transmitir la nueva orden al Dashboard de Chef y otros clientes
    socket.broadcast.emit('sync-orders', orderData);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(actionLogger);
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/finance', financeRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
