import User from '../models/User.js';
import { getDiscountPercentage } from '../utils/discountHelper.js';

export const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await User.find().select('-password');
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

export const obtenerUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await User.findById(id).select('-password');
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }
        
        const descuento = await getDiscountPercentage(usuario._id);
        const userObj = usuario.toObject();
        userObj.descuento = descuento;
        
        res.json(userObj);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
};

export const crearUsuario = async (req, res) => {
    try {
        const { nombre, email, rol, password, pin, telefono } = req.body;
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios." });
        }
        if (nombre.trim().length < 3) {
            return res.status(400).json({ error: "El nombre debe tener al menos 3 letras." });
        }
        if (!email.includes('@')) {
            return res.status(400).json({ error: "El correo debe contener @." });
        }
        const userRole = rol || 'Cliente';
        const isClient = userRole === 'Cliente';
        if (isClient && (!telefono || !/^\d{10}$/.test(telefono.trim()))) {
            return res.status(400).json({ error: "El número de teléfono debe tener exactamente 10 números." });
        }
        if (telefono && !/^\d{10}$/.test(telefono.trim())) {
            return res.status(400).json({ error: "El número de teléfono debe tener exactamente 10 números." });
        }

        const nuevoUsuario = new User({
            nombre: nombre.trim(),
            email: email.trim(),
            rol: userRole,
            password,
            pin,
            telefono: telefono ? telefono.trim() : undefined
        });
        await nuevoUsuario.save();
        
        // Remove password before sending
        const userResponse = nuevoUsuario.toObject();
        delete userResponse.password;

        res.status(201).json({ mensaje: "Usuario agregado", usuario: userResponse });
    } catch (error) {
        res.status(400).json({ error: 'Error al crear el usuario' });
    }
};

export const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, rol, email, pin, telefono } = req.body;

        if (nombre && nombre.trim().length < 3) {
            return res.status(400).json({ error: "El nombre debe tener al menos 3 letras." });
        }
        if (email && !email.includes('@')) {
            return res.status(400).json({ error: "El correo debe contener @." });
        }
        const userRole = rol || 'Cliente';
        const isClient = userRole === 'Cliente';
        if (isClient && (!telefono || !/^\d{10}$/.test(telefono.trim()))) {
            return res.status(400).json({ error: "El número de teléfono debe tener exactamente 10 números." });
        }
        if (telefono && !/^\d{10}$/.test(telefono.trim())) {
            return res.status(400).json({ error: "El número de teléfono debe tener exactamente 10 números." });
        }

        const usuarioActualizado = await User.findByIdAndUpdate(
            id,
            {
                nombre: nombre ? nombre.trim() : undefined,
                rol: userRole,
                email: email ? email.trim() : undefined,
                pin,
                telefono: telefono ? telefono.trim() : undefined
            },
            { new: true }
        ).select('-password');

        if (!usuarioActualizado) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        res.json({ mensaje: "Usuario actualizado", usuario: usuarioActualizado });
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar el usuario' });
    }
};

export const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioEliminado = await User.findByIdAndDelete(id);

        if (!usuarioEliminado) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        res.json({ mensaje: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(400).json({ error: 'Error al eliminar el usuario' });
    }
};

export const buscarUsuarioPorTelefono = async (req, res) => {
    try {
        const { telefono } = req.query;
        if (!telefono) {
            return res.status(400).json({ error: "El teléfono es obligatorio." });
        }
        const usuario = await User.findOne({ telefono, rol: 'Cliente' }).select('-password');
        if (!usuario) {
            return res.status(404).json({ error: "Cliente no registrado." });
        }
        
        const descuento = await getDiscountPercentage(usuario._id);
        const userObj = usuario.toObject();
        userObj.descuento = descuento;
        
        res.json(userObj);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar el usuario por teléfono' });
    }
};

export default {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    obtenerUsuarioPorId,
    buscarUsuarioPorTelefono
};