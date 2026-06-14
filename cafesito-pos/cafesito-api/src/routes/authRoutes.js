import express from 'express';
import authController from '../controllers/authController.js';
import { proteger } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/registrar', authController.registrarUsuario);
router.post('/login', authController.loginUsuario);
router.get('/perfil', proteger, authController.obtenerPerfil);

export default router;
