import express from 'express';
import orderController from '../controllers/orderController.js';
import { proteger } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get("/", proteger, orderController.obtenerOrdenes);
router.get("/user/:userId", proteger, orderController.obtenerOrdenesUsuario);
router.post("/", proteger, orderController.crearOrden);
router.put("/hide-all", proteger, orderController.ocultarTodasOrdenes);
router.put("/:id", proteger, orderController.actualizarEstadoOrden);

export default router;