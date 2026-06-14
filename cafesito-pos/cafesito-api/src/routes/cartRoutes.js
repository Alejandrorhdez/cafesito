import express from 'express';
import cartController from '../controllers/cartController.js';
import { proteger } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/:usuarioId", proteger, cartController.obtenerCarrito);
router.post("/:usuarioId", proteger, cartController.agregarItemAlCarrito);
router.delete("/:usuarioId", proteger, cartController.vaciarCarrito);

export default router;