"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeekController = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middlewares/errorHandler");
const zod_1 = require("zod");
// Esquemas de validación
const createWeekSchema = zod_1.z.object({
    planId: zod_1.z.string().uuid('Invalid plan ID'),
    title: zod_1.z.string().min(1, 'Title is required')
});
const updateWeekSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional()
});
class WeekController {
    // Obtener todas las semanas de un plan
    static async getWeeksByPlan(req, res, next) {
        try {
            const { planId } = req.params;
            const weeks = await database_1.prisma.week.findMany({
                where: { planId },
                include: {
                    sessions: {
                        include: {
                            blocks: {
                                include: {
                                    exercises: true
                                },
                                orderBy: { position: 'asc' }
                            }
                        },
                        orderBy: { sessionNumber: 'asc' }
                    }
                },
                orderBy: { createdAt: 'asc' }
            });
            res.json({
                weeks,
                total: weeks.length
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Obtener semana por ID
    static async getWeekById(req, res, next) {
        try {
            const { id } = req.params;
            const week = await database_1.prisma.week.findUnique({
                where: { id },
                include: {
                    plan: {
                        select: {
                            id: true,
                            title: true,
                            description: true
                        }
                    },
                    sessions: {
                        include: {
                            blocks: {
                                include: {
                                    exercises: true
                                },
                                orderBy: { position: 'asc' }
                            }
                        },
                        orderBy: { sessionNumber: 'asc' }
                    }
                }
            });
            if (!week) {
                throw (0, errorHandler_1.createError)('Week not found', 404);
            }
            res.json({ week });
        }
        catch (error) {
            next(error);
        }
    }
    // Crear nueva semana
    static async createWeek(req, res, next) {
        try {
            const validation = createWeekSchema.safeParse(req.body);
            if (!validation.success) {
                throw (0, errorHandler_1.createError)('Invalid input data', 400);
            }
            const weekData = validation.data;
            // Verificar que el plan existe
            const plan = await database_1.prisma.plan.findUnique({
                where: { id: weekData.planId }
            });
            if (!plan) {
                throw (0, errorHandler_1.createError)('Plan not found', 404);
            }
            const week = await database_1.prisma.week.create({
                data: weekData,
                include: {
                    plan: {
                        select: {
                            id: true,
                            title: true,
                            description: true
                        }
                    }
                }
            });
            res.status(201).json({
                message: 'Week created successfully',
                week
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Actualizar semana
    static async updateWeek(req, res, next) {
        try {
            const { id } = req.params;
            const validation = updateWeekSchema.safeParse(req.body);
            if (!validation.success) {
                throw (0, errorHandler_1.createError)('Invalid input data', 400);
            }
            const week = await database_1.prisma.week.update({
                where: { id },
                data: validation.data,
                include: {
                    plan: {
                        select: {
                            id: true,
                            title: true,
                            description: true
                        }
                    }
                }
            });
            res.json({
                message: 'Week updated successfully',
                week
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Eliminar semana
    static async deleteWeek(req, res, next) {
        try {
            const { id } = req.params;
            await database_1.prisma.week.delete({
                where: { id }
            });
            res.json({ message: 'Week deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.WeekController = WeekController;
//# sourceMappingURL=weekController.js.map