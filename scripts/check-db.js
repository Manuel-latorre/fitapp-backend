#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
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

const checkPostgresConnection = async () => {
  try {
    // Try to connect to PostgreSQL
    const { PrismaClient } = require('../src/generated/prisma');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    
    log('green', '✅ Database connection successful!');
    return true;
  } catch (error) {
    log('red', '❌ Database connection failed:');
    console.log(`   ${error.message}`);
    
    // Check if it's a specific connection error
    if (error.message.includes('ECONNREFUSED') || error.message.includes('connect ECONNREFUSED')) {
      log('yellow', '   This looks like PostgreSQL is not running on localhost:5432');
    } else if (error.message.includes('does not exist')) {
      log('yellow', '   Database or user might not exist');
    } else if (error.message.includes('password authentication failed')) {
      log('yellow', '   Check your DATABASE_URL credentials in .env');
    }
    
    return false;
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

const checkPostgresService = async () => {
  try {
    // Check if PostgreSQL service is running on Windows
    const { stdout } = await execAsync('netstat -an | findstr :5432');
    if (stdout.includes('LISTENING')) {
      return true;
    }
  } catch (error) {
    // Service not running or command failed
  }
  return false;
};

const main = async () => {
  log('blue', '🔍 Checking database connection...');
  
  const isConnected = await checkPostgresConnection();
  
  if (isConnected) {
    log('green', '🎉 Database is ready to use!');
    process.exit(0);
  }
  
  log('yellow', '⚠️  Database is not accessible. Let me help you fix this...');
  
  const hasDockerCompose = await checkDockerCompose();
  const hasPostgresService = await checkPostgresService();
  
  console.log('\n' + colors.cyan + '💡 Solutions:' + colors.reset);
  
  if (hasDockerCompose) {
    console.log('\n' + colors.green + '🐳 RECOMMENDED: Use Docker (easiest)' + colors.reset);
    console.log('   npm run db:docker');
    console.log('   npm run dev');
  }
  
  if (hasPostgresService) {
    console.log('\n' + colors.yellow + '🔧 Option 2: Start PostgreSQL Service' + colors.reset);
    console.log('   net start postgresql-x64-15');
    console.log('   (or check your PostgreSQL service name)');
  } else {
    console.log('\n' + colors.yellow + '🔧 Option 2: Install PostgreSQL' + colors.reset);
    console.log('   1. Install PostgreSQL from https://www.postgresql.org/download/');
    console.log('   2. Create database: createdb fitapp_db');
    console.log('   3. Update .env with your credentials');
  }
  
  console.log('\n' + colors.magenta + '📋 Option 3: Use External Database' + colors.reset);
  console.log('   Update DATABASE_URL in .env to point to your external database');
  
  log('red', '\n❌ Please fix the database connection and try again.');
  process.exit(1);
};

main(); 