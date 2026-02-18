const db = require('../config/db');
const bcrypt = require('bcrypt');

// CRUD Usuarios
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, nombre, apellido, email, username, role, created_at FROM users');
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuarios.' });
    }
};

exports.getUserMetrics = async (req, res) => {
    const userId = req.params.id;
    try {
        const [orders] = await db.query('SELECT status, total, created_at FROM orders WHERE user_id = ?', [userId]);
        
        const totalCompras = orders.length;
        const totalGastado = orders.reduce((acc, order) => acc + (parseFloat(order.total) || 0), 0);
        const cancelaciones = orders.filter(o => o.status === 'cancelado').length;
        
        // Productos más comprados
        const [topProducts] = await db.query(
            `SELECT p.name, SUM(oi.quantity) as qty 
             FROM order_items oi 
             JOIN orders o ON o.id = oi.order_id 
             JOIN products p ON p.id = oi.product_id 
             WHERE o.user_id = ? 
             GROUP BY p.id 
             ORDER BY qty DESC LIMIT 5`,
            [userId]
        );

        res.status(200).json({
            totalCompras,
            totalGastado,
            cancelaciones,
            topProducts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener métricas de usuario.' });
    }
};

exports.updateUser = async (req, res) => {
    const { nombre, apellido, role } = req.body;
    try {
        await db.query('UPDATE users SET nombre = ?, apellido = ?, role = ? WHERE id = ?', [nombre, apellido, role, req.params.id]);
        res.status(200).json({ message: 'Usuario actualizado.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar usuario.' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.status(200).json({ message: 'Usuario eliminado.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario.' });
    }
};

// Dashboard Metrics
exports.getDashboardMetrics = async (req, res) => {
    try {
        // Ventas del mes actual
        const [monthlySales] = await db.query(
            `SELECT SUM(total) as revenue, COUNT(*) as count 
             FROM orders 
             WHERE status != 'cancelado' 
             AND MONTH(created_at) = MONTH(CURRENT_DATE()) 
             AND YEAR(created_at) = YEAR(CURRENT_DATE())`
        );

        // Top Productos
        const [topProducts] = await db.query(
            `SELECT p.name, SUM(oi.quantity) as sold 
             FROM order_items oi 
             JOIN orders o ON o.id = oi.order_id
             JOIN products p ON p.id = oi.product_id
             WHERE o.status != 'cancelado'
             GROUP BY p.id 
             ORDER BY sold DESC LIMIT 5`
        );

        res.status(200).json({
            monthlyRevenue: monthlySales[0].revenue || 0,
            monthlyOrders: monthlySales[0].count || 0,
            topProducts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en métricas del dashboard.' });
    }
};
