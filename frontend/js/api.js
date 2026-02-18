const API_BASE_URL = '/api'; 

const STATIC_PRODUCTS = [
    {
        id: 1,
        name: 'Avocado Toast',
        description: 'Tostada en pan integral con queso crema, palta, semillas y huevo revuelto.',
        price: 4500,
        category_name: 'Desayunos',
        image_url: 'assets/images/avocado_toast.png'
    },
    {
        id: 2,
        name: 'French Toast',
        description: 'Pan brioche con banana, dulce de arándanos, tostada francesa caramelizada, frutos rojos.',
        price: 4800,
        category_name: 'Desayunos',
        image_url: 'assets/images/french_toast.png'
    },
    {
        id: 3,
        name: 'Pancakes de Avena',
        description: 'Pancakes de avena con frutos rojos, banana, mantequilla de maní y miel.',
        price: 4600,
        category_name: 'Desayunos',
        image_url: 'assets/images/pancakes.png'
    },
    {
        id: 4,
        name: 'Latte Art',
        description: 'Café suave con leche texturizada y diseño de arte latte.',
        price: 2800,
        category_name: 'Café',
        image_url: 'assets/images/latte.png'
    },
    {
        id: 5,
        name: 'Cappuccino Caramel',
        description: 'Café con leche montada y un toque dulce de caramelo artesanal.',
        price: 3200,
        category_name: 'Café',
        image_url: 'assets/images/cappuccino.png'
    },
    {
        id: 6,
        name: 'Frappuccino Oreo',
        description: 'Bebida helada con trozos de galleta Oreo, crema y chocolate.',
        price: 3800,
        category_name: 'Fríos',
        image_url: 'assets/images/frappuccino.png'
    },
    {
        id: 7,
        name: 'Nuestras Medialunas',
        description: 'Nuestras famosas medialunas de manteca, horneadas diariamente.',
        price: 850,
        category_name: 'Repostería',
        image_url: 'assets/images/medialunas.png'
    },
    {
        id: 8,
        name: 'Cheesecake de Frutos Rojos',
        description: 'Delicioso cheesecake cremoso con topping de frutos rojos frescos y coulis de bayas.',
        price: 5200,
        category_name: 'Repostería',
        image_url: 'assets/images/cheesecake.png'
    }
];

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const api = {
    auth: {
        login: async (email, password) => {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            return res.json();
        },
        register: async (userData) => {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return res.json();
        },
        me: async () => {
            const res = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: getAuthHeaders()
            });
            return res.json();
        }
    },
    products: {
        getAll: async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/products`);
                if (!res.ok) throw new Error('DB not available');
                return res.json();
            } catch (error) {
                console.warn('Cargando productos desde JSON estático (Fallback)');
                return STATIC_PRODUCTS;
            }
        },
        getOne: async (id) => {
            try {
                const res = await fetch(`${API_BASE_URL}/products/${id}`);
                if (!res.ok) throw new Error('DB not available');
                return res.json();
            } catch (error) {
                return STATIC_PRODUCTS.find(p => p.id === parseInt(id));
            }
        }
    },
    orders: {
        create: async (orderData) => {
            const res = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(orderData)
            });
            return res.json();
        },
        getMyOrders: async () => {
            const res = await fetch(`${API_BASE_URL}/orders/myorders`, {
                headers: getAuthHeaders()
            });
            return res.json();
        }
    }
};
