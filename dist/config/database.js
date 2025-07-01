"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const prisma_1 = require("../generated/prisma");
let prisma;
if (process.env.NODE_ENV === 'production') {
    exports.prisma = prisma = new prisma_1.PrismaClient();
}
else {
    if (!global.__db__) {
        global.__db__ = new prisma_1.PrismaClient({
            log: ['query', 'error', 'warn'],
        });
    }
    exports.prisma = prisma = global.__db__;
}
// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=database.js.map