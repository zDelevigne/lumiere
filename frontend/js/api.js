const API_BASE_URL = '/api'; // Simplificado para Vercel y local si se sirve desde el mismo host

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
            const res = await fetch(`${API_BASE_URL}/products`);
            return res.json();
        },
        getOne: async (id) => {
            const res = await fetch(`${API_BASE_URL}/products/${id}`);
            return res.json();
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
