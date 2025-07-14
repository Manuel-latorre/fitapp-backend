import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { createError } from '../middlewares/errorHandler';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Esquemas de validación
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const generateTokenSchema = z.object({
  userId: z.string().uuid('Invalid user ID')
});

export class AuthController {
  // Login con email y contraseña
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = loginSchema.safeParse(req.body);

      if (!validation.success) {
        throw createError('Invalid input data', 400);
      }

      const { email, password } = validation.data;

      // Buscar usuario por email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw createError('Invalid email or password', 401);
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw createError('Invalid email or password', 401);
      }

      // Generar token JWT
      const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profilePicture: user.profilePicture
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Generar token para usuario específico (solo admin)
  static async generateToken(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = generateTokenSchema.safeParse(req.body);

      if (!validation.success) {
        throw createError('Invalid input data', 400);
      }

      const { userId } = validation.data;

      // Verificar que el usuario existe
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      // Generar token JWT
      const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Token generated successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Verificar token
  static async verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      // El middleware de auth ya verificó el token
      if (!req.user) {
        throw createError('Authentication required', 401);
      }

      // Obtener información actualizada del usuario
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({
        message: 'Token is valid',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profilePicture: user.profilePicture
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener información del usuario actual
  static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw createError('Authentication required', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          plans: {
            select: {
              id: true,
              title: true,
              description: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              plans: true
            }
          }
        }
      });

      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
          plans: user.plans,
          stats: {
            totalPlans: user._count.plans
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
} 