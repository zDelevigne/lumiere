const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const seedAdmin = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const email = 'admin@ecommerce.com';
        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if exists
        const [existing] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            console.log('El usuario admin ya existe.');
            process.exit(0);
        }

        await connection.query(
            'INSERT INTO users (nombre, apellido, username, email, password_hash, role, direccion) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['Admin', 'Sistema', 'admin', email, hashedPassword, 'admin', 'Oficina Central']
        );

        console.log(`Usuario Admin creado exitosamente.\nEmail: ${email}\nPassword: ${password}`);
    } catch (error) {
        console.error('Error al crear admin:', error);
    } finally {
        await connection.end();
    }
};

seedAdmin();
