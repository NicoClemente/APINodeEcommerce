# API Ecommerce

API RESTful para una plataforma de comercio electrónico construida con Node.js, Express y MongoDB.

## 🚀 Características

- Autenticación JWT con roles (admin/cliente)
- CRUD completo de productos
- Gestión de carrito de compras
- Simulación de pagos
- Validación de datos con Joi
- Manejo de errores centralizado
- Documentación completa de endpoints

## 📋 Requisitos Previos

- Node.js (v18.x o superior)
- MongoDB
- npm o yarn

## ⚙️ Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/NicoClemente/APINodeEcommerce.git
cd api-ecommerce
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env` en la raíz del proyecto:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=tu_url_de_mongodb_atlas
JWT_SECRET=tu_clave_secreta_jwt
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

4. Iniciar el servidor:
```bash
npm run dev  # modo desarrollo
npm start    # modo producción
```

## 🔑 Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Los tokens deben ser incluidos en el header de las peticiones:

```
Authorization: Bearer <token>
```

### Roles
- **Admin**: Acceso completo a todas las funcionalidades
- **Cliente**: Acceso limitado a operaciones básicas

## 📌 Endpoints

### Autenticación

#### Registro de Usuario
```http
POST /api/auth/registro
```
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "nombre": "Usuario Ejemplo"
}
```

#### Login
```http
POST /api/auth/login
```
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

### Productos

#### Obtener todos los productos
```http
GET /api/productos
```

#### Obtener producto por ID
```http
GET /api/productos/:id
```

#### Crear producto (requiere rol admin)
```http
POST /api/productos
```
```json
{
  "titulo": "Producto Ejemplo",
  "precio": 99.99,
  "marca": "Marca Ejemplo",
  "descripcion": "Descripción del producto",
  "categoria": "Electrónicos",
  "imagen": "https://ejemplo.com/imagen.jpg"
}
```

#### Actualizar producto (requiere rol admin)
```http
PUT /api/productos/:id
```

#### Eliminar producto (requiere rol admin)
```http
DELETE /api/productos/:id
```

### Carrito

#### Obtener carrito
```http
GET /api/carrito
```

#### Agregar al carrito
```http
POST /api/carrito
```
```json
{
  "items": [
    {
      "productoId": "id_del_producto",
      "cantidad": 1
    }
  ],
  "direccionEntrega": {
    "calle": "Calle Ejemplo 123",
    "ciudad": "Ciudad Ejemplo",
    "codigoPostal": "12345"
  },
  "total": 99.99
}
```

### Pagos

#### Procesar pago
```http
POST /api/pagos/procesar
```
```json
{
  "total": 99.99,
  "items": [...]
}
```

## 📦 Estructura del Proyecto

```
src/
├── schemas/        # Esquemas de mongoose
├── models/         # Modelos de datos
├── controllers/    # Controladores
├── middleware/     # Middleware personalizado
├── routes/         # Rutas de la API
├── config/         # Configuraciones
└── app.js         # Archivo principal
```

## 🛠️ Tecnologías Utilizadas

- Express.js - Framework web
- MongoDB - Base de datos
- Mongoose - ODM para MongoDB
- JWT - Autenticación
- Bcrypt - Encriptación de contraseñas
- Joi - Validación de datos
- Cors - Middleware para CORS

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt
- Validación de datos en todos los endpoints
- Protección contra ataques comunes (XSS, CSRF)
- Manejo seguro de tokens JWT
- Control de acceso basado en roles

## ⚠️ Manejo de Errores

La API implementa un sistema centralizado de manejo de errores con respuestas consistentes:

```json
{
  "error": "Descripción del error",
  "detalles": ["Detalles adicionales si aplica"]
}
```

## 🔄 Estado de las Respuestas

- `200` - OK
- `201` - Creado
- `400` - Error de cliente
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `500` - Error del servidor

## 📝 Variables de Entorno

| Variable | Descripción | Obligatoria |
|----------|-------------|-------------|
| PORT | Puerto del servidor | No (default: 3000) |
| MONGODB_URI | URI de MongoDB | Sí |
| JWT_SECRET | Clave secreta para JWT | Sí |
| ALLOWED_ORIGINS | Orígenes permitidos para CORS | Sí |

## 👥 Contribución

1. Fork del repositorio
2. Crear rama para nueva funcionalidad
3. Commit cambios
4. Push a la rama
5. Crear Pull Request

