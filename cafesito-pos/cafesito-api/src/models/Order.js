import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    nombreInvitado: { type: String, required: false },
    productos: [{
        producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        cantidad: { type: Number, required: true },
        precio: { type: Number, required: true }
    }],
    total: { type: Number, required: true },
    metodoPago: { type: String, required: true },
    estado: { type: String, enum: ['Pendiente', 'En preparación', 'Orden Terminada', 'Completada', 'Cancelada'], default: 'Pendiente' },
    completadaPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    eliminadoAdmin: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;