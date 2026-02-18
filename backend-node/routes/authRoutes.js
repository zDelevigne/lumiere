const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    check('username', 'El nombre de usuario es obligatorio').not().isEmpty(),
    check('email', 'Incluye un email válido').isEmail(),
    check('password', 'La contraseña debe tener 6 o más caracteres').isLength({ min: 6 }),
    check('direccion', 'La dirección es obligatoria').not().isEmpty()
], authController.register);

router.post('/login', [
    check('email', 'Incluye un email válido').isEmail(),
    check('password', 'La contraseña es obligatoria').exists()
], authController.login);

router.get('/me', authMiddleware.protect, authController.getMe);

module.exports = router;
