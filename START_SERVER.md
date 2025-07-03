# Guía de Inicio Diario del Servidor - FitApp Backend

## Comandos para ejecutar CADA DÍA antes de iniciar el servidor

Ejecuta estos comandos en PowerShell en el directorio del proyecto (`D:\Proyects\fitapp-backend`):

### 1. Verificar que estás en el directorio correcto
```powershell
cd D:\Proyects\fitapp-backend
```

### 2. Generar el cliente de Prisma (OBLIGATORIO)
```powershell
npm run db:generate
```
**¿Qué hace?** Genera el cliente de Prisma en `src/generated/prisma` que es requerido por la aplicación.

### 3. Aplicar migraciones de la base de datos
```powershell
npm run db:migrate
```
**¿Qué hace?** Aplica todas las migraciones pendientes a tu base de datos PostgreSQL. Esto asegura que tu esquema esté actualizado.

### 4. Compilar TypeScript
```powershell
npm run build
```
**¿Qué hace?** Compila todo el código TypeScript a JavaScript en la carpeta `dist/`.

### 5. Iniciar el servidor
```powershell
npm start
```

## Comando completo en una sola línea (recomendado)
```powershell
npm run db:generate && npm run db:migrate && npm run build && npm start
```

## Para desarrollo (alternativo)
Si estás desarrollando y quieres que se reinicie automáticamente:
```powershell
npm run db:generate && npm run db:migrate && npm run dev
```

## En caso de problemas con la base de datos

Si perdiste la base de datos o tienes problemas de conexión:

### 1. Resetear completamente la base de datos
```powershell
# Eliminar todas las tablas y recrearlas
npx prisma migrate reset
```

### 2. Luego ejecutar la secuencia normal
```powershell
npm run db:generate && npm run build && npm start
```

## Variables de entorno requeridas

Asegúrate de tener un archivo `.env` en la raíz del proyecto con:
```
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/fitapp_db"
# Otras variables según tu configuración
```

## Notas importantes

- **SIEMPRE** ejecuta `npm run db:generate` antes de compilar o iniciar
- Si cambias el esquema de Prisma, debes ejecutar tanto `db:migrate` como `db:generate`
- El comando `npm run db:migrate` es seguro - no perderás datos existentes
- Si el servidor no inicia, verifica que PostgreSQL esté ejecutándose 