const db = require('../config/db');

exports.getAllProducts = async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products WHERE active = 1');
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener productos.' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        
        if (!products.length) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        res.status(200).json(products[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el producto.' });
    }
};

// Admin Only
exports.createProduct = async (req, res) => {
    const { name, description, price, stock, category_id } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const [result] = await db.query(
            'INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, price, stock, category_id, image_url]
        );

        res.status(201).json({
            message: 'Producto creado exitosamente.',
            productId: result.insertId,
            product: { name, description, price, stock, category_id, image_url }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear producto.' });
    }
};

exports.updateProduct = async (req, res) => {
    const { name, description, price, stock, category_id, active } = req.body;
    let image_url = req.body.image_url; // Si no se sube nueva imagen, usar la anterior (o manejar lógica frontend)

    if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
    }

    try {
        await db.query(
            'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, active = ?, image_url = COALESCE(?, image_url) WHERE id = ?',
            [name, description, price, stock, category_id, active, image_url, req.params.id]
        );

        res.status(200).json({ message: 'Producto actualizado exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar producto.' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.status(200).json({ message: 'Producto eliminado exitosamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar producto.' });
    }
};
