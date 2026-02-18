const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { validationResult } = require('express-validator');

const signToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, apellido, username, email, password, direccion } = req.body;

    try {
        // Verificar si el usuario ya existe
        const [existingUser] = await db.query(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'El usuario o correo ya existe.' });
        }

        // Hash contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Crear usuario
        const [result] = await db.query(
            'INSERT INTO users (nombre, apellido, username, email, password_hash, direccion) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, apellido, username, email, passwordHash, direccion]
        );

        const token = signToken(result.insertId, 'client');

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: { id: result.insertId, nombre, apellido, email, role: 'client' }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor al registrar usuario.' });
    }
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Buscar usuario
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // Registrar login log
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('User-Agent');
        await db.query('INSERT INTO login_logs (user_id, ip, user_agent) VALUES (?, ?, ?)', [user.id, ip, userAgent]);

        const token = signToken(user.id, user.role);

        res.status(200).json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor al iniciar sesión.' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, nombre, apellido, email, username, direccion, role, created_at FROM users WHERE id = ?', [req.user.id]);
        
        if (!users.length) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json({ user: users[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener perfil.' });
    }
};
