export const isAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.rol === 'Administrador') {
        next();
    } else {
        res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
};
