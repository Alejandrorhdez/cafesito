import { io } from 'socket.io-client';

// Ajusta la URL según el entorno de tu backend
const URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const socket = io(URL, {
  autoConnect: true,
});
