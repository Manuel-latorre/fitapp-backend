#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const execAsync = promisify(exec);

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const checkEnvFile = () => {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    log('yellow', '⚠️  .env file not found. Creating one...');
    const envContent = `# Database Configuration
DATABASE_URL="postgresql://fitapp_user:fitapp_password@localhost:5432/fitapp_db?schema=public"

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
`;
    fs.writeFileSync(envPath, envContent);
    log('green', '✅ .env file created with default values');
  } else {
    log('green', '✅ .env file found');
  }
};

const checkDockerCompose = async () => {
  try {
    await execAsync('docker-compose --version');
    return true;
  } catch (error) {
    return false;
  }
};

const startDockerDatabase = async () => {
  try {
    log('blue', '🐳 Starting PostgreSQL with Docker...');
    await execAsync('docker-compose up -d postgres');
    log('green', '✅ Docker PostgreSQL started');
    
    // Wait for database to be ready
    log('blue', '⏳ Waiting for database to be ready...');
    await sleep(5000);
    
    // Check if database is ready
    for (let i = 0; i < 10; i++) {
      try {
        await execAsync('docker-compose exec postgres pg_isready -U fitapp_user');
        log('green', '✅ Database is ready');
        return true;
      } catch (error) {
        log('yellow', `⏳ Database not ready yet, attempt ${i + 1}/10...`);
        await sleep(2000);
      }
    }
    
    log('red', '❌ Database failed to start properly');
    return false;
  } catch (error) {
    log('red', '❌ Failed to start Docker database:', error.message);
    return false;
  }
};

const setupDatabase = async () => {
  try {
    log('blue', '🔧 Setting up database...');
    
    // Generate Prisma client
    log('blue', '📦 Generating Prisma client...');
    await execAsync('npm run db:generate');
    
    // Run migrations
    log('blue', '🏃 Running database migrations...');
    await execAsync('npm run db:migrate');
    
    log('green', '✅ Database setup complete');
    return true;
  } catch (error) {
    log('red', '❌ Database setup failed:', error.message);
    return false;
  }
};

const buildProject = async () => {
  try {
    log('blue', '🔨 Building project...');
    await execAsync('npm run build');
    log('green', '✅ Project built successfully');
    return true;
  } catch (error) {
    log('red', '❌ Build failed:', error.message);
    return false;
  }
};

const main = async () => {
  log('cyan', '🚀 FitApp Backend Quick Start');
  log('cyan', '================================');
  
  // Check if Docker is available
  const hasDocker = await checkDockerCompose();
  
  if (!hasDocker) {
    log('red', '❌ Docker Compose not found');
    log('yellow', '💡 Please install Docker Desktop and try again');
    log('yellow', '   Or use: npm run db:check for manual setup');
    process.exit(1);
  }
  
  // Check/create .env file
  checkEnvFile();
  
  // Start Docker database
  const dbStarted = await startDockerDatabase();
  if (!dbStarted) {
    log('red', '❌ Failed to start database');
    process.exit(1);
  }
  
  // Setup database
  const dbSetup = await setupDatabase();
  if (!dbSetup) {
    log('red', '❌ Failed to setup database');
    process.exit(1);
  }
  
  // Build project
  const built = await buildProject();
  if (!built) {
    log('red', '❌ Failed to build project');
    process.exit(1);
  }
  
  log('green', '🎉 Setup complete!');
  log('cyan', '================================');
  log('green', 'Next steps:');
  log('green', '1. npm run dev    # Start development server');
  log('green', '2. npm run db:studio  # Open database admin');
  log('green', '3. Visit http://localhost:3000/health');
  log('cyan', '================================');
};

main(); 