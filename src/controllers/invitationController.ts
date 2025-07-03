import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { createError } from '../middlewares/errorHandler';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { EmailService } from '../services/email';

// Esquemas de validación
const inviteUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['user', 'trainer']).default('user'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  new: z.string().optional()
});

const completeRegistrationSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  profilePicture: z.string().url().optional()
});

export class InvitationController {
  // Invitar usuario (solo admin)
  static async inviteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = inviteUserSchema.safeParse(req.body);

      if (!validation.success) {
        throw createError('Invalid input data', 400);
      }

      const { email, role, name, phone, new: isNew} = validation.data;
      
      // Log para depuración
      console.log('✅ Valor recibido de "new":', isNew, '(tipo:', typeof isNew, ')');

      
      const adminId = req.user?.id;

      if (!adminId) {
        throw createError('Authentication required', 401);
      }

      // Verificar que el usuario es admin
      const admin = await prisma.user.findUnique({
        where: { id: adminId }
      });

      if (!admin || admin.role !== 'admin') {
        throw createError('Admin privileges required', 403);
      }

      // Verificar que el email no esté ya registrado
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw createError('User with this email already exists', 409);
      }

      // Verificar si ya hay una invitación pendiente
      const existingInvitation = await prisma.userInvitation.findFirst({
        where: { 
          email,
          usedAt: null,
          expiresAt: {
            gt: new Date()
          }
        }
      });

      if (existingInvitation) {
        throw createError('An active invitation already exists for this email', 409);
      }

      // Generar token único para la invitación
      const invitationToken = crypto.randomBytes(32).toString('hex');
      
      // Expiración en 7 días
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Crear invitación con datos adicionales
      const invitation = await prisma.userInvitation.create({
        data: {
          email,
          token: invitationToken,
          invitedBy: adminId,
          expiresAt,
          // Guardar datos adicionales en metadata (JSON)
          metadata: JSON.stringify({
            name,
            phone,
            role,
            new: isNew
          })
        },
        include: {
          inviter: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      // Log para verificar metadata guardado
      console.log('💾 Metadata guardado:', JSON.stringify({
        name,
        phone,
        role,
        new: isNew
      }));

      // Generar magic link con datos pre-cargados
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const magicLink = `${frontendUrl}/register?token=${invitationToken}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone || '')}&role=${role}&new=${isNew}`;
      
      // Log para verificar el link generado
      console.log('🔗 Link generado:', magicLink);
      console.log('🔗 Valor de "new" en el link:', isNew);

      // Enviar email con Resend
      const emailResult = await EmailService.sendInvitationEmail(
        email,
        magicLink,
        invitation.inviter.name,
        role
      );

      if (!emailResult.success) {
        console.error('Failed to send invitation email:', emailResult.error);
        // No fallamos la operación si el email falla, solo loggeamos
      }

      res.status(201).json({
        message: 'Invitation sent successfully',
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role,
          new: isNew,
          expiresAt: invitation.expiresAt,
          magicLink: process.env.NODE_ENV === 'development' ? magicLink : undefined, // Solo en desarrollo
          invitedBy: invitation.inviter.name,
          emailSent: emailResult.success
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Verificar token de invitación
  static async verifyInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;

      if (!token) {
        throw createError('Token is required', 400);
      }

      const invitation = await prisma.userInvitation.findUnique({
        where: { token },
        include: {
          inviter: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      if (!invitation) {
        throw createError('Invalid invitation token', 404);
      }

      if (invitation.usedAt) {
        throw createError('Invitation has already been used', 410);
      }

      if (invitation.expiresAt < new Date()) {
        throw createError('Invitation has expired', 410);
      }

      // Parsear metadata si existe
      let metadata = null;
      if (invitation.metadata) {
        try {
          metadata = JSON.parse(invitation.metadata);
        } catch (error) {
          console.error('Error parsing invitation metadata:', error);
        }
      }

      res.json({
        message: 'Invitation is valid',
        invitation: {
          email: invitation.email,
          invitedBy: invitation.inviter.name,
          expiresAt: invitation.expiresAt,
          metadata // Datos pre-cargados por el admin
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Completar registro con token de invitación
  static async completeRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = completeRegistrationSchema.safeParse(req.body);

      if (!validation.success) {
        throw createError('Invalid input data', 400);
      }

      const { token, password, profilePicture } = validation.data;

      // Verificar invitación
      const invitation = await prisma.userInvitation.findUnique({
        where: { token }
      });

      if (!invitation) {
        throw createError('Invalid invitation token', 404);
      }

      if (invitation.usedAt) {
        throw createError('Invitation has already been used', 410);
      }

      if (invitation.expiresAt < new Date()) {
        throw createError('Invitation has expired', 410);
      }

      // Verificar que el email no esté ya registrado
      const existingUser = await prisma.user.findUnique({
        where: { email: invitation.email }
      });

      if (existingUser) {
        throw createError('User with this email already exists', 409);
      }

      // Hash de la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Parsear metadata para obtener datos pre-cargados
      let metadata = null;
      if (invitation.metadata) {
        try {
          metadata = JSON.parse(invitation.metadata);
          
          // Log para depuración del metadata
          console.log('📋 Metadata parseado:', metadata);
          console.log('📋 Tipo de metadata.new:', typeof metadata.new, 'Valor:', metadata.new);
          
        } catch (error) {
          console.error('Error parsing invitation metadata:', error);
          throw createError('Invalid invitation data', 400);
        }
      }

      if (!metadata || !metadata.name) {
        throw createError('Invalid invitation data', 400);
      }

      // Transacción para crear usuario y marcar invitación como usada
      const result = await prisma.$transaction(async (tx) => {
        // Crear usuario con datos de metadata
        console.log('👤 Creando usuario con new:', metadata.new, '(tipo:', typeof metadata.new, ')');
        
        const user = await tx.user.create({
          data: {
            email: invitation.email,
            name: metadata.name,
            password: hashedPassword,
            role: metadata.role || 'user',
            phone: metadata.phone || null,
            new: metadata.new, // Siempre string
            profilePicture
          }
        });

        // Marcar invitación como usada
        await tx.userInvitation.update({
          where: { id: invitation.id },
          data: { usedAt: new Date() }
        });

        return user;
      });

      // Generar JWT para login automático
      const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
      const authToken = jwt.sign(
        {
          id: result.id,
          email: result.email,
          role: result.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Registration completed successfully',
        token: authToken,
        user: {
          id: result.id,
          name: result.name,
          email: result.email,
          role: result.role,
          phone: result.phone,
          new: result.new,
          profilePicture: result.profilePicture
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Listar invitaciones pendientes (solo admin)
  static async getPendingInvitations(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user?.id;

      if (!adminId) {
        throw createError('Authentication required', 401);
      }

      // Verificar que el usuario es admin
      const admin = await prisma.user.findUnique({
        where: { id: adminId }
      });

      if (!admin || admin.role !== 'admin') {
        throw createError('Admin privileges required', 403);
      }

      const invitations = await prisma.userInvitation.findMany({
        where: { 
          usedAt: null,
          expiresAt: {
            gt: new Date()
          }
        },
        include: {
          inviter: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        message: 'Pending invitations retrieved successfully',
        invitations: invitations.map(inv => ({
          id: inv.id,
          email: inv.email,
          invitedBy: inv.inviter.name,
          createdAt: inv.createdAt,
          expiresAt: inv.expiresAt
        })),
        total: invitations.length
      });
    } catch (error) {
      next(error);
    }
  }

  // Cancelar invitación (solo admin)
  static async cancelInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.user?.id;

      if (!adminId) {
        throw createError('Authentication required', 401);
      }

      // Verificar que el usuario es admin
      const admin = await prisma.user.findUnique({
        where: { id: adminId }
      });

      if (!admin || admin.role !== 'admin') {
        throw createError('Admin privileges required', 403);
      }

      // Eliminar invitación
      await prisma.userInvitation.delete({
        where: { 
          id,
          usedAt: null // Solo se pueden cancelar invitaciones no usadas
        }
      });

      res.json({
        message: 'Invitation cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  // Reenviar invitación (solo admin)
  static async resendInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.user?.id;

      if (!adminId) {
        throw createError('Authentication required', 401);
      }

      // Verificar que el usuario es admin
      const admin = await prisma.user.findUnique({
        where: { id: adminId }
      });

      if (!admin || admin.role !== 'admin') {
        throw createError('Admin privileges required', 403);
      }

      // Buscar invitación
      const invitation = await prisma.userInvitation.findUnique({
        where: { id },
        include: {
          inviter: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      if (!invitation) {
        throw createError('Invitation not found', 404);
      }

      if (invitation.usedAt) {
        throw createError('Cannot resend used invitation', 400);
      }

      // Generar nuevo token y extender expiración
      const newToken = crypto.randomBytes(32).toString('hex');
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);

      const updatedInvitation = await prisma.userInvitation.update({
        where: { id },
        data: {
          token: newToken,
          expiresAt: newExpiresAt
        }
      });

      // Generar nuevo magic link
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const magicLink = `${frontendUrl}/register?token=${newToken}`;

      // TODO: Enviar nuevo email con Resend
      console.log(`📧 New magic link for ${invitation.email}: ${magicLink}`);

      res.json({
        message: 'Invitation resent successfully',
        invitation: {
          id: updatedInvitation.id,
          email: invitation.email,
          newExpiresAt: updatedInvitation.expiresAt,
          magicLink // Solo para desarrollo
        }
      });
    } catch (error) {
      next(error);
    }
  }
} 