require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mysql = require('mysql2/promise');

const products = [
    {
        name: 'Avocado Toast',
        description: 'Tostada en pan integral con queso crema, palta, semillas y huevo revuelto.',
        price: 4500,
        category: 'Desayunos',
        image_url: 'assets/images/avocado_toast.png'
    },
    {
        name: 'French Toast',
        description: 'Pan brioche con banana, dulce de arándanos, tostada francesa caramelizada, frutos rojos.',
        price: 4800,
        category: 'Desayunos',
        image_url: 'assets/images/french_toast.png'
    },
    {
        name: 'Pancakes de Avena',
        description: 'Pancakes de avena con frutos rojos, banana, mantequilla de maní y miel.',
        price: 4600,
        category: 'Desayunos',
        image_url: 'assets/images/pancakes.png'
    },
    {
        name: 'Latte Art',
        description: 'Café suave con leche texturizada y diseño de arte latte.',
        price: 2800,
        category: 'Café',
        image_url: 'assets/images/latte.png'
    },
    {
        name: 'Cappuccino Caramel',
        description: 'Café con leche montada y un toque dulce de caramelo artesanal.',
        price: 3200,
        category: 'Café',
        image_url: 'assets/images/cappuccino.png'
    },
    {
        name: 'Frappuccino Oreo',
        description: 'Bebida helada con trozos de galleta Oreo, crema y chocolate.',
        price: 3800,
        category: 'Fríos',
        image_url: 'assets/images/frappuccino.png'
    },
    {
        name: 'Nuestras Medialunas',
        description: 'Nuestras famosas medialunas de manteca, horneadas diariamente.',
        price: 850,
        category: 'Repostería',
        image_url: 'assets/images/medialunas.png'
    },
    {
        name: 'Cheesecake de Frutos Rojos',
        description: 'Delicioso cheesecake cremoso con topping de frutos rojos frescos y coulis de bayas.',
        price: 5200,
        category: 'Repostería',
        image_url: 'assets/images/cheesecake.png'
    }
];

const seedProducts = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Limpiar productos existentes
        await connection.query('DELETE FROM products');
        // await connection.query('DELETE FROM categories'); // Cuidado con FKs

        // Asegurar categorías
        const categories = [...new Set(products.map(p => p.category))];
        for (const cat of categories) {
            await connection.query('INSERT IGNORE INTO categories (name) VALUES (?)', [cat]);
        }

        // Insertar productos
        for (const p of products) {
            // Get Category ID
            const [rows] = await connection.query('SELECT id FROM categories WHERE name = ?', [p.category]);
            const categoryId = rows[0].id;

            await connection.query(
                'INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
                [p.name, p.description, p.price, 50, categoryId, p.image_url]
            );
        }

        console.log('Productos de Café Lumière insertados correctamente.');
    } catch (error) {
        console.error('Error al insertar productos:', error);
    } finally {
        await connection.end();
    }
};

seedProducts();
