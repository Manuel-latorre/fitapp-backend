# 🏋️ FitApp Backend API

## 📖 Descripción

API completa para la aplicación de seguimiento de ejercicios y planes de entrenamiento **FitApp**. Implementa un sistema robusto de gestión de usuarios, planes de entrenamiento, seguimiento de ejercicios y estadísticas, con un sistema de invitaciones por magic link.

## ✨ Características Principales

### 🔐 Autenticación JWT
- Sistema de autenticación basado en tokens JWT
- Roles de usuario: `admin`, `trainer`, `user`
- Middleware de autorización para endpoints protegidos
- Login simple con email únicamente

### 🎫 Sistema de Invitaciones por Magic Link
- Administradores pueden invitar nuevos usuarios por email
- Magic links únicos con expiración de 7 días
- Proceso de registro guiado desde la invitación
- Verificación y cancelación de invitaciones

### 👥 Gestión de Usuarios
- CRUD completo de usuarios
- Perfiles con foto, teléfono y roles
- Estadísticas personalizadas por usuario
- Control de acceso basado en roles

### 📋 Planes de Entrenamiento
- Creación y gestión de planes personalizados
- Sesiones numeradas (1-5) por plan
- Bloques de ejercicios organizados
- Ejercicios con series, repeticiones y observaciones

### 📊 Seguimiento de Ejercicios
- Registro de peso (kg), PSE y RIR
- Estado de completado por ejercicio
- Historial completo de seguimiento
- Estadísticas de progreso

### 📈 Sistema de Estadísticas
- Porcentaje de progreso general
- Planes completados vs totales
- Ejercicios realizados vs asignados
- Sesiones completadas

### 📚 Documentación Swagger Completa
- Documentación interactiva en `/api-docs`
- Ejemplos detallados para todos los endpoints
- Esquemas completos con valores de ejemplo
- Casos de uso para diferentes tipos de usuario

## 🚀 Tecnologías Utilizadas

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **Zod** - Validación de datos
- **Swagger** - Documentación API
- **Nodemon** - Desarrollo

## 📊 Estructura de Base de Datos

### Tablas Principales

1. **users** - Usuarios del sistema
2. **plans** - Planes de entrenamiento
3. **plan_sessions** - Sesiones por plan (1-5)
4. **session_blocks** - Bloques de ejercicios
5. **block_exercises** - Ejercicios específicos
6. **exercise_tracking** - Seguimiento de ejercicios
7. **user_invitations** - Sistema de invitaciones

## 🛠️ Instalación y Configuración

### 1. Clonar e instalar dependencias

```bash
git clone <repositorio>
cd fitapp-backend
npm install
```

### 2. Configurar variables de entorno

Crear archivo `.env`:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/fitapp_db"

# JWT
JWT_SECRET="tu_jwt_secret_super_seguro"
JWT_EXPIRES_IN="24h"

# Email (para futuras implementaciones)
RESEND_API_KEY="tu_resend_api_key"
FROM_EMAIL="noreply@fitapp.com"

# Servidor
PORT=3000
NODE_ENV="development"
```

### 3. Configurar base de datos PostgreSQL

```sql
-- Ejecutar en pgAdmin o terminal PostgreSQL
CREATE DATABASE fitapp_db;
```

### 4. Ejecutar migraciones

```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar script SQL
# Copiar contenido de database-setup.sql y ejecutar en pgAdmin

# Para agregar tabla de invitaciones (si no existe)
# Copiar contenido de add-invitations-table.sql y ejecutar en pgAdmin
```

### 5. Crear usuario administrador

```bash
npm run dev

# Hacer POST a http://localhost:3000/api/admin/setup
curl -X POST http://localhost:3000/api/admin/setup
```

## 🏃‍♂️ Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

## 📚 Documentación de la API

### 🌐 Acceso a Swagger
- **URL**: `http://localhost:3000/api-docs`
- **Descripción**: Documentación interactiva completa
- **Características**: Ejemplos, esquemas, casos de uso

### 🔗 Enlaces Principales
- **Health Check**: `http://localhost:3000/health`
- **API Base**: `http://localhost:3000/api`
- **Documentación**: `http://localhost:3000/api-docs`

## 🛣️ Endpoints Principales

### 🔐 Autenticación
```
POST /api/auth/login          # Login con email
GET  /api/auth/me            # Usuario actual
POST /api/auth/verify        # Verificar token
POST /api/auth/generate-token # Generar token (admin)
```

### 🎫 Invitaciones
```
POST /api/invitations/invite           # Invitar usuario (admin)
GET  /api/invitations/verify/:token    # Verificar invitación
POST /api/invitations/complete         # Completar registro
GET  /api/invitations/pending          # Listar pendientes (admin)
```

### 👥 Usuarios
```
GET    /api/users          # Listar usuarios
POST   /api/users          # Crear usuario
GET    /api/users/:id      # Obtener usuario
PUT    /api/users/:id      # Actualizar usuario
DELETE /api/users/:id      # Eliminar usuario
GET    /api/users/:id/plans # Planes del usuario
```

### 📋 Planes
```
GET    /api/plans          # Listar planes
POST   /api/plans          # Crear plan
GET    /api/plans/:id      # Obtener plan completo
PUT    /api/plans/:id      # Actualizar plan
DELETE /api/plans/:id      # Eliminar plan
```

### 📊 Seguimiento
```
GET  /api/tracking                    # Listar seguimientos
POST /api/tracking                    # Crear seguimiento
GET  /api/tracking/user/:userId       # Por usuario
GET  /api/tracking/exercise/:exerciseId # Por ejercicio
PUT  /api/tracking/:id               # Actualizar
PUT  /api/tracking/:id/done          # Marcar completado
```

### 📈 Estadísticas
```
GET /api/users/:userId/stats         # Estadísticas de usuario
```

## 🔧 Ejemplos de Uso

### Flujo de Invitación Completo

1. **Admin invita usuario**:
```bash
curl -X POST http://localhost:3000/api/invitations/invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"email": "nuevo@usuario.com"}'
```

2. **Usuario verifica invitación**:
```bash
curl http://localhost:3000/api/invitations/verify/inv_token_123
```

3. **Usuario completa registro**:
```bash
curl -X POST http://localhost:3000/api/invitations/complete \
  -H "Content-Type: application/json" \
  -d '{
    "token": "inv_token_123",
    "name": "Juan Pérez",
    "phone": "+34 600 123 456"
  }'
```

### Crear Plan de Entrenamiento

```bash
curl -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "userId": "user-uuid",
    "title": "Plan de Fuerza - Semana 1",
    "description": "Plan enfocado en desarrollo de fuerza"
  }'
```

### Registrar Seguimiento

```bash
curl -X POST http://localhost:3000/api/tracking \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "exerciseId": "exercise-uuid",
    "userId": "user-uuid",
    "kg": "80",
    "pse": "8",
    "rir": "2"
  }'
```

## 🏗️ Arquitectura

```
src/
├── config/
│   ├── database.ts      # Configuración Prisma
│   └── swagger.ts       # Configuración Swagger
├── controllers/
│   ├── authController.ts
│   ├── invitationController.ts
│   ├── userController.ts
│   ├── planController.ts
│   └── trackingController.ts
├── middlewares/
│   ├── auth.ts          # Autenticación JWT
│   └── errorHandler.ts  # Manejo de errores
├── routes/
│   └── index.ts         # Rutas principales
├── services/
│   ├── email.ts         # Servicio de email
│   └── supabase.ts      # Configuración Supabase
└── index.ts             # Servidor principal
```

## 🔒 Seguridad

- **JWT Tokens**: Autenticación segura
- **Middleware de autorización**: Control de acceso por roles
- **Validación de datos**: Zod schemas
- **Tokens de invitación**: Expiración automática
- **Rate limiting**: Preparado para implementar
- **CORS**: Configurado para desarrollo

## 📋 Estado del Proyecto

### ✅ Completado
- [x] Sistema de autenticación JWT
- [x] CRUD completo de usuarios
- [x] Sistema de invitaciones por magic link
- [x] Gestión de planes de entrenamiento
- [x] Seguimiento de ejercicios
- [x] Sistema de estadísticas
- [x] Documentación Swagger completa
- [x] Base de datos PostgreSQL
- [x] Validación con Zod
- [x] Manejo de errores

### 🚧 En desarrollo
- [ ] Integración con Resend para emails
- [ ] Templates de email profesionales
- [ ] Sistema de notificaciones
- [ ] Rate limiting
- [ ] Tests automatizados

### 🔮 Futuras mejoras
- [ ] Subida de archivos (fotos de perfil)
- [ ] Sistema de roles más granular
- [ ] API de estadísticas avanzadas
- [ ] Exportación de datos
- [ ] Sistema de backup automático

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 👨‍💻 Autor

**FitApp Development Team**
- Email: admin@fitapp.com
- Documentación: http://localhost:3000/api-docs

---

**🚀 ¡FitApp Backend está listo para usar! Abre http://localhost:3000/api-docs para explorar toda la API de forma interactiva.** 