# FitApp API - Ejemplos de Uso

Este documento contiene ejemplos prácticos de cómo usar todos los endpoints de la API de FitApp.

## 🚀 Configuración Inicial

### 1. Configurar Variables de Entorno

Crea un archivo `.env` con:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/fitapp_db?schema=public"
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-here
```

### 2. Configurar Base de Datos

```bash
# Opción 1: Usar Prisma (recomendado)
npx prisma migrate dev --name init
npx prisma generate

# Opción 2: Ejecutar SQL directamente
# Ejecuta el archivo database-setup.sql en tu base de datos PostgreSQL
```

### 3. Iniciar el Servidor

```bash
npm run dev
```

## 📚 Ejemplos de API

### Health Check

```bash
GET http://localhost:3000/health
```

**Respuesta:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development",
  "message": "FitApp Backend API is running"
}
```

---

## 🔐 Autenticación

### Login (sin password - solo para demo)

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@fitapp.com"
}
```

**Respuesta:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "Administrator",
    "email": "admin@fitapp.com",
    "role": "admin",
    "phone": null,
    "profilePicture": null
  }
}
```

### Verificar Token

```bash
POST http://localhost:3000/api/auth/verify
Authorization: Bearer YOUR_TOKEN_HERE
```

### Obtener Usuario Actual

```bash
GET http://localhost:3000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 👥 Gestión de Usuarios

### Crear Usuario

```bash
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "role": "user",
  "phone": "+1234567890",
  "profilePicture": "https://example.com/avatar.jpg"
}
```

### Obtener Todos los Usuarios

```bash
GET http://localhost:3000/api/users
```

### Obtener Usuario por ID

```bash
GET http://localhost:3000/api/users/uuid-here
```

### Actualizar Usuario

```bash
PUT http://localhost:3000/api/users/uuid-here
Content-Type: application/json

{
  "name": "Juan Carlos Pérez",
  "phone": "+0987654321"
}
```

### Eliminar Usuario

```bash
DELETE http://localhost:3000/api/users/uuid-here
```

---

## 📋 Gestión de Planes

### Crear Plan de Entrenamiento

```bash
POST http://localhost:3000/api/plans
Content-Type: application/json

{
  "userId": "user-uuid-here",
  "title": "Plan de Fuerza - Nivel Intermedio",
  "description": "Plan diseñado para desarrollar fuerza en 5 sesiones"
}
```

### Obtener Todos los Planes

```bash
GET http://localhost:3000/api/plans
```

### Obtener Plan por ID

```bash
GET http://localhost:3000/api/plans/plan-uuid-here
```

### Actualizar Plan

```bash
PUT http://localhost:3000/api/plans/plan-uuid-here
Content-Type: application/json

{
  "title": "Plan de Fuerza - Nivel Avanzado",
  "description": "Plan actualizado para nivel avanzado"
}
```

---

## 🏃‍♂️ Gestión de Sesiones

### Crear Sesión en un Plan

```bash
POST http://localhost:3000/api/sessions
Content-Type: application/json

{
  "planId": "plan-uuid-here",
  "sessionNumber": 1,
  "name": "Sesión 1 - Tren Superior"
}
```

### Marcar Sesión como Completada

```bash
PUT http://localhost:3000/api/sessions/session-uuid-here/complete
```

---

## 🧱 Gestión de Bloques

### Crear Bloque en una Sesión

```bash
POST http://localhost:3000/api/blocks
Content-Type: application/json

{
  "sessionId": "session-uuid-here",
  "title": "Bloque I - Calentamiento",
  "position": 1
}
```

---

## 💪 Gestión de Ejercicios

### Crear Ejercicio en un Bloque

```bash
POST http://localhost:3000/api/exercises
Content-Type: application/json

{
  "blockId": "block-uuid-here",
  "exerciseName": "Press de Banca",
  "series": 4,
  "reps": "8/8/6/6",
  "rest": "2-3 min",
  "observations": "Controlar la bajada, explotar la subida"
}
```

---

## 📊 Tracking de Ejercicios

### Crear Tracking para un Ejercicio

```bash
POST http://localhost:3000/api/tracking
Content-Type: application/json

{
  "exerciseId": "exercise-uuid-here",
  "userId": "user-uuid-here",
  "kg": "80",
  "pse": "7",
  "rir": "2",
  "done": false
}
```

### Obtener Todo el Tracking

```bash
GET http://localhost:3000/api/tracking
```

### Obtener Tracking por Usuario

```bash
GET http://localhost:3000/api/tracking/user/user-uuid-here
```

### Obtener Tracking por Ejercicio

```bash
GET http://localhost:3000/api/tracking/exercise/exercise-uuid-here
```

### Actualizar Tracking

```bash
PUT http://localhost:3000/api/tracking/tracking-uuid-here
Content-Type: application/json

{
  "kg": "85",
  "pse": "8",
  "rir": "1",
  "done": true
}
```

### Marcar Ejercicio como Hecho

```bash
PUT http://localhost:3000/api/tracking/tracking-uuid-here/done
```

---

## 📈 Estadísticas

### Obtener Estadísticas de Usuario

```bash
GET http://localhost:3000/api/users/user-uuid-here/stats
```

**Respuesta:**
```json
{
  "userId": "user-uuid-here",
  "stats": {
    "totalExercises": 25,
    "completedExercises": 18,
    "completionRate": 72,
    "totalPlans": 3
  },
  "recentExercises": [...]
}
```

---

## 🔧 Administración

### Configurar Usuario Administrador

```bash
POST http://localhost:3000/api/admin/setup
```

### Generar Token para Usuario (Solo Admin)

```bash
POST http://localhost:3000/api/auth/generate-token
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json

{
  "userId": "user-uuid-here"
}
```

---

## 🎯 Flujo Completo de Ejemplo

### 1. Configurar Admin

```bash
POST http://localhost:3000/api/admin/setup
```

### 2. Login como Admin

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@fitapp.com"
}
```

### 3. Crear Usuario

```bash
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "name": "María González",
  "email": "maria@example.com",
  "role": "user",
  "phone": "+1234567890"
}
```

### 4. Crear Plan para el Usuario

```bash
POST http://localhost:3000/api/plans
Content-Type: application/json

{
  "userId": "maria-user-id",
  "title": "Plan Principiante",
  "description": "Plan básico para comenzar"
}
```

### 5. Crear Sesión

```bash
POST http://localhost:3000/api/sessions
Content-Type: application/json

{
  "planId": "plan-id",
  "sessionNumber": 1,
  "name": "Sesión 1"
}
```

### 6. Crear Bloque

```bash
POST http://localhost:3000/api/blocks
Content-Type: application/json

{
  "sessionId": "session-id",
  "title": "Bloque Principal",
  "position": 1
}
```

### 7. Crear Ejercicio

```bash
POST http://localhost:3000/api/exercises
Content-Type: application/json

{
  "blockId": "block-id",
  "exerciseName": "Sentadillas",
  "series": 3,
  "reps": "10",
  "rest": "1 min"
}
```

### 8. Crear Tracking

```bash
POST http://localhost:3000/api/tracking
Content-Type: application/json

{
  "exerciseId": "exercise-id",
  "userId": "maria-user-id",
  "kg": "40",
  "pse": "6",
  "rir": "3",
  "done": true
}
```

---

## 🚨 Notas Importantes

1. **Autenticación**: La mayoría de endpoints requieren autenticación. Incluye el header:
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

2. **Roles**: 
   - `admin`: Acceso completo
   - `trainer`: Puede gestionar planes y ejercicios
   - `user`: Puede ver sus propios datos y hacer tracking

3. **UUIDs**: Todos los IDs son UUIDs generados automáticamente

4. **Validación**: Todos los endpoints validan la entrada con Zod

5. **Errores**: Los errores devuelven códigos HTTP apropiados y mensajes descriptivos

## 🛠️ Herramientas Recomendadas

- **Postman**: Para probar los endpoints
- **Prisma Studio**: Para ver la base de datos (`npx prisma studio`)
- **PostgreSQL Admin**: Para gestionar la base de datos

## 📞 Soporte

Si encuentras problemas:

1. Verifica que el servidor esté ejecutándose
2. Verifica que la base de datos esté configurada
3. Verifica que los tokens sean válidos
4. Revisa los logs del servidor para errores específicos 