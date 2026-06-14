import PaymentMethod from '../models/PaymentMethod.js';

export const obtenerMetodosPago = async (req, res) => {
    try {
        const metodos = await PaymentMethod.find({ activo: true });
        res.json(metodos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener métodos de pago' });
    }
};

export const crearMetodoPago = async (req, res) => {
    try {
        const { nombre, tipo } = req.body;
        const nuevoMetodo = new PaymentMethod({ nombre, tipo });
        await nuevoMetodo.save();
        res.status(201).json({ mensaje: 'Método de pago agregado', metodo: nuevoMetodo });
    } catch (error) {
        res.status(400).json({ error: 'Error al crear método de pago' });
    }
};

export const desactivarMetodoPago = async (req, res) => {
    try {
        const { id } = req.params;
        const metodo = await PaymentMethod.findByIdAndUpdate(id, { activo: false }, { new: true });
        
        if (!metodo) {
            return res.status(404).json({ error: 'Método de pago no encontrado' });
        }
        
        res.json({ mensaje: 'Método de pago desactivado', metodo });
    } catch (error) {
        res.status(400).json({ error: 'Error al desactivar método de pago' });
    }
};

export default {
    obtenerMetodosPago,
    crearMetodoPago,
    desactivarMetodoPago
};