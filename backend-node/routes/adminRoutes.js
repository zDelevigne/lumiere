const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware global para admin
router.use(authMiddleware.protect, authMiddleware.restrictTo('admin'));

// Usuarios
router.get('/users', adminController.getAllUsers);
router.get('/users/:id/metrics', adminController.getUserMetrics);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Dashboard
router.get('/metrics', adminController.getDashboardMetrics);

module.exports = router;
