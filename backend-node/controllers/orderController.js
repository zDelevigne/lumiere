const db = require('../config/db');

// Crear Orden
exports.createOrder = async (req, res) => {
    const { items, delivery_type, address_used, total } = req.body;
    const user_id = req.user.id;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'El carrito está vacío.' });
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // Crear orden cabecera
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, delivery_type, address_used, total, status) VALUES (?, ?, ?, ?, ?)',
            [user_id, delivery_type, address_used, total, 'en_proceso']
        );

        const orderId = orderResult.insertId;

        // Insertar items y actualizar stock (verificación simple, idealmente lockear rows)
        for (const item of items) {
            const [product] = await connection.query('SELECT price, stock FROM products WHERE id = ?', [item.product_id]);
            
            if (product[0].stock < item.qty) {
                throw new Error(`Stock insuficiente para el producto ID ${item.product_id}`);
            }

            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.qty, product[0].price, item.qty * product[0].price]
            );

            // Restar stock
            await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.qty, item.product_id]);
        }

        await connection.commit();

        res.status(201).json({ message: 'Orden creada exitosamente.', orderId });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: error.message || 'Error al procesar la orden.' });
    } finally {
        connection.release();
    }
};

// Obtener Historial de Usuario
exports.getMyOrders = async (req, res) => {
    try {
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener historial.' });
    }
};

// Obtener Detalle de Orden
exports.getOrderById = async (req, res) => {
    try {
        const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        if (!orders.length) return res.status(404).json({ message: 'Orden no encontrada' });

        // Verificar si es dueño o admin
        if (req.user.role !== 'admin' && orders[0].user_id !== req.user.id) {
            return res.status(403).json({ message: 'No autorizado.' });
        }

        const [items] = await db.query(
            `SELECT oi.*, p.name, p.image_url 
             FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = ?`,
            [req.params.id]
        );

        res.status(200).json({ order: orders[0], items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener detalle de orden.' });
    }
};

// Cancelar Orden (Cliente)
exports.cancelOrder = async (req, res) => {
    try {
        const [order] = await db.query('SELECT status, user_id FROM orders WHERE id = ?', [req.params.id]);
        
        if (!order.length) return res.status(404).json({ message: 'Orden no encontrada' });
        if (order[0].user_id !== req.user.id) return res.status(403).json({ message: 'No autorizado.' });

        if (order[0].status === 'en_camino' || order[0].status === 'entregado' || order[0].status === 'cancelado') {
            return res.status(400).json({ message: 'No se puede cancelar la orden en su estado actual.' });
        }

        // Devolver stock (opcional, dependiendo de regla de negocio, asumo sí)
        const connection = await db.getConnection();
        await connection.beginTransaction();
        
        try {
            await connection.query('UPDATE orders SET status = "cancelado" WHERE id = ?', [req.params.id]);
            
            const [items] = await connection.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [req.params.id]);
            for (const item of items) {
                await connection.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
            }
            
            await connection.commit();
            res.status(200).json({ message: 'Orden cancelada exitosamente.' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al cancelar orden.' });
    }
};

// Admin: Actualizar Estado
exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    // Validar transiciones permitidas si es necesario
    try {
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.status(200).json({ message: 'Estado actualizado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar estado.' });
    }
};

// Admin: Listar todas las ordenes
exports.getAllOrders = async (req, res) => {
    try {
        const [orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al listar ordenes.' });
    }
};
