-- Script para agregar campo password a la tabla users
-- Ejecutar DESPUÉS de haber creado las tablas con database-setup.sql

-- 1. Agregar columna password (temporal como nullable)
ALTER TABLE users ADD COLUMN password VARCHAR(255);

-- 2. Actualizar usuarios existentes con contraseña temporal
-- IMPORTANTE: Cambiar estas contraseñas en producción
UPDATE users SET password = '$2b$10$K9.iF8qQvCNdx/oQ.lFcKe5Wf6b1WzHNFT7Rb2oVkUyZzN4JgN6rG' 
WHERE email = 'admin@fitapp.com';
-- Contraseña temporal: "admin123" (hasheada con bcrypt)

-- Si hay otros usuarios, actualizar con contraseñas temporales
-- UPDATE users SET password = '$2b$10$rL1lQKZ9g8wQy3vE4nH6CeA7bZ5mD1JfF9nR2sC8tN9qU6xK4yW8.' 
-- WHERE password IS NULL;
-- Contraseña temporal: "temp123" (hasheada con bcrypt)

-- 3. Hacer la columna NOT NULL después de actualizar todos los registros
ALTER TABLE users ALTER COLUMN password SET NOT NULL;

-- 4. Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Notas importantes:
-- - Las contraseñas están hasheadas con bcrypt (cost factor 10)
-- - admin@fitapp.com tiene contraseña: "admin123"
-- - Cambiar contraseñas inmediatamente después de aplicar el script
-- - Los nuevos usuarios establecerán su contraseña durante el registro 