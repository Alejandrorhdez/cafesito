import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    tipo: { type: String, enum: ['Efectivo', 'Tarjeta', 'Transferencia'], required: true },
    activo: { type: Boolean, default: true }
}, {
    timestamps: true
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
export default PaymentMethod;
