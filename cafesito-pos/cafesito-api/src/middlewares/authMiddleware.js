import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const proteger = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_cafeteria_pos_dev');
            req.usuario = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ error: 'No autorizado, token fallido' });
        }
    } else {
        res.status(401).json({ error: 'No autorizado, no hay token' });
    }
};
