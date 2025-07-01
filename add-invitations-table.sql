-- Script para agregar la tabla de invitaciones de usuarios
-- Ejecutar este script en tu base de datos PostgreSQL

-- Crear tabla de invitaciones
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para mejor performance
CREATE INDEX idx_user_invitations_token ON user_invitations(token);
CREATE INDEX idx_user_invitations_email ON user_invitations(email);
CREATE INDEX idx_user_invitations_invited_by ON user_invitations(invited_by);
CREATE INDEX idx_user_invitations_expires_at ON user_invitations(expires_at);
CREATE INDEX idx_user_invitations_used_at ON user_invitations(used_at);

-- Verificar que la tabla se creó correctamente
SELECT 'user_invitations table created successfully!' as status;

-- Mostrar estructura de la tabla
\d user_invitations; 