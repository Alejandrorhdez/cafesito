import Product from '../models/Product.js';

export const obtenerProductos = async (req, res) => {
    try {
        const productos = await Product.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
};

export const crearProducto = async (req, res) => {
    try {
        const { nombre, precio, stock, descripcion, categoria, imagen } = req.body;
        const nuevoProducto = new Product({ nombre, precio, stock, descripcion, categoria, imagen });
        await nuevoProducto.save();
        res.status(201).json({ mensaje: 'Producto agregado correctamente', producto: nuevoProducto });
    } catch (error) {
        res.status(400).json({ error: 'Error al crear el producto' });
    }
};

export const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, stock, descripcion, categoria, imagen } = req.body;

        const productoActualizado = await Product.findByIdAndUpdate(
            id,
            { nombre, precio, stock, descripcion, categoria, imagen },
            { new: true }
        );

        if (!productoActualizado) {
            return res.status(404).json({ error: "Producto no encontrado." });
        }

        res.json({ mensaje: "Producto actualizado con éxito", producto: productoActualizado });
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar el producto' });
    }
};

export const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const productoEliminado = await Product.findByIdAndDelete(id);

        if (!productoEliminado) {
            return res.status(404).json({ error: "Producto no encontrado." });
        }

        res.json({ mensaje: "Producto eliminado correctamente", producto: productoEliminado });
    } catch (error) {
        res.status(400).json({ error: 'Error al eliminar el producto' });
    }
};

export default {
    obtenerProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};