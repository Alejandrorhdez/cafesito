export const actionLogger = (req, res, next) => {
    res.on('finish', () => {
        // Obtenemos la fecha y hora actual formateada
        const fecha = new Date().toLocaleString('es-MX', { 
            timeZone: 'America/Mexico_City',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Si hay un usuario logueado en la request (inyectado por authMiddleware)
        if (req.usuario) {
            const nombre = req.usuario.name || req.usuario.nombre || 'Usuario Desconocido';
            const rol = req.usuario.role || req.usuario.rol || 'Sin Rol';
            const metodo = req.method;
            const ruta = req.originalUrl;
            
            console.log(`[${fecha}] Movimiento: ${metodo} ${ruta} - Realizado por: ${nombre} (${rol})`);
        } else {
            // Opcional: loguear también movimientos sin usuario (públicos)
            // console.log(`[${fecha}] Movimiento: ${req.method} ${req.originalUrl} - Visitante (No autenticado)`);
        }
    });

    next();
};
