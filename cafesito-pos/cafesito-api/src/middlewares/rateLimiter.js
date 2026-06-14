import rateLimit from 'express-rate-limit';

// Limitador genérico
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 peticiones por IP por ventana
    message: { error: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo después de 15 minutos.' }
});

// Limitador estricto para login/registro
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10, // Límite de 10 intentos por IP por hora
    message: { error: 'Demasiados intentos fallidos. Por favor intente de nuevo en una hora.' }
});

export { apiLimiter, authLimiter };
