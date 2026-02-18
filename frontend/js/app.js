import { api } from './api.js';

// Estado Global Simple
const state = {
    user: null,
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    products: [] // Cache global de productos
};

// Exponer addToCart globalmente de forma robusta
window.addToCart = (id) => {
    const product = state.products.find(p => p.id === id);
    if (product) {
        addToCart(product);
    } else {
        console.error('Producto no encontrado en el cache:', id);
    }
};

// Utilidades UI
const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

const updateAuthLinks = () => {
    const authLinksIdx = document.getElementById('auth-links');
    if (state.user) {
        authLinksIdx.innerHTML = `
            <a href="#/profile" class="nav-link">Hola, ${state.user.nombre}</a>
            <a href="#" id="logout-btn" class="nav-link">Salir</a>
        `;
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    } else {
        authLinksIdx.innerHTML = `
            <a href="#/login" class="nav-link">Login</a>
            <a href="#/register" class="nav-link">Registro</a>
        `;
    }
    document.getElementById('cart-count').textContent = state.cart.reduce((acc, item) => acc + item.qty, 0);
};

const logout = () => {
    localStorage.removeItem('token');
    state.user = null;
    updateAuthLinks();
    window.location.hash = '#/';
    showToast('Sesión cerrada.', 'info');
};

const addToCart = (product) => {
    const existing = state.cart.find(item => item.product_id === product.id);
    if (existing) {
        existing.qty++;
    } else {
        state.cart.push({ product_id: product.id, qty: 1, ...product });
    }
    localStorage.setItem('cart', JSON.stringify(state.cart));
    updateAuthLinks();
    showToast('Producto agregado al carrito.', 'success');
};

// Vistas
const renderHome = async () => {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <section class="hero-section">
            <div class="hero-content">
                <span class="hero-subtitle">Experiencia Premium</span>
                <h1>El Arte del Café Tostado</h1>
                <p>Descubre sabores únicos en un ambiente diseñado para los amantes del buen café.</p>
                <div class="hero-btns">
                    <a href="#/products" class="btn-primary">Ver Catálogo</a>
                    <a href="#/about" class="btn-secondary">Conócenos</a>
                </div>
            </div>
        </section>
        <section class="container" style="margin-top: var(--space-xl);">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: var(--space-lg);">
                <div>
                    <span style="color: var(--primary); font-weight: 600; text-transform: uppercase; letter-spacing: 2px; font-size: 0.8rem;">Selección</span>
                    <h2 style="font-size: 2.5rem; margin-top: 5px;">Nuestras Especialidades</h2>
                </div>
                <a href="#/products" class="nav-link view-all-link" style="color: var(--primary); font-weight: 600;">Ver Todo <span class="material-icons-round">arrow_forward</span></a>
            </div>
            <div id="featured-products" class="product-grid">Cargando...</div>
        </section>
    `;

    try {
        const products = await api.products.getAll();
        const grid = document.getElementById('featured-products');
        const productCards = products.slice(0, 4).map(p => `
            <div class="card">
                <div class="card-img-wrapper">
                    <img src="${p.image_url}" alt="${p.name}" class="card-img" onerror="this.src='assets/images/logo.png'">
                </div>
                <div class="card-body">
                    <span class="card-category">${p.category_name || 'Cafetería'}</span>
                    <h3 class="card-title">${p.name}</h3>
                    <p class="card-price">$${Number(p.price).toLocaleString()}</p>
                    <button onclick="addToCart(${p.id})" class="btn-primary">
                        Añadir al Carrito
                    </button>
                </div>
            </div>
        `).join('');
        state.products = products; // Actualizar cache global
        grid.innerHTML = productCards;
    } catch (error) {
        console.error(error);
    }
};

const renderLogin = () => {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="container" style="max-width: 400px; margin-top: 50px;">
            <h2>Iniciar Sesión</h2>
            <form id="login-form">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="email" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Contraseña</label>
                    <input type="password" id="password" class="form-control" required>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%">Entrar</button>
            </form>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const data = await api.auth.login(email, password);
            if (data.token) {
                localStorage.setItem('token', data.token);
                state.user = data.user;
                updateAuthLinks();
                window.location.hash = '#/';
                showToast('Bienvenido!', 'success');
            } else {
                showToast(data.message || 'Error al iniciar sesión', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        }
    });
};

const renderRegister = () => {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="container" style="max-width: 400px; margin-top: 50px;">
            <h2>Registro</h2>
            <form id="register-form">
                <div class="form-group">
                    <label>Nombre</label>
                    <input type="text" id="nombre" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Apellido</label>
                    <input type="text" id="apellido" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="username" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="email" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Contraseña</label>
                    <input type="password" id="password" class="form-control" required minlength="6">
                </div>
                <div class="form-group">
                    <label>Dirección</label>
                    <textarea id="direccion" class="form-control" required></textarea>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%">Registrarse</button>
            </form>
        </div>
    `;

    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const userData = {
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            direccion: document.getElementById('direccion').value
        };

        try {
            const data = await api.auth.register(userData);
            if (data.token) {
                localStorage.setItem('token', data.token);
                state.user = data.user;
                updateAuthLinks();
                window.location.hash = '#/';
                showToast('Registro exitoso!', 'success');
            } else {
                showToast(data.message || 'Error en registro', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        }
    });
};

const renderProducts = async () => {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <section class="container" style="margin-top: 30px;">
            <h2>Catálogo</h2>
            <div id="product-list" class="product-grid">Cargando...</div>
        </section>
    `;

    try {
        const products = await api.products.getAll();
        state.products = products; // Actualizar cache global
        const grid = document.getElementById('product-list');
        
        if (products.length === 0) {
            grid.innerHTML = '<p>No hay productos disponibles.</p>';
            return;
        }

        grid.innerHTML = products.map(p => `
            <div class="card">
                <div class="card-img-wrapper">
                    <img src="${p.image_url}" alt="${p.name}" class="card-img" onerror="this.src='assets/images/logo.png'">
                </div>
                <div class="card-body">
                    <span class="card-category">${p.category_name || 'Cafetería'}</span>
                    <h3 class="card-title">${p.name}</h3>
                    <p class="card-price">$${Number(p.price).toLocaleString()}</p>
                    <button class="btn-primary" onclick="window.addToCart(${p.id})">Añadir al Carrito</button>
                </div>
            </div>
        `).join('');

        // Re-bind addToCart logic implicitly via window
    } catch (error) {
        console.error(error);
        main.innerHTML = '<p class="error">Error al cargar productos.</p>';
    }
};

const renderCart = () => {
    const main = document.getElementById('main-content');
    const total = state.cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    
    main.innerHTML = `
        <section class="container" style="margin-top: 40px;">
            <h2 class="cart-header">Tu Carrito</h2>
            ${state.cart.length === 0 ? `
                <div style="text-align: center; padding: 60px 0;">
                    <span class="material-icons-round" style="font-size: 64px; color: var(--text-muted); opacity: 0.3;">shopping_bag</span>
                    <p style="margin-top: 20px; color: var(--text-muted);">El carrito está vacío.</p>
                    <a href="#/products" class="btn-primary" style="margin-top: 20px;">Ir a la Tienda</a>
                </div>
            ` : `
                <div class="cart-container">
                    <div class="cart-items">
                        ${state.cart.map(item => `
                            <div class="cart-item">
                                <img src="${item.image_url}" alt="${item.name}" class="cart-item-img" onerror="this.src='assets/images/logo.png'">
                                <div class="cart-item-info">
                                    <h4>${item.name}</h4>
                                    <p>$${Number(item.price).toLocaleString()} x ${item.qty}</p>
                                </div>
                                <p class="cart-item-price">$${(item.price * item.qty).toLocaleString()}</p>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="cart-summary">
                        <span class="cart-total-label">Subtotal</span>
                        <strong class="cart-total-value">$${total.toLocaleString()}</strong>
                        
                        <div class="cart-actions">
                            <button id="clear-cart" style="background: transparent; border: 1px solid #ff4444; color: #ff4444; padding: 12px 24px; border-radius: 100px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                                Vaciar Carrito
                            </button>
                            <a href="#/checkout" class="btn-primary">
                                Finalizar Pedido
                            </a>
                        </div>
                    </div>
                </div>
            `}
        </section>
    `;

    if (state.cart.length > 0) {
        document.getElementById('clear-cart').addEventListener('click', () => {
            if(confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
                state.cart = [];
                localStorage.setItem('cart', JSON.stringify([]));
                updateAuthLinks();
                renderCart();
            }
        });
    }
};

const renderCheckout = () => {
    if (!state.user) {
        showToast('Debes iniciar sesión para comprar.', 'warning');
        window.location.hash = '#/login';
        return;
    }
    if (state.cart.length === 0) {
        window.location.hash = '#/cart';
        return;
    }

    const total = state.cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const main = document.getElementById('main-content');
    
    main.innerHTML = `
        <div class="container" style="max-width: 600px; margin-top: 30px;">
            <h2>Finalizar Compra</h2>
            <div style="background: var(--surface); padding: 20px; border-radius: var(--radius); margin-bottom: 20px;">
                <h3>Resumen</h3>
                <p>Total a pagar: <strong>$${total.toFixed(2)}</strong></p>
                <p>Items: ${state.cart.length}</p>
            </div>
            
            <form id="checkout-form">
                <div class="form-group">
                    <label>Tipo de Entrega</label>
                    <select id="delivery_type" class="form-control">
                        <option value="domicilio">Envío a Domicilio</option>
                        <option value="retiro">Retiro en Local</option>
                    </select>
                </div>
                
                <div class="form-group" id="address-group">
                    <label>Dirección de Envío</label>
                    <input type="text" id="address_used" class="form-control" value="${state.user.direccion || ''}" required>
                </div>

                <div class="form-group">
                     <label>Método de Pago</label>
                     <input type="text" class="form-control" value="Efectivo (Único disponible)" disabled>
                </div>

                <button type="submit" class="btn-primary" style="width: 100%">Confirmar Pedido</button>
            </form>
        </div>
    `;

    document.getElementById('delivery_type').addEventListener('change', (e) => {
        const addrGroup = document.getElementById('address-group');
        const addrInput = document.getElementById('address_used');
        if (e.target.value === 'retiro') {
            addrGroup.style.display = 'none';
            addrInput.required = false;
        } else {
            addrGroup.style.display = 'block';
            addrInput.required = true;
        }
    });

    document.getElementById('checkout-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const delivery_type = document.getElementById('delivery_type').value;
        const address_used = delivery_type === 'domicilio' ? document.getElementById('address_used').value : 'Retiro en Local';

        const orderData = {
            items: state.cart,
            delivery_type,
            address_used,
            total
        };

        try {
            const res = await api.orders.create(orderData);
            if (res.orderId) {
                showToast('Pedido creado exitosamente!', 'success');
                state.cart = [];
                localStorage.removeItem('cart');
                updateAuthLinks();
                window.location.hash = '#/profile'; // O historial
            } else {
                showToast(res.message || 'Error al crear pedido', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        }
    });
};

const router = async () => {
    const hash = window.location.hash || '#/';
    
    if (hash === '#/') renderHome();
    else if (hash === '#/login') renderLogin();
    else if (hash === '#/register') renderRegister();
    else if (hash === '#/products') renderProducts();
    else if (hash === '#/cart') renderCart();
    else if (hash === '#/checkout') renderCheckout();
    else if (hash === '#/profile') {
        document.getElementById('main-content').innerHTML = '<h2>Perfil (En construcción - ver historial en API)</h2>';
    }
};

// Init
window.addEventListener('hashchange', router);
window.addEventListener('load', async () => {
    // Check Auth
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const data = await api.auth.me();
            if (data.user) state.user = data.user;
        } catch (e) {
            localStorage.removeItem('token');
        }
    }
    updateAuthLinks();
    router();

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.getElementById('nav-overlay');

    const toggleMenu = () => {
        const isOpen = navLinks.classList.toggle('show');
        navOverlay.classList.toggle('show');
        menuToggle.querySelector('.material-icons-round').textContent = isOpen ? 'close' : 'menu';
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    if (menuToggle && navLinks && navOverlay) {
        menuToggle.addEventListener('click', toggleMenu);
        navOverlay.addEventListener('click', toggleMenu);

        navLinks.addEventListener('click', (e) => {
            if (e.target.closest('.nav-link')) {
                toggleMenu();
            }
        });
    }
});
