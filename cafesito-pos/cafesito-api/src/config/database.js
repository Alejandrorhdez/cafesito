import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const conectarDB = async () => {
    try {
        const urlLocal = process.env.MONGODB_URI || 'mongodb://localhost:27017/cafeteria_pos'; 
        
        await mongoose.connect(urlLocal);
        console.log('✅ Conexión exitosa a MongoDB');
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error.message);
        process.exit(1);
    }
};

export default conectarDB;