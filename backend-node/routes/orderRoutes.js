const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas Cliente
router.post('/', authMiddleware.protect, orderController.createOrder);
router.get('/myorders', authMiddleware.protect, orderController.getMyOrders);
router.post('/:id/cancel', authMiddleware.protect, orderController.cancelOrder);

// Rutas Admin
router.get('/', authMiddleware.protect, authMiddleware.restrictTo('admin'), orderController.getAllOrders);
router.put('/:id/status', authMiddleware.protect, authMiddleware.restrictTo('admin'), orderController.updateOrderStatus);

// Ruta común (según permisos)
router.get('/:id', authMiddleware.protect, orderController.getOrderById);

module.exports = router;
