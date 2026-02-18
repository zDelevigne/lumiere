# E-Commerce Premium - Documentación

Este proyecto es una plataforma de e-commerce completa con arquitectura dual (Node.js y PHP) y una base de datos MySQL compartida.

## Estructura del Proyecto

- `database/`: Scripts SQL para la creación de la base de datos.
- `backend-node/`: Servidor API RESTful con Express (Entorno Local).
- `backend-php/`: API RESTful con PHP (Entorno Hostinger).
- `frontend/`: Single Page Application (SPA) con HTML/CSS/JS (Vanilla).

## Requisitos Previos

- **Node.js**: v14 o superior.
- **MySQL**: Servidor de base de datos local o remoto.
- **PHP**: v7.4 o superior (con extensión PDO) para la versión Hostinger.

## Instalación

### 1. Base de Datos

1. Crear una base de datos MySQL llamada `ecommerce_db`.
2. Importar el archivo `database/schema.sql` en tu gestor de base de datos (phpMyAdmin, Workbench, DBeaver).

### 2. Backend Node.js (Local)

1. Navegar a `backend-node`:
   ```bash
   cd backend-node
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Copiar `.env` y configurar credenciales de BD:
   ```env
   DB_USER=root
   DB_PASSWORD=tu_password
   ```
4. Iniciar el servidor:
   ```bash
   npm run dev
   ```
   El servidor correrá en `http://localhost:3000`.

### 3. Backend PHP (Hostinger)

1. Subir el contenido de `backend-php` a la carpeta `public_html` o un subdirectorio en tu hosting.
2. Editar `backend-php/config.php` con las credenciales de la base de datos de Hostinger.
3. Asegurarse de que el servidor soporte `.htaccess` (Apache) o configurar Nginx para redirigir tráfico a `index.php` si se usa enrutamiento amigable (actualmente el frontend usa estructura simple).

### 4. Frontend

1. Abrir `frontend/js/api.js`.
2. Configurar `API_BASE_URL`:
   - Para Node.js Local: `http://localhost:3000/api`
   - Para PHP Hostinger: `https://tu-dominio.com/api`
3. Servir la carpeta `frontend` con un servidor estático (Live Server, http-server, etc.).

## Características Principales

- **Roles**: Admin y Cliente.
- **Seguridad**: JWT, bcrypt, protección contra inyección SQL, XSS.
- **Diseño**: Mobile-first, estética premium con Glassmorphism.
- **Funcionalidad**: Carrito, checkout, historial de pedidos, panel de administración.

## Seguridad

- Validar siempre los inputs en ambos backends.
- Cambiar `JWT_SECRET` y claves en producción.
- Usar HTTPS en producción.
