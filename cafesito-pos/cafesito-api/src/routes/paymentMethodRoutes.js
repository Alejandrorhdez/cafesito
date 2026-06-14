import express from 'express';
import paymentMethodController from '../controllers/paymentMethodController.js';
import { proteger } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/isAdminMiddleware.js';

const router = express.Router();

router.get("/", proteger, paymentMethodController.obtenerMetodosPago);
router.post("/", proteger, isAdmin, paymentMethodController.crearMetodoPago);
router.put("/:id/desactivar", proteger, isAdmin, paymentMethodController.desactivarMetodoPago);

export default router;