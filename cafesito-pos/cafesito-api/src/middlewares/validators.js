import { check, validationResult } from 'express-validator';

// Middleware para verificar los resultados de la validación
const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
};

const registroValidator = [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('email', 'Debe ser un correo válido').isEmail(),
    check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    validarCampos
];

const loginValidator = [
    check('email', 'Debe ser un correo válido').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    validarCampos
];

export default {
    registroValidator,
    loginValidator,
    validarCampos
};
