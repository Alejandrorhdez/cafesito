// Middleware para manejar rutas no encontradas (404)
const notFound = (req, res, next) => {
    const error = new Error(`No encontrado - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Middleware para manejo de errores globales
const globalErrorHandler = (err, req, res, next) => {
    // Si el status code es 200 pero hubo un error, establecerlo como 500
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        error: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export { notFound, globalErrorHandler };
