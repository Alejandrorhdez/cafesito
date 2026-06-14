import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    categoria: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    descripcion: { type: String },
    imagen: { type: String },
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);
export default Product;