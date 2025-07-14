import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { createError } from '../middlewares/errorHandler';
import { z } from 'zod';

// Esquemas de validación
const createPlanSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional()
});

const updatePlanSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional()
});

const createSessionSchema = z.object({
  weekId: z.string().uuid('Invalid week ID'),
  sessionNumber: z.number().int().min(1).max(5),
  name: z.string().min(1, 'Session name is required')
});

const updateSessionSchema = z.object({
  sessionNumber: z.number().int().min(1).max(5).optional(),
  name: z.string().min(1, 'Session name is required').optional(),
  completed: z.boolean().optional()
});

const createBlockSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  title: z.string().min(1, 'Block title is required'),
  position: z.number().int().min(1),
  status: z.string().optional().default('pending')
});

const updateBlockSchema = z.object({
  title: z.string().min(1).optional(),
  position: z.number().int().min(1).optional(),
  status: z.string().optional()
});

const createExerciseSchema = z.object({
  blockId: z.string().uuid('Invalid block ID'),
  exerciseName: z.string().min(1, 'Exercise name is required'),
  series: z.number().int().min(1),
  reps: z.string().min(1, 'Reps specification is required'),
  kg: z.number().optional(),
  rest: z.string().optional(),
  observations: z.string().optional(),
  status: z.string().optional().default('pending'),
  link: z.string().optional()
});

const updateExerciseSchema = z.object({
  exerciseName: z.string().min(1).optional(),
  series: z.number().int().min(1).optional(),
  reps: z.string().min(1).optional(),
  kg: z.number().optional(),
  rest: z.string().optional(),
  observations: z.string().optional(),
  status: z.string().optional(),
  pse: z.string().optional(),
  rir: z.string().optional(),
  done: z.boolean().optional(),
  completedAt: z.date().optional().nullable(),
  link: z.string().optional()
});

export class PlanController {
  // Obtener todos los planes
  static async getAllPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await prisma.plan.findMany({
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
    } catch (error) {
      next(error);
    }
  }

  // Obtener plan por ID
  static async getPlanById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const plan = await prisma.plan.findUnique({
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
        throw createError('Plan not found', 404);
      }

      res.json({ plan });
    } catch (error) {
      next(error);
    }
  }

  // Crear nuevo plan
  static async createPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = createPlanSchema.safeParse(req.body);

      if (!validation.success) {
        throw createError('Invalid input data', 400);
      }

      const planData = validation.data;

      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: planData.userId }
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      const plan = await prisma.plan.create({
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
    } catch (error) {
      next(error);
    }
  }

  // Actualizar plan
  static async updatePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validation = updatePlanSchema.safeParse(req.body);

      if (!validation.success) {
        throw createError('Invalid input data', 400);
      }

      const plan = await prisma.plan.update({
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
    } catch (error) {
      next(error);
    }
  }

  // Eliminar plan
  static async deletePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.plan.delete({
        where: { id }
      });

      res.json({ message: 'Plan deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Crear sesión en un plan
  static async createSession(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = createSessionSchema.safeParse(req.body);

      if (!validation.success) {
        throw createError('Invalid input data', 400);
      }

      const sessionData = validation.data;

      // Verificar que la semana existe
      const week = await prisma.week.findUnique({
        where: { id: sessionData.weekId }
      });

      if (!week) {
        throw createError('Week not found', 404);
      }

      // Verificar que no existe ya una sesión con el mismo número
      const existingSession = await prisma.planSession.findFirst({
        where: {
          weekId: sessionData.weekId,
          sessionNumber: sessionData.sessionNumber
        }
      });

      if (existingSession) {
        throw createError('Session number already exists for this week', 409);
      }

      const session = await prisma.planSession.create({
        data: sessionData
      });

      res.status(201).json({ 
        message: 'Session created successfully',
        session 
      });
    } catch (error) {
      next(error);
    }
  }

  // Crear bloque en una sesión
  static async createBlock(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = createBlockSchema.safeParse(req.body);

      if (!validation.success) {
        throw createError('Invalid input data', 400);
      }

      const blockData = validation.data;

      // Verificar que la sesión existe
      const session = await prisma.planSession.findUnique({
        where: { id: blockData.sessionId }
      });

      if (!session) {
        throw createError('Session not found', 404);
      }

      const block = await prisma.sessionBlock.create({
        data: {
          ...blockData,
          status: blockData.status || 'pending'
        }
      });

      res.status(201).json({ 
        message: 'Block created successfully',
        block 
      });
    } catch (error) {
      next(error);
    }
  }

  // Crear ejercicio en un bloque
  static async createExercise(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = createExerciseSchema.safeParse(req.body);

      if (!validation.success) {
        throw createError('Invalid input data', 400);
      }

      const exerciseData = validation.data;

      // Verificar que el bloque existe
      const block = await prisma.sessionBlock.findUnique({
        where: { id: exerciseData.blockId }
      });

      if (!block) {
        throw createError('Block not found', 404);
      }

      const exercise = await prisma.blockExercise.create({
        data: {
          ...exerciseData,
          status: exerciseData.status || 'pending'
        }
      });

      res.status(201).json({ 
        message: 'Exercise created successfully',
        exercise 
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar ejercicio
  static async updateExercise(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validation = updateExerciseSchema.safeParse(req.body);

      if (!validation.success) {
        throw createError('Invalid input data', 400);
      }

      const { done, ...otherData } = validation.data;

      // Construir objeto de actualización
      const updateData: any = { ...otherData };

      // Si se marca como done=true, establecer completedAt
      if (done === true) {
        updateData.done = true;
        updateData.completedAt = new Date();
      } else if (done === false) {
        updateData.done = false;
        updateData.completedAt = null;
      }

      const exercise = await prisma.blockExercise.update({
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
    } catch (error) {
      next(error);
    }
  }

  // Eliminar ejercicio
  static async deleteExercise(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.blockExercise.delete({
        where: { id }
      });

      res.json({ message: 'Exercise deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar bloque
  static async updateBlock(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validation = updateBlockSchema.safeParse(req.body);

      if (!validation.success) {
        throw createError('Invalid input data', 400);
      }

      const block = await prisma.sessionBlock.update({
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
    } catch (error) {
      next(error);
    }
  }

  // Eliminar bloque
  static async deleteBlock(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.sessionBlock.delete({
        where: { id }
      });

      res.json({ message: 'Block deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar sesión
  static async updateSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validation = updateSessionSchema.safeParse(req.body);

      if (!validation.success) {
        throw createError('Invalid input data', 400);
      }

      const updateData = validation.data;

      // Si se quiere cambiar el número de sesión, verificar que no exista ya
      if (updateData.sessionNumber !== undefined) {
        // Obtener la sesión actual para conocer su weekId
        const currentSession = await prisma.planSession.findUnique({
          where: { id },
          select: { weekId: true }
        });

        if (!currentSession) {
          throw createError('Session not found', 404);
        }

        // Verificar que no exista otra sesión con el mismo número en la misma semana
        const existingSession = await prisma.planSession.findFirst({
          where: {
            sessionNumber: updateData.sessionNumber,
            weekId: currentSession.weekId,
            id: { not: id }
          }
        });

        if (existingSession) {
          throw createError('Session number already exists for this week', 409);
        }
      }

      const session = await prisma.planSession.update({
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
    } catch (error) {
      next(error);
    }
  }

  // Marcar sesión como completada
  static async completeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const session = await prisma.planSession.update({
        where: { id },
        data: { completed: true }
      });

      res.json({ 
        message: 'Session marked as completed',
        session 
      });
    } catch (error) {
      next(error);
    }
  }
} 