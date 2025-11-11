# Gestión de Alquiler de Autos - Cliente (React)

## 📋 Descripción del Proyecto

Aplicación web desarrollada en React para la gestión de alquileres de vehículos. Este es el repositorio del **Cliente (Frontend)**, que se comunica con una API REST desarrollada en Node.js.

## 🏗️ Estructura del Proyecto

El proyecto está organizado siguiendo buenas prácticas de React y arquitectura modular:

```
alquiler-autos/
├── public/                 # Archivos estáticos
├── src/
│   ├── assets/           # Recursos (imágenes, iconos)
│   ├── components/       # Componentes reutilizables
│   │   ├── Footer.jsx
│   │   ├── GlobalLoader.jsx
│   │   ├── Layout.jsx
│   │   └── Navbar.jsx
│   ├── constants/        # Constantes de la aplicación
│   │   └── authType.js
│   ├── contexts/         # Context API para estado global
│   │   ├── AuthContext.jsx
│   │   ├── CarsContext.jsx
│   │   ├── ClientContext.jsx
│   │   ├── RentalsContext.jsx
│   │   ├── ToastContext.jsx
│   │   └── UserContext.jsx
│   ├── core/            # Funcionalidades core
│   │   └── loading-bus.js
│   ├── pages/           # Páginas/Views de la aplicación
│   │   ├── auth/        # Autenticación
│   │   ├── client/      # Gestión de clientes
│   │   ├── home/        # Página principal
│   │   ├── rental/      # Gestión de alquileres
│   │   ├── user/        # Gestión de usuarios
│   │   └── vehicles/    # Gestión de vehículos
│   ├── services/        # Servicios API
│   │   ├── api.js       # Configuración base de API
│   │   ├── auth.js      # Servicio de autenticación
│   │   ├── brands.js    # Servicio de marcas
│   │   ├── cars.js      # Servicio de vehículos
│   │   ├── clients.js   # Servicio de clientes
│   │   ├── interceptors.js  # Interceptores de Axios
│   │   ├── rentals.js   # Servicio de alquileres
│   │   └── user.js      # Servicio de usuarios
│   ├── styles/          # Estilos CSS por página
│   ├── utils/           # Utilidades y helpers
│   │   ├── ExportToPdf.jsx
│   │   ├── PrivateRoute.jsx
│   │   └── RequireRole.jsx
│   ├── App.jsx          # Componente principal
│   ├── App.css          # Estilos globales
│   ├── index.css        # Estilos base
│   └── main.jsx         # Punto de entrada
├── eslint.config.js     # Configuración de ESLint
├── index.html           # HTML principal
├── package.json         # Dependencias y scripts
├── vite.config.js       # Configuración de Vite
└── README.md           # Este archivo
```

## 🚀 Tecnologías Utilizadas

- **React 19.1.0** - Biblioteca principal
- **React Router DOM 7.6.0** - Enrutamiento
- **Vite 7.1.6** - Build tool y dev server
- **PrimeReact 10.9.7** - Biblioteca de componentes UI
- **Axios 1.9.0** - Cliente HTTP
- **Formik 2.4.5** - Manejo de formularios
- **Yup 1.6.1** - Validación de esquemas
- **Context API** - Gestión de estado global
- **ESLint** - Linter para calidad de código

## ✨ Funcionalidades Implementadas

### 🔐 Autenticación
- Login de usuarios
- Gestión de tokens (JWT)
- Protección de rutas privadas
- Roles y permisos (admin, empleado, cliente)

### 👥 Gestión de Usuarios
- Listado de usuarios
- Registro de nuevos usuarios
- Edición de usuarios
- Control de acceso por roles

### 👤 Gestión de Clientes
- Listado de clientes
- Registro de clientes (público y privado)
- Edición de clientes
- Búsqueda y filtrado

### 🚗 Gestión de Vehículos
- Listado de vehículos disponibles
- Detalle de vehículos
- Registro de nuevos vehículos (admin)
- Edición de vehículos (admin)
- Filtrado por disponibilidad
- Visualización de precios y características

### 📅 Gestión de Alquileres
- Creación de alquileres
- Selección de vehículo y cliente
- Registro de cliente nuevo durante el alquiler
- Selección de fechas de inicio y fin
- Actualización automática de disponibilidad del vehículo
- Validación de fechas y disponibilidad

### 🎨 Interfaz de Usuario
- Diseño responsive
- Navegación intuitiva
- Notificaciones toast
- Loading states
- Manejo de errores

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd alquiler-autos
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear un archivo `.env` en la raíz del proyecto:
```env
VITE_API_BASE_URL=http://localhost:3000
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

5. **Compilar para producción**
```bash
npm run build
```

6. **Previsualizar build de producción**
```bash
npm run preview
```

## 🛣️ Rutas de la Aplicación

### Rutas Públicas
- `/` - Página principal
- `/about` - Sobre nosotros
- `/auth/login` - Inicio de sesión
- `/vehicles` - Listado de vehículos
- `/vehicles/:id` - Detalle de vehículo
- `/rental/create` - Crear alquiler (público)
- `/client/register-public` - Registro público de cliente

### Rutas Privadas
- `/user/list` - Listado de usuarios (admin, empleado)
- `/user/register` - Registro de usuario (admin)
- `/user/edit/:id` - Editar usuario (admin)
- `/client/list` - Listado de clientes
- `/client/register` - Registro de cliente (admin, cliente)
- `/client/edit/:id` - Editar cliente (admin)
- `/vehicles/register` - Registro de vehículo (admin)
- `/vehicles/edit/:id` - Editar vehículo (admin)

## 🏛️ Arquitectura y Buenas Prácticas

### Separación de Responsabilidades
- **Components**: Componentes reutilizables y presentacionales
- **Pages**: Vistas completas que orquestan componentes
- **Contexts**: Estado global y lógica de negocio
- **Services**: Comunicación con la API
- **Utils**: Funciones auxiliares y helpers

### Gestión de Estado
- **Context API** para estado global (autenticación, datos compartidos)
- **Estado local** con hooks para componentes específicos
- **Custom hooks** para lógica reutilizable

### Manejo de Errores
- Interceptores de Axios para manejo centralizado
- Try-catch en funciones asíncronas
- Mensajes de error amigables al usuario
- Validación de formularios con Yup

### Código Limpio
- ✅ Sin console.log en producción
- ✅ Nombres descriptivos de variables y funciones
- ✅ Comentarios donde es necesario
- ✅ Código modular y reutilizable
- ✅ ESLint configurado para mantener calidad

## 🔗 Integración con Backend

El proyecto se comunica con una API REST desarrollada en Node.js que utiliza:
- **Sequelize** como ORM
- Base de datos relacional
- Autenticación JWT
- Validación de datos en el servidor

### Endpoints Principales
- `POST /auth/login` - Autenticación
- `GET /auth/me` - Obtener usuario actual
- `GET /cars` - Listar vehículos
- `POST /cars` - Crear vehículo
- `GET /clients` - Listar clientes
- `POST /clients` - Crear cliente
- `POST /rentals` - Crear alquiler
- `PUT /cars/:id` - Actualizar vehículo

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run preview` - Previsualiza el build de producción
- `npm run lint` - Ejecuta ESLint

## 👥 Equipo de Desarrollo

Este proyecto fue desarrollado en grupos de hasta 4 personas como parte del curso de Programación 3.

## 📄 Licencia

Este proyecto es parte de un trabajo académico.

## 🔄 Notas Importantes

- El backend debe estar corriendo en la URL configurada en `VITE_API_BASE_URL`
- Las rutas protegidas requieren autenticación válida
- Los roles definidos son: `admin`, `empleado`, `cliente`
- El proyecto utiliza Vite como build tool para mejor rendimiento

## 🐛 Solución de Problemas

### Error de conexión con la API
- Verificar que el backend esté corriendo
- Verificar la URL en `.env`
- Verificar CORS en el backend

### Problemas de autenticación
- Verificar que el token se esté guardando correctamente
- Verificar expiración del token
- Limpiar localStorage si es necesario

---

**Repositorio del Cliente (Frontend)** - React + Vite# EFI-Prog3-front
