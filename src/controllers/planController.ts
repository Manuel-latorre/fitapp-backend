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
  planId: z.string().uuid('Invalid plan ID'),
  sessionNumber: z.number().int().min(1).max(5),
  name: z.string().min(1, 'Session name is required')
});

const createBlockSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  title: z.string().min(1, 'Block title is required'),
  position: z.number().int().min(1)
});

const createExerciseSchema = z.object({
  blockId: z.string().uuid('Invalid block ID'),
  exerciseName: z.string().min(1, 'Exercise name is required'),
  series: z.number().int().min(1),
  reps: z.string().min(1, 'Reps specification is required'),
  rest: z.string().optional(),
  observations: z.string().optional()
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
          sessions: {
            include: {
              _count: {
                select: {
                  blocks: true
                }
              }
            },
            orderBy: { sessionNumber: 'asc' }
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
          sessions: {
            include: {
              blocks: {
                include: {
                  exercises: {
                    include: {
                      tracking: true
                    }
                  }
                },
                orderBy: { position: 'asc' }
              }
            },
            orderBy: { sessionNumber: 'asc' }
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

      // Verificar que el plan existe
      const plan = await prisma.plan.findUnique({
        where: { id: sessionData.planId }
      });

      if (!plan) {
        throw createError('Plan not found', 404);
      }

      // Verificar que no existe ya una sesión con el mismo número
      const existingSession = await prisma.planSession.findFirst({
        where: {
          planId: sessionData.planId,
          sessionNumber: sessionData.sessionNumber
        }
      });

      if (existingSession) {
        throw createError('Session number already exists for this plan', 409);
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
        data: blockData
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
        data: exerciseData
      });

      res.status(201).json({ 
        message: 'Exercise created successfully',
        exercise 
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