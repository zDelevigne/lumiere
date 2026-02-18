-- Creación de la base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce_db;

-- Deshabilitar chequeo de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- Tabla: users
-- Roles: admin, client
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    direccion TEXT, -- Dirección por defecto
    role ENUM('admin', 'client') DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Tabla: login_logs
-- Registro de inicios de sesión para seguridad y auditoría
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS login_logs;
CREATE TABLE login_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ip VARCHAR(45) NOT NULL, -- Soporta IPv6
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Tabla: categories (Opcional pero recomendada para productos)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Tabla: products
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category_id INT,
    active BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500), -- URL de la imagen principal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_active (active)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Tabla: orders
-- Estados: en_proceso, listo_retiro, en_camino, entregado, cancelado
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    delivery_type ENUM('domicilio', 'retiro') NOT NULL,
    address_used TEXT, -- La dirección usada en este pedido específico
    status ENUM('en_proceso', 'listo_retiro', 'en_camino', 'entregado', 'cancelado') DEFAULT 'en_proceso',
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_status (status),
    INDEX idx_user_orders (user_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Tabla: order_items
-- Detalle de cada pedido
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL, -- Precio al momento de la compra
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Tabla: password_resets
-- Tokens para recuperación de contraseña
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS password_resets;
CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL, -- Hash del token, no el token en plano
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token_hash)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Tabla: admin_audit
-- Auditoría de acciones de administradores
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS admin_audit;
CREATE TABLE admin_audit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(50) NOT NULL, -- e.g., 'update_product', 'delete_user'
    entity VARCHAR(50) NOT NULL, -- e.g., 'product', 'user'
    entity_id INT,
    details TEXT, -- JSON o texto con detalles del cambio
    ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Habilitar chequeo de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- Datos de Semilla (Ejemplos iniciales)
-- Contraseña 'admin123' hasheada con bcrypt (cost 10): $2b$10$X8f1Hq.8h.y8h.y8h.y8h.y8h.y8h.y8h.y8e
-- Nota: Generar hash real en la aplicación. Este es solo un placeholder.
-- -----------------------------------------------------------------------------
-- INSERT INTO users (email, nombre, apellido, username, password_hash, role) VALUES 
-- ('admin@ecommerce.com', 'Admin', 'Sistema', 'admin', '$2b$10$ExampleHashForAdmin123', 'admin');
