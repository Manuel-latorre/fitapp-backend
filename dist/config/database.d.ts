import { PrismaClient } from '../generated/prisma';
declare global {
    var __db__: PrismaClient | undefined;
}
declare let prisma: PrismaClient;
declare const verifyConnection: (client: PrismaClient, retries?: number, delay?: number) => Promise<boolean>;
declare const initializeDatabase: () => Promise<void>;
export { prisma, initializeDatabase, verifyConnection };
//# sourceMappingURL=database.d.ts.map