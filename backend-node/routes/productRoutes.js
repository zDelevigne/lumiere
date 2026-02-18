const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public Routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin Routes
router.post('/', 
    authMiddleware.protect, 
    authMiddleware.restrictTo('admin'), 
    upload.single('image'), 
    productController.createProduct
);

router.put('/:id', 
    authMiddleware.protect, 
    authMiddleware.restrictTo('admin'), 
    upload.single('image'), 
    productController.updateProduct
);

router.delete('/:id', 
    authMiddleware.protect, 
    authMiddleware.restrictTo('admin'), 
    productController.deleteProduct
);

module.exports = router;
