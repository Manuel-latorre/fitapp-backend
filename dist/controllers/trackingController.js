"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingController = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middlewares/errorHandler");
const zod_1 = require("zod");
// Esquemas de validación
const createTrackingSchema = zod_1.z.object({
    exerciseId: zod_1.z.string().uuid('Invalid exercise ID'),
    userId: zod_1.z.string().uuid('Invalid user ID'),
    kg: zod_1.z.string().optional(),
    pse: zod_1.z.string().optional(),
    rir: zod_1.z.string().optional(),
    done: zod_1.z.boolean().default(false)
});
const updateTrackingSchema = zod_1.z.object({
    kg: zod_1.z.string().optional(),
    pse: zod_1.z.string().optional(),
    rir: zod_1.z.string().optional(),
    done: zod_1.z.boolean().optional()
});
class TrackingController {
    // Obtener todo el tracking de ejercicios
    static async getAllTracking(req, res, next) {
        try {
            const tracking = await database_1.prisma.exerciseTracking.findMany({
                include: {
                    exercise: {
                        include: {
                            block: {
                                include: {
                                    session: {
                                        include: {
                                            plan: {
                                                include: {
                                                    user: {
                                                        select: {
                                                            id: true,
                                                            name: true,
                                                            email: true
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            res.json({
                tracking,
                total: tracking.length
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Obtener tracking por usuario
    static async getTrackingByUser(req, res, next) {
        try {
            const { userId } = req.params;
            const tracking = await database_1.prisma.exerciseTracking.findMany({
                where: { userId },
                include: {
                    exercise: {
                        include: {
                            block: {
                                include: {
                                    session: {
                                        include: {
                                            plan: {
                                                select: {
                                                    id: true,
                                                    title: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            res.json({
                userId,
                tracking,
                total: tracking.length
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Obtener tracking por ejercicio
    static async getTrackingByExercise(req, res, next) {
        try {
            const { exerciseId } = req.params;
            const tracking = await database_1.prisma.exerciseTracking.findMany({
                where: { exerciseId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            const exercise = await database_1.prisma.blockExercise.findUnique({
                where: { id: exerciseId },
                include: {
                    block: {
                        include: {
                            session: {
                                include: {
                                    plan: true
                                }
                            }
                        }
                    }
                }
            });
            if (!exercise) {
                throw (0, errorHandler_1.createError)('Exercise not found', 404);
            }
            res.json({
                exercise,
                tracking,
                total: tracking.length
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Crear nuevo tracking
    static async createTracking(req, res, next) {
        try {
            const validation = createTrackingSchema.safeParse(req.body);
            if (!validation.success) {
                throw (0, errorHandler_1.createError)('Invalid input data', 400);
            }
            const trackingData = validation.data;
            // Verificar que el ejercicio existe
            const exercise = await database_1.prisma.blockExercise.findUnique({
                where: { id: trackingData.exerciseId }
            });
            if (!exercise) {
                throw (0, errorHandler_1.createError)('Exercise not found', 404);
            }
            // Verificar que el usuario existe
            const user = await database_1.prisma.user.findUnique({
                where: { id: trackingData.userId }
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            // Verificar si ya existe tracking para este usuario y ejercicio
            const existingTracking = await database_1.prisma.exerciseTracking.findFirst({
                where: {
                    exerciseId: trackingData.exerciseId,
                    userId: trackingData.userId
                }
            });
            if (existingTracking) {
                throw (0, errorHandler_1.createError)('Tracking already exists for this user and exercise', 409);
            }
            const tracking = await database_1.prisma.exerciseTracking.create({
                data: trackingData,
                include: {
                    exercise: {
                        select: {
                            id: true,
                            exerciseName: true,
                            series: true,
                            reps: true,
                            rest: true
                        }
                    },
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
                message: 'Tracking created successfully',
                tracking
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Actualizar tracking
    static async updateTracking(req, res, next) {
        try {
            const { id } = req.params;
            const validation = updateTrackingSchema.safeParse(req.body);
            if (!validation.success) {
                throw (0, errorHandler_1.createError)('Invalid input data', 400);
            }
            const tracking = await database_1.prisma.exerciseTracking.update({
                where: { id },
                data: validation.data,
                include: {
                    exercise: {
                        select: {
                            id: true,
                            exerciseName: true,
                            series: true,
                            reps: true,
                            rest: true
                        }
                    },
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
                message: 'Tracking updated successfully',
                tracking
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Eliminar tracking
    static async deleteTracking(req, res, next) {
        try {
            const { id } = req.params;
            await database_1.prisma.exerciseTracking.delete({
                where: { id }
            });
            res.json({ message: 'Tracking deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    // Marcar ejercicio como hecho
    static async markAsDone(req, res, next) {
        try {
            const { id } = req.params;
            const tracking = await database_1.prisma.exerciseTracking.update({
                where: { id },
                data: { done: true },
                include: {
                    exercise: {
                        select: {
                            id: true,
                            exerciseName: true
                        }
                    }
                }
            });
            res.json({
                message: 'Exercise marked as done',
                tracking
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Obtener estadísticas de un usuario
    static async getUserStats(req, res, next) {
        try {
            const { userId } = req.params;
            const [totalTracking, completedTracking, plansCount] = await Promise.all([
                database_1.prisma.exerciseTracking.count({
                    where: { userId }
                }),
                database_1.prisma.exerciseTracking.count({
                    where: {
                        userId,
                        done: true
                    }
                }),
                database_1.prisma.plan.count({
                    where: { userId }
                })
            ]);
            const completionRate = totalTracking > 0 ? (completedTracking / totalTracking) * 100 : 0;
            // Obtener ejercicios recientes
            const recentExercises = await database_1.prisma.exerciseTracking.findMany({
                where: { userId },
                include: {
                    exercise: {
                        select: {
                            exerciseName: true,
                            series: true,
                            reps: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 5
            });
            res.json({
                userId,
                stats: {
                    totalExercises: totalTracking,
                    completedExercises: completedTracking,
                    completionRate: Math.round(completionRate * 100) / 100,
                    totalPlans: plansCount
                },
                recentExercises
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TrackingController = TrackingController;
//# sourceMappingURL=trackingController.js.map