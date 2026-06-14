import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    cantidad: { type: Number, required: true, default: 1 },
    precio: { type: Number, required: true }
});

const cartSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [cartItemSchema],
    total: { type: Number, required: true, default: 0 }
}, {
    timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
