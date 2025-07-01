# FitApp Backend - Configuración

Este es el backend para la aplicación FitApp, una aplicación de seguimiento de ejercicios y planes de entrenamiento.

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- PostgreSQL (v13 o superior)
- npm o yarn

## 🔧 Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fitapp_db?schema=public"

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key_here

# Supabase (if needed for file storage)
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# JWT Secret (if implementing custom auth)
JWT_SECRET=your_jwt_secret_here

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 3. Configurar PostgreSQL

#### Opción A: Instalación Local
1. Instala PostgreSQL en tu sistema
2. Crea una base de datos llamada `fitapp_db`
3. Crea un usuario con permisos de escritura
4. Actualiza la `DATABASE_URL` en el archivo `.env`

#### Opción B: Usando Docker
```bash
docker run --name fitapp-postgres \
  -e POSTGRES_USER=fitapp_user \
  -e POSTGRES_PASSWORD=fitapp_password \
  -e POSTGRES_DB=fitapp_db \
  -p 5432:5432 \
  -d postgres:15
```

### 4. Ejecutar Migraciones

```bash
# Generar y aplicar migraciones
npx prisma migrate dev --name init

# O si ya existen las migraciones
npx prisma migrate deploy
```

### 5. Generar Cliente Prisma

```bash
npx prisma generate
```

## 🏃‍♂️ Ejecutar la Aplicación

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

## 📊 Estructura de la Base de Datos

La aplicación maneja las siguientes entidades:

### Users (Usuarios)
- **id**: UUID único
- **role**: Rol del usuario (user, trainer, admin)
- **name**: Nombre del usuario
- **email**: Email único
- **phone**: Teléfono (opcional)
- **profilePicture**: URL de imagen de perfil (opcional)

### Plans (Planes de Entrenamiento)
- **id**: UUID único
- **userId**: ID del usuario propietario
- **title**: Título del plan
- **description**: Descripción del plan

### PlanSessions (Sesiones del Plan)
- **id**: UUID único
- **planId**: ID del plan
- **sessionNumber**: Número de sesión (1-5)
- **name**: Nombre de la sesión
- **completed**: Estado de completado

### SessionBlocks (Bloques de la Sesión)
- **id**: UUID único
- **sessionId**: ID de la sesión
- **title**: Título del bloque
- **position**: Posición para ordenamiento

### BlockExercises (Ejercicios del Bloque)
- **id**: UUID único
- **blockId**: ID del bloque
- **exerciseName**: Nombre del ejercicio
- **series**: Número de series
- **reps**: Especificación de repeticiones
- **rest**: Tiempo de descanso
- **observations**: Observaciones

### ExerciseTracking (Seguimiento de Ejercicios)
- **id**: UUID único
- **exerciseId**: ID del ejercicio
- **userId**: ID del usuario
- **kg**: Peso utilizado
- **pse**: Esfuerzo percibido
- **rir**: Repeticiones en reserva
- **done**: Estado de completado

## 🔐 Configuración de Usuario Administrador

Para crear el primer usuario administrador, haz una petición POST a:

```bash
POST /api/admin/setup
```

Esto creará un usuario administrador con:
- Email: admin@fitapp.com
- Rol: admin
- Nombre: Administrator

## 📖 API Endpoints

### Usuarios
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `POST /api/users` - Crear nuevo usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario
- `GET /api/users/:id/plans` - Obtener planes de un usuario

### Planes
- `GET /api/plans` - Obtener todos los planes
- `GET /api/plans/:id` - Obtener plan por ID
- `POST /api/plans` - Crear nuevo plan
- `PUT /api/plans/:id` - Actualizar plan
- `DELETE /api/plans/:id` - Eliminar plan

### Sesiones
- `POST /api/sessions` - Crear nueva sesión
- `PUT /api/sessions/:id/complete` - Marcar sesión como completada

### Bloques
- `POST /api/blocks` - Crear nuevo bloque

### Ejercicios
- `POST /api/exercises` - Crear nuevo ejercicio

### Tracking
- `GET /api/tracking` - Obtener todo el tracking
- `GET /api/tracking/user/:userId` - Tracking por usuario
- `GET /api/tracking/exercise/:exerciseId` - Tracking por ejercicio
- `POST /api/tracking` - Crear nuevo tracking
- `PUT /api/tracking/:id` - Actualizar tracking
- `DELETE /api/tracking/:id` - Eliminar tracking
- `PUT /api/tracking/:id/done` - Marcar ejercicio como hecho

### Estadísticas
- `GET /api/users/:userId/stats` - Estadísticas de usuario

## 🛠️ Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Compilar para producción
- `npm run start` - Ejecutar en producción
- `npm run db:migrate` - Ejecutar migraciones
- `npm run db:generate` - Generar cliente Prisma
- `npm run db:studio` - Abrir Prisma Studio
- `npm run db:seed` - Ejecutar seeds (cuando esté disponible)

## 🔍 Verificación

### Health Check
```bash
GET /health
```

### API Info
```bash
GET /api
```

## 🚨 Issues Solucionados

✅ Schema de Prisma actualizado con todas las tablas requeridas
✅ Controladores creados para todas las entidades
✅ Rutas configuradas correctamente
✅ Validación con Zod implementada
✅ Manejo de errores configurado
✅ Relaciones entre entidades establecidas
✅ Sistema de roles implementado (user, trainer, admin)

## 📞 Soporte

Si encuentras algún problema durante la configuración, verifica:

1. Que PostgreSQL esté ejecutándose
2. Que las variables de entorno estén configuradas correctamente
3. Que las migraciones se hayan aplicado correctamente
4. Que el cliente de Prisma esté generado

Para más ayuda, revisa los logs del servidor y la documentación de Prisma. 