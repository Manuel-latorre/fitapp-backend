import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { createError } from '../middlewares/errorHandler';
import { z } from 'zod';
import bcrypt from 'bcrypt';

// Esquemas de validación
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'trainer', 'admin']).default('user'),
  phone: z.string().optional(),
  profilePicture: z.string().url().optional()
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['user', 'trainer', 'admin']).optional(),
  phone: z.string().optional(),
  profilePicture: z.string().url().optional()
});

export class UserController {
  // Obtener todos los usuarios (solo para admins)
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          plans: {
            select: {
              id: true,
              title: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              plans: true,
              exerciseTracking: true
            }
          }
        }
      });

      res.json({ 
        users,
        total: users.length 
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener usuario por ID
  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          plans: {
            include: {
              sessions: {
                include: {
                  blocks: {
                    include: {
                      exercises: true
                    }
                  }
                }
              }
            }
          },
          _count: {
            select: {
              plans: true,
              exerciseTracking: true
            }
          }
        }
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  // Crear nuevo usuario
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = createUserSchema.safeParse(req.body);

      if (!validation.success) {
        throw createError('Invalid input data', 400);
      }

      const { password, ...userData } = validation.data;

      // Verificar que el email no esté en uso
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw createError('Email already in use', 409);
      }

      // Hash de la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword
        }
      });

      // No incluir password en la respuesta
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({ 
        message: 'User created successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar usuario
  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validation = updateUserSchema.safeParse(req.body);

      if (!validation.success) {
        throw createError('Invalid input data', 400);
      }

      const updateData = validation.data;

      // Si se está actualizando el email, verificar que no esté en uso
      if (updateData.email) {
        const existingUser = await prisma.user.findFirst({
          where: { 
            email: updateData.email,
            NOT: { id }
          }
        });

        if (existingUser) {
          throw createError('Email already in use', 409);
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData
      });

      res.json({ 
        message: 'User updated successfully',
        user 
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar usuario
  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id }
      });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Obtener planes de un usuario
  static async getUserPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          plans: {
            include: {
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
          }
        }
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({ 
        userId: user.id,
        userName: user.name,
        plans: user.plans 
      });
    } catch (error) {
      next(error);
    }
  }
}