import { PrismaClient } from '../generated/prisma';
declare global {
    var __db__: PrismaClient | undefined;
}
declare let prisma: PrismaClient;
export { prisma };
//# sourceMappingURL=database.d.ts.map