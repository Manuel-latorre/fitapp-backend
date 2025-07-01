import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { createError } from '../middlewares/errorHandler';
import { z } from 'zod';

// Esquemas de validación
const createTrackingSchema = z.object({
  exerciseId: z.string().uuid('Invalid exercise ID'),
  userId: z.string().uuid('Invalid user ID'),
  kg: z.string().optional(),
  pse: z.string().optional(),
  rir: z.string().optional(),
  done: z.boolean().default(false)
});

const updateTrackingSchema = z.object({
  kg: z.string().optional(),
  pse: z.string().optional(),
  rir: z.string().optional(),
  done: z.boolean().optional()
});

export class TrackingController {
  // Obtener todo el tracking de ejercicios
  static async getAllTracking(req: Request, res: Response, next: NextFunction) {
    try {
      const tracking = await prisma.exerciseTracking.findMany({
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
    } catch (error) {
      next(error);
    }
  }

  // Obtener tracking por usuario
  static async getTrackingByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const tracking = await prisma.exerciseTracking.findMany({
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
    } catch (error) {
      next(error);
    }
  }

  // Obtener tracking por ejercicio
  static async getTrackingByExercise(req: Request, res: Response, next: NextFunction) {
    try {
      const { exerciseId } = req.params;

      const tracking = await prisma.exerciseTracking.findMany({
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

      const exercise = await prisma.blockExercise.findUnique({
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
        throw createError('Exercise not found', 404);
      }

      res.json({ 
        exercise,
        tracking,
        total: tracking.length 
      });
    } catch (error) {
      next(error);
    }
  }

  // Crear nuevo tracking
  static async createTracking(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = createTrackingSchema.safeParse(req.body);

      if (!validation.success) {
        throw createError('Invalid input data', 400);
      }

      const trackingData = validation.data;

      // Verificar que el ejercicio existe
      const exercise = await prisma.blockExercise.findUnique({
        where: { id: trackingData.exerciseId }
      });

      if (!exercise) {
        throw createError('Exercise not found', 404);
      }

      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: trackingData.userId }
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      // Verificar si ya existe tracking para este usuario y ejercicio
      const existingTracking = await prisma.exerciseTracking.findFirst({
        where: {
          exerciseId: trackingData.exerciseId,
          userId: trackingData.userId
        }
      });

      if (existingTracking) {
        throw createError('Tracking already exists for this user and exercise', 409);
      }

      const tracking = await prisma.exerciseTracking.create({
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
    } catch (error) {
      next(error);
    }
  }

  // Actualizar tracking
  static async updateTracking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validation = updateTrackingSchema.safeParse(req.body);

      if (!validation.success) {
        throw createError('Invalid input data', 400);
      }

      const tracking = await prisma.exerciseTracking.update({
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
    } catch (error) {
      next(error);
    }
  }

  // Eliminar tracking
  static async deleteTracking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.exerciseTracking.delete({
        where: { id }
      });

      res.json({ message: 'Tracking deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Marcar ejercicio como hecho
  static async markAsDone(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const tracking = await prisma.exerciseTracking.update({
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
    } catch (error) {
      next(error);
    }
  }

  // Obtener estadísticas de un usuario
  static async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const [totalTracking, completedTracking, plansCount] = await Promise.all([
        prisma.exerciseTracking.count({
          where: { userId }
        }),
        prisma.exerciseTracking.count({
          where: { 
            userId,
            done: true 
          }
        }),
        prisma.plan.count({
          where: { userId }
        })
      ]);

      const completionRate = totalTracking > 0 ? (completedTracking / totalTracking) * 100 : 0;

      // Obtener ejercicios recientes
      const recentExercises = await prisma.exerciseTracking.findMany({
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
    } catch (error) {
      next(error);
    }
  }
} 