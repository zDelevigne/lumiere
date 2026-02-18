const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const setupDb = async () => {
    // Conectar sin seleccionar DB para poder crearla
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    try {
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Ejecutando schema.sql...');
        await connection.query(schemaSql);
        console.log('Base de datos y tablas creadas exitosamente.');
        
    } catch (error) {
        console.error('Error al configurar la base de datos:', error);
    } finally {
        await connection.end();
    }
};

setupDb();
