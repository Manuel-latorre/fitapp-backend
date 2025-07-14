import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { createError } from '../middlewares/errorHandler';
import { z } from 'zod';

// Esquemas de validación
const createWeekSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
  title: z.string().min(1, 'Title is required')
});

const updateWeekSchema = z.object({
  title: z.string().min(1).optional()
});

export class WeekController {
  // Obtener todas las semanas de un plan
  static async getWeeksByPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { planId } = req.params;

      const weeks = await prisma.week.findMany({
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
    } catch (error) {
      next(error);
    }
  }

  // Obtener semana por ID
  static async getWeekById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const week = await prisma.week.findUnique({
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
        throw createError('Week not found', 404);
      }

      res.json({ week });
    } catch (error) {
      next(error);
    }
  }

  // Crear nueva semana
  static async createWeek(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = createWeekSchema.safeParse(req.body);

      if (!validation.success) {
        throw createError('Invalid input data', 400);
      }

      const weekData = validation.data;

      // Verificar que el plan existe
      const plan = await prisma.plan.findUnique({
        where: { id: weekData.planId }
      });

      if (!plan) {
        throw createError('Plan not found', 404);
      }

      const week = await prisma.week.create({
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
    } catch (error) {
      next(error);
    }
  }

  // Actualizar semana
  static async updateWeek(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validation = updateWeekSchema.safeParse(req.body);

      if (!validation.success) {
        throw createError('Invalid input data', 400);
      }

      const week = await prisma.week.update({
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
    } catch (error) {
      next(error);
    }
  }

  // Eliminar semana
  static async deleteWeek(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.week.delete({
        where: { id }
      });

      res.json({ message: 'Week deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
} 