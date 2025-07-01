-- FitApp Database Setup Script
-- Execute this script in your PostgreSQL database to create all required tables

-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS exercise_tracking CASCADE;
DROP TABLE IF EXISTS block_exercises CASCADE;
DROP TABLE IF EXISTS session_blocks CASCADE;
DROP TABLE IF EXISTS plan_sessions CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL DEFAULT 'user', -- 'user', 'trainer', 'admin'
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  profile_picture TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create plans table
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create plan_sessions table
CREATE TABLE plan_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
  session_number INT CHECK (session_number BETWEEN 1 AND 5),
  name TEXT NOT NULL, -- Ej: "Sesión 1"
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create session_blocks table
CREATE TABLE session_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES plan_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- Ej: "Bloque I"
  position INT NOT NULL, -- para ordenarlos
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create block_exercises table
CREATE TABLE block_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID REFERENCES session_blocks(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  series INT NOT NULL,
  reps TEXT NOT NULL, -- Ej: "8/8", "20\"20\"", "10", etc.
  rest TEXT,
  observations TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create exercise_tracking table
CREATE TABLE exercise_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID REFERENCES block_exercises(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  kg TEXT,
  pse TEXT,
  rir TEXT,
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_plans_user_id ON plans(user_id);
CREATE INDEX idx_plan_sessions_plan_id ON plan_sessions(plan_id);
CREATE INDEX idx_plan_sessions_number ON plan_sessions(session_number);
CREATE INDEX idx_session_blocks_session_id ON session_blocks(session_id);
CREATE INDEX idx_session_blocks_position ON session_blocks(position);
CREATE INDEX idx_block_exercises_block_id ON block_exercises(block_id);
CREATE INDEX idx_exercise_tracking_exercise_id ON exercise_tracking(exercise_id);
CREATE INDEX idx_exercise_tracking_user_id ON exercise_tracking(user_id);
CREATE INDEX idx_exercise_tracking_done ON exercise_tracking(done);

-- Insert admin user
INSERT INTO users (name, email, role, phone, profile_picture) 
VALUES ('Administrator', 'admin@fitapp.com', 'admin', NULL, NULL);

-- Insert sample trainer
INSERT INTO users (name, email, role, phone, profile_picture) 
VALUES ('Trainer Demo', 'trainer@fitapp.com', 'trainer', '+1234567890', NULL);

-- Insert sample user
INSERT INTO users (name, email, role, phone, profile_picture) 
VALUES ('Usuario Demo', 'user@fitapp.com', 'user', '+0987654321', NULL);

-- Display success message
SELECT 'Database setup completed successfully!' as status;

-- Show created tables
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'plans', 'plan_sessions', 'session_blocks', 'block_exercises', 'exercise_tracking')
ORDER BY table_name; 