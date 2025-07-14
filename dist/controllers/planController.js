"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanController = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middlewares/errorHandler");
const zod_1 = require("zod");
// Esquemas de validación
const createPlanSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID'),
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().optional()
});
const updatePlanSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional()
});
const createSessionSchema = zod_1.z.object({
    weekId: zod_1.z.string().uuid('Invalid week ID'),
    sessionNumber: zod_1.z.number().int().min(1).max(5),
    name: zod_1.z.string().min(1, 'Session name is required')
});
const updateSessionSchema = zod_1.z.object({
    sessionNumber: zod_1.z.number().int().min(1).max(5).optional(),
    name: zod_1.z.string().min(1, 'Session name is required').optional(),
    completed: zod_1.z.boolean().optional()
});
const createBlockSchema = zod_1.z.object({
    sessionId: zod_1.z.string().uuid('Invalid session ID'),
    title: zod_1.z.string().min(1, 'Block title is required'),
    position: zod_1.z.number().int().min(1),
    status: zod_1.z.string().optional().default('pending')
});
const updateBlockSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    position: zod_1.z.number().int().min(1).optional(),
    status: zod_1.z.string().optional()
});
const createExerciseSchema = zod_1.z.object({
    blockId: zod_1.z.string().uuid('Invalid block ID'),
    exerciseName: zod_1.z.string().min(1, 'Exercise name is required'),
    series: zod_1.z.number().int().min(1),
    reps: zod_1.z.string().min(1, 'Reps specification is required'),
    kg: zod_1.z.number().optional(),
    rest: zod_1.z.string().optional(),
    observations: zod_1.z.string().optional(),
    status: zod_1.z.string().optional().default('pending'),
    link: zod_1.z.string().optional()
});
const updateExerciseSchema = zod_1.z.object({
    exerciseName: zod_1.z.string().min(1).optional(),
    series: zod_1.z.number().int().min(1).optional(),
    reps: zod_1.z.string().min(1).optional(),
    kg: zod_1.z.number().optional(),
    rest: zod_1.z.string().optional(),
    observations: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    pse: zod_1.z.string().optional(),
    rir: zod_1.z.string().optional(),
    done: zod_1.z.boolean().optional(),
    completedAt: zod_1.z.date().optional().nullable(),
    link: zod_1.z.string().optional()
});
class PlanController {
    // Obtener todos los planes
    static async getAllPlans(req, res, next) {
        try {
            const plans = await database_1.prisma.plan.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    weeks: {
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
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            res.json({
                plans,
                total: plans.length
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Obtener plan por ID
    static async getPlanById(req, res, next) {
        try {
            const { id } = req.params;
            const plan = await database_1.prisma.plan.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    weeks: {
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
                    }
                }
            });
            if (!plan) {
                throw (0, errorHandler_1.createError)('Plan not found', 404);
            }
            res.json({ plan });
        }
        catch (error) {
            next(error);
        }
    }
    // Crear nuevo plan
    static async createPlan(req, res, next) {
        try {
            const validation = createPlanSchema.safeParse(req.body);
            if (!validation.success) {
                throw (0, errorHandler_1.createError)('Invalid input data', 400);
            }
            const planData = validation.data;
            // Verificar que el usuario existe
            const user = await database_1.prisma.user.findUnique({
                where: { id: planData.userId }
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            const plan = await database_1.prisma.plan.create({
                data: planData,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
            res.status(201).json({
                message: 'Plan created successfully',
                plan
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Actualizar plan
    static async updatePlan(req, res, next) {
        try {
            const { id } = req.params;
            const validation = updatePlanSchema.safeParse(req.body);
            if (!validation.success) {
                throw (0, errorHandler_1.createError)('Invalid input data', 400);
            }
            const plan = await database_1.prisma.plan.update({
                where: { id },
                data: validation.data,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
            res.json({
                message: 'Plan updated successfully',
                plan
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Eliminar plan
    static async deletePlan(req, res, next) {
        try {
            const { id } = req.params;
            await database_1.prisma.plan.delete({
                where: { id }
            });
            res.json({ message: 'Plan deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    // Crear sesión en un plan
    static async createSession(req, res, next) {
        try {
            const validation = createSessionSchema.safeParse(req.body);
            if (!validation.success) {
                throw (0, errorHandler_1.createError)('Invalid input data', 400);
            }
            const sessionData = validation.data;
            // Verificar que la semana existe
            const week = await database_1.prisma.week.findUnique({
                where: { id: sessionData.weekId }
            });
            if (!week) {
                throw (0, errorHandler_1.createError)('Week not found', 404);
            }
            // Verificar que no existe ya una sesión con el mismo número
            const existingSession = await database_1.prisma.planSession.findFirst({
                where: {
                    weekId: sessionData.weekId,
                    sessionNumber: sessionData.sessionNumber
                }
            });
            if (existingSession) {
                throw (0, errorHandler_1.createError)('Session number already exists for this week', 409);
            }
            const session = await database_1.prisma.planSession.create({
                data: sessionData
            });
            res.status(201).json({
                message: 'Session created successfully',
                session
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Crear bloque en una sesión
    static async createBlock(req, res, next) {
        try {
            const validation = createBlockSchema.safeParse(req.body);
            if (!validation.success) {
                throw (0, errorHandler_1.createError)('Invalid input data', 400);
            }
            const blockData = validation.data;
            // Verificar que la sesión existe
            const session = await database_1.prisma.planSession.findUnique({
                where: { id: blockData.sessionId }
            });
            if (!session) {
                throw (0, errorHandler_1.createError)('Session not found', 404);
            }
            const block = await database_1.prisma.sessionBlock.create({
                data: {
                    ...blockData,
                    status: blockData.status || 'pending'
                }
            });
            res.status(201).json({
                message: 'Block created successfully',
                block
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Crear ejercicio en un bloque
    static async createExercise(req, res, next) {
        try {
            const validation = createExerciseSchema.safeParse(req.body);
            if (!validation.success) {
                throw (0, errorHandler_1.createError)('Invalid input data', 400);
            }
            const exerciseData = validation.data;
            // Verificar que el bloque existe
            const block = await database_1.prisma.sessionBlock.findUnique({
                where: { id: exerciseData.blockId }
            });
            if (!block) {
                throw (0, errorHandler_1.createError)('Block not found', 404);
            }
            const exercise = await database_1.prisma.blockExercise.create({
                data: {
                    ...exerciseData,
                    status: exerciseData.status || 'pending'
                }
            });
            res.status(201).json({
                message: 'Exercise created successfully',
                exercise
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Actualizar ejercicio
    static async updateExercise(req, res, next) {
        try {
            const { id } = req.params;
            const validation = updateExerciseSchema.safeParse(req.body);
            if (!validation.success) {
                throw (0, errorHandler_1.createError)('Invalid input data', 400);
            }
            const { done, ...otherData } = validation.data;
            // Construir objeto de actualización
            const updateData = { ...otherData };
            // Si se marca como done=true, establecer completedAt
            if (done === true) {
                updateData.done = true;
                updateData.completedAt = new Date();
            }
            else if (done === false) {
                updateData.done = false;
                updateData.completedAt = null;
            }
            const exercise = await database_1.prisma.blockExercise.update({
                where: { id },
                data: updateData,
                include: {
                    block: {
                        include: {
                            session: {
                                select: {
                                    id: true,
                                    name: true,
                                    sessionNumber: true
                                }
                            }
                        }
                    }
                }
            });
            res.json({
                message: 'Exercise updated successfully',
                exercise
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Eliminar ejercicio
    static async deleteExercise(req, res, next) {
        try {
            const { id } = req.params;
            await database_1.prisma.blockExercise.delete({
                where: { id }
            });
            res.json({ message: 'Exercise deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    // Actualizar bloque
    static async updateBlock(req, res, next) {
        try {
            const { id } = req.params;
            const validation = updateBlockSchema.safeParse(req.body);
            if (!validation.success) {
                throw (0, errorHandler_1.createError)('Invalid input data', 400);
            }
            const block = await database_1.prisma.sessionBlock.update({
                where: { id },
                data: validation.data,
                include: {
                    session: {
                        select: {
                            id: true,
                            name: true,
                            sessionNumber: true
                        }
                    }
                }
            });
            res.json({
                message: 'Block updated successfully',
                block
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Eliminar bloque
    static async deleteBlock(req, res, next) {
        try {
            const { id } = req.params;
            await database_1.prisma.sessionBlock.delete({
                where: { id }
            });
            res.json({ message: 'Block deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    // Actualizar sesión
    static async updateSession(req, res, next) {
        try {
            const { id } = req.params;
            const validation = updateSessionSchema.safeParse(req.body);
            if (!validation.success) {
                throw (0, errorHandler_1.createError)('Invalid input data', 400);
            }
            const updateData = validation.data;
            // Si se quiere cambiar el número de sesión, verificar que no exista ya
            if (updateData.sessionNumber !== undefined) {
                // Obtener la sesión actual para conocer su weekId
                const currentSession = await database_1.prisma.planSession.findUnique({
                    where: { id },
                    select: { weekId: true }
                });
                if (!currentSession) {
                    throw (0, errorHandler_1.createError)('Session not found', 404);
                }
                // Verificar que no exista otra sesión con el mismo número en la misma semana
                const existingSession = await database_1.prisma.planSession.findFirst({
                    where: {
                        sessionNumber: updateData.sessionNumber,
                        weekId: currentSession.weekId,
                        id: { not: id }
                    }
                });
                if (existingSession) {
                    throw (0, errorHandler_1.createError)('Session number already exists for this week', 409);
                }
            }
            const session = await database_1.prisma.planSession.update({
                where: { id },
                data: updateData,
                include: {
                    week: {
                        select: {
                            id: true,
                            title: true,
                            planId: true
                        }
                    }
                }
            });
            res.json({
                message: 'Session updated successfully',
                session
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Marcar sesión como completada
    static async completeSession(req, res, next) {
        try {
            const { id } = req.params;
            const session = await database_1.prisma.planSession.update({
                where: { id },
                data: { completed: true }
            });
            res.json({
                message: 'Session marked as completed',
                session
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PlanController = PlanController;
//# sourceMappingURL=planController.js.map