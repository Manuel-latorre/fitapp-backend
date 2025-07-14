"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyConnection = exports.initializeDatabase = exports.prisma = void 0;
const prisma_1 = require("../generated/prisma");
let prisma;
// Database connection with retry logic
const createPrismaClient = () => {
    return new prisma_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });
};
// Connection verification function
const verifyConnection = async (client, retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await client.$connect();
            await client.$queryRaw `SELECT 1`;
            console.log('✅ Database connection successful');
            return true;
        }
        catch (error) {
            console.log(`❌ Database connection attempt ${i + 1}/${retries} failed:`, error instanceof Error ? error.message : 'Unknown error');
            if (i === retries - 1) {
                console.error('🔴 All database connection attempts failed. Please ensure PostgreSQL is running at localhost:5432');
                console.error('💡 Solutions:');
                console.error('   1. Start PostgreSQL service: net start postgresql-x64-15 (Windows)');
                console.error('   2. Use Docker: npm run db:docker');
                console.error('   3. Check your DATABASE_URL in .env file');
                throw new Error('Database connection failed after all retries');
            }
            console.log(`⏳ Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return false;
};
exports.verifyConnection = verifyConnection;
if (process.env.NODE_ENV === 'production') {
    exports.prisma = prisma = createPrismaClient();
}
else {
    if (!global.__db__) {
        global.__db__ = createPrismaClient();
    }
    exports.prisma = prisma = global.__db__;
}
// Initialize connection with retry logic
const initializeDatabase = async () => {
    try {
        await verifyConnection(prisma);
    }
    catch (error) {
        console.error('🔴 Failed to initialize database connection');
        process.exit(1);
    }
};
exports.initializeDatabase = initializeDatabase;
// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
//# sourceMappingURL=database.js.map