import express from 'express';
import userController from '../controllers/userController.js';
import { proteger } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/isAdminMiddleware.js';

const router = express.Router();

router.get("/", proteger, isAdmin, userController.obtenerUsuarios);
router.get("/buscar-por-telefono", proteger, userController.buscarUsuarioPorTelefono);
router.get("/:id", proteger, userController.obtenerUsuarioPorId);
router.post("/", proteger, isAdmin, userController.crearUsuario);
router.put("/:id", proteger, isAdmin, userController.actualizarUsuario);
router.delete("/:id", proteger, isAdmin, userController.eliminarUsuario);

export default router;