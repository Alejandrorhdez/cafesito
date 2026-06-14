import express from 'express';
import financeController from '../controllers/financeController.js';
import { proteger } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', proteger, financeController.crearReporte);
router.get('/', proteger, financeController.obtenerReportes);

export default router;
