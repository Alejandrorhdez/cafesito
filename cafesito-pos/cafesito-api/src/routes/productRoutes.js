import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import productController from '../controllers/productController.js';
import { proteger } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/isAdminMiddleware.js';

// Asegurar que la carpeta uploads exista
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

const router = express.Router();

router.get("/", productController.obtenerProductos);
router.post("/", proteger, isAdmin, productController.crearProducto);
router.put("/:id", proteger, isAdmin, productController.actualizarProducto);
router.delete("/:id", proteger, isAdmin, productController.eliminarProducto);

router.post("/upload", proteger, isAdmin, upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No se proporcionó ningún archivo de imagen" });
    }
    const host = req.get('host');
    const imageUrl = `${req.protocol}://${host}/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

export default router;