import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';

export const obtenerOrdenes = async (req, res) => {
    try {
        const ordenes = await Order.find()
            .populate('usuario', 'nombre email')
            .populate('productos.producto', 'nombre precio')
            .populate('completadaPor', 'nombre');
        res.json(ordenes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las órdenes' });
    }
};

export const crearOrden = async (req, res) => {
    try {
        const { usuario, nombreInvitado, productos, total, metodoPago } = req.body;
        
        const nuevaOrden = new Order({
            usuario,
            nombreInvitado,
            productos,
            total,
            metodoPago
        });
        
        await nuevaOrden.save();

        // Incrementar comprasRealizadas para usuarios con rol Cliente
        if (usuario) {
            const clienteObj = await User.findById(usuario);
            if (clienteObj && clienteObj.rol === 'Cliente') {
                clienteObj.comprasRealizadas = (clienteObj.comprasRealizadas || 0) + 1;
                await clienteObj.save();
            }
        }
        
        // Opcional: Limpiar el carrito del usuario al crear una orden
        if (usuario) {
            await Cart.findOneAndDelete({ usuario });
        }

        res.status(201).json({ mensaje: 'Orden creada exitosamente', orden: nuevaOrden });
    } catch (error) {
        console.error("Error al crear la orden:", error);
        res.status(400).json({ error: 'Error al crear la orden' });
    }
};

export const actualizarEstadoOrden = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, eliminadoAdmin } = req.body;

        const updateData = {};
        if (estado !== undefined) {
            updateData.estado = estado;
            if (estado === 'Orden Terminada' || estado === 'Terminada' || estado === 'Completada') {
                updateData.completadaPor = req.usuario._id;
            }
        }
        if (eliminadoAdmin !== undefined) {
            updateData.eliminadoAdmin = eliminadoAdmin;
        }

        const ordenActualizada = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!ordenActualizada) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        res.json({ mensaje: 'Orden actualizada', orden: ordenActualizada });
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar la orden' });
    }
};

export const obtenerOrdenesUsuario = async (req, res) => {
    try {
        const { userId } = req.params;
        const ordenes = await Order.find({ usuario: userId })
            .populate('usuario', 'nombre email')
            .populate('productos.producto', 'nombre precio')
            .sort({ createdAt: -1 });
        res.json(ordenes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las órdenes del usuario' });
    }
};

export const ocultarTodasOrdenes = async (req, res) => {
    try {
        await Order.updateMany(
            { eliminadoAdmin: { $ne: true } },
            { eliminadoAdmin: true }
        );
        res.json({ mensaje: 'Todas las órdenes han sido ocultadas del panel de administración' });
    } catch (error) {
        res.status(500).json({ error: 'Error al ocultar las órdenes' });
    }
};

export default {
    obtenerOrdenes,
    crearOrden,
    actualizarEstadoOrden,
    obtenerOrdenesUsuario,
    ocultarTodasOrdenes
};