import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generar Token JWT
const generarToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secreto_cafeteria_pos_dev', {
        expiresIn: '30d',
    });
};

// POST: Registrar un nuevo usuario
const registrarUsuario = async (req, res, next) => {
    try {
        const { nombre, email, password, rol, telefono } = req.body;

        // Validaciones
        if (!nombre || nombre.trim().length < 3) {
            return res.status(400).json({ error: 'El nombre debe tener al menos 3 letras' });
        }
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'El correo debe contener @' });
        }
        const userRole = rol || 'Cliente';
        const isClient = userRole === 'Cliente';
        if (isClient && (!telefono || !/^\d{10}$/.test(telefono.trim()))) {
            return res.status(400).json({ error: 'El número de teléfono debe tener exactamente 10 números' });
        }
        if (telefono && !/^\d{10}$/.test(telefono.trim())) {
            return res.status(400).json({ error: 'El número de teléfono debe tener exactamente 10 números' });
        }

        // Validar si el usuario ya existe
        const usuarioExiste = await User.findOne({ email });
        if (usuarioExiste) {
            return res.status(400).json({ error: 'El usuario ya está registrado con este correo' });
        }

        // Crear usuario
        const usuario = await User.create({
            nombre: nombre.trim(),
            email: email.trim(),
            password: password || 'Cafesito123!',
            rol: userRole,
            telefono: telefono ? telefono.trim() : undefined
        });

        if (usuario) {
            res.status(201).json({
                _id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                token: generarToken(usuario._id)
            });
        } else {
            res.status(400).json({ error: 'Datos de usuario inválidos' });
        }
    } catch (error) {
        next(error);
    }
};

// POST: Iniciar sesión
const loginUsuario = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Verificar el email
        const usuario = await User.findOne({ email });

        // Verificar la contraseña y el usuario
        if (usuario && (await usuario.compararPassword(password))) {
            res.json({
                _id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                token: generarToken(usuario._id)
            });
        } else {
            res.status(401).json({ error: 'Credenciales inválidas' });
        }
    } catch (error) {
        next(error);
    }
};

// GET: Obtener perfil de usuario autenticado
const obtenerPerfil = async (req, res, next) => {
    try {
        const usuario = await User.findById(req.usuario._id);
        
        if (usuario) {
            res.json({
                _id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        next(error);
    }
};

export default { registrarUsuario, loginUsuario, obtenerPerfil };
