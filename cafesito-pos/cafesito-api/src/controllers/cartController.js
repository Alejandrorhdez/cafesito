import Cart from '../models/Cart.js';

export const obtenerCarrito = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        let carrito = await Cart.findOne({ usuario: usuarioId }).populate('items.producto');
        
        if (!carrito) {
            carrito = new Cart({ usuario: usuarioId, items: [], total: 0 });
            await carrito.save();
        }
        
        res.json(carrito);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el carrito' });
    }
};

export const agregarItemAlCarrito = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const { producto, cantidad, precio } = req.body;

        let carrito = await Cart.findOne({ usuario: usuarioId });
        
        if (!carrito) {
            carrito = new Cart({ usuario: usuarioId, items: [], total: 0 });
        }

        const itemIndex = carrito.items.findIndex(item => item.producto.toString() === producto);

        if (itemIndex > -1) {
            carrito.items[itemIndex].cantidad += cantidad;
        } else {
            carrito.items.push({ producto, cantidad, precio });
        }

        carrito.total += (cantidad * precio);
        await carrito.save();

        res.status(200).json({ mensaje: 'Item agregado al carrito', carrito });
    } catch (error) {
        res.status(400).json({ error: 'Error al agregar item al carrito' });
    }
};

export const vaciarCarrito = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        await Cart.findOneAndDelete({ usuario: usuarioId });
        res.json({ mensaje: 'Carrito vaciado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al vaciar el carrito' });
    }
};

export default {
    obtenerCarrito,
    agregarItemAlCarrito,
    vaciarCarrito
};