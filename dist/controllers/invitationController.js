"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationController = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middlewares/errorHandler");
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// Esquemas de validación
const inviteUserSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    role: zod_1.z.enum(['user', 'trainer']).default('user'),
    name: zod_1.z.string().min(1, 'Name is required').optional()
});
const completeRegistrationSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Token is required'),
    name: zod_1.z.string().min(1, 'Name is required'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    phone: zod_1.z.string().optional(),
    profilePicture: zod_1.z.string().url().optional()
});
class InvitationController {
    // Invitar usuario (solo admin)
    static async inviteUser(req, res, next) {
        try {
            const validation = inviteUserSchema.safeParse(req.body);
            if (!validation.success) {
                throw (0, errorHandler_1.createError)('Invalid input data', 400);
            }
            const { email, role, name } = validation.data;
            const adminId = req.user?.id;
            if (!adminId) {
                throw (0, errorHandler_1.createError)('Authentication required', 401);
            }
            // Verificar que el usuario es admin
            const admin = await database_1.prisma.user.findUnique({
                where: { id: adminId }
            });
            if (!admin || admin.role !== 'admin') {
                throw (0, errorHandler_1.createError)('Admin privileges required', 403);
            }
            // Verificar que el email no esté ya registrado
            const existingUser = await database_1.prisma.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                throw (0, errorHandler_1.createError)('User with this email already exists', 409);
            }
            // Verificar si ya hay una invitación pendiente
            const existingInvitation = await database_1.prisma.userInvitation.findFirst({
                where: {
                    email,
                    usedAt: null,
                    expiresAt: {
                        gt: new Date()
                    }
                }
            });
            if (existingInvitation) {
                throw (0, errorHandler_1.createError)('An active invitation already exists for this email', 409);
            }
            // Generar token único para la invitación
            const invitationToken = crypto_1.default.randomBytes(32).toString('hex');
            // Expiración en 7 días
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            // Crear invitación
            const invitation = await database_1.prisma.userInvitation.create({
                data: {
                    email,
                    token: invitationToken,
                    invitedBy: adminId,
                    expiresAt
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
            // Generar magic link
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const magicLink = `${frontendUrl}/register?token=${invitationToken}`;
            // TODO: Enviar email con Resend (lo implementaremos después)
            console.log(`📧 Magic link for ${email}: ${magicLink}`);
            res.status(201).json({
                message: 'Invitation sent successfully',
                invitation: {
                    id: invitation.id,
                    email: invitation.email,
                    role,
                    expiresAt: invitation.expiresAt,
                    magicLink, // Solo para desarrollo
                    invitedBy: invitation.inviter.name
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Verificar token de invitación
    static async verifyInvitation(req, res, next) {
        try {
            const { token } = req.params;
            if (!token) {
                throw (0, errorHandler_1.createError)('Token is required', 400);
            }
            const invitation = await database_1.prisma.userInvitation.findUnique({
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
                throw (0, errorHandler_1.createError)('Invalid invitation token', 404);
            }
            if (invitation.usedAt) {
                throw (0, errorHandler_1.createError)('Invitation has already been used', 410);
            }
            if (invitation.expiresAt < new Date()) {
                throw (0, errorHandler_1.createError)('Invitation has expired', 410);
            }
            res.json({
                message: 'Invitation is valid',
                invitation: {
                    email: invitation.email,
                    invitedBy: invitation.inviter.name,
                    expiresAt: invitation.expiresAt
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Completar registro con token de invitación
    static async completeRegistration(req, res, next) {
        try {
            const validation = completeRegistrationSchema.safeParse(req.body);
            if (!validation.success) {
                throw (0, errorHandler_1.createError)('Invalid input data', 400);
            }
            const { token, name, password, phone, profilePicture } = validation.data;
            // Verificar invitación
            const invitation = await database_1.prisma.userInvitation.findUnique({
                where: { token }
            });
            if (!invitation) {
                throw (0, errorHandler_1.createError)('Invalid invitation token', 404);
            }
            if (invitation.usedAt) {
                throw (0, errorHandler_1.createError)('Invitation has already been used', 410);
            }
            if (invitation.expiresAt < new Date()) {
                throw (0, errorHandler_1.createError)('Invitation has expired', 410);
            }
            // Verificar que el email no esté ya registrado
            const existingUser = await database_1.prisma.user.findUnique({
                where: { email: invitation.email }
            });
            if (existingUser) {
                throw (0, errorHandler_1.createError)('User with this email already exists', 409);
            }
            // Hash de la contraseña
            const saltRounds = 10;
            const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
            // Transacción para crear usuario y marcar invitación como usada
            const result = await database_1.prisma.$transaction(async (tx) => {
                // Crear usuario
                const user = await tx.user.create({
                    data: {
                        email: invitation.email,
                        name,
                        password: hashedPassword,
                        role: 'user', // Por defecto, puede ser configurado según la invitación
                        phone,
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
            const authToken = jsonwebtoken_1.default.sign({
                id: result.id,
                email: result.email,
                role: result.role
            }, JWT_SECRET, { expiresIn: '24h' });
            res.status(201).json({
                message: 'Registration completed successfully',
                token: authToken,
                user: {
                    id: result.id,
                    name: result.name,
                    email: result.email,
                    role: result.role,
                    phone: result.phone,
                    profilePicture: result.profilePicture
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Listar invitaciones pendientes (solo admin)
    static async getPendingInvitations(req, res, next) {
        try {
            const adminId = req.user?.id;
            if (!adminId) {
                throw (0, errorHandler_1.createError)('Authentication required', 401);
            }
            // Verificar que el usuario es admin
            const admin = await database_1.prisma.user.findUnique({
                where: { id: adminId }
            });
            if (!admin || admin.role !== 'admin') {
                throw (0, errorHandler_1.createError)('Admin privileges required', 403);
            }
            const invitations = await database_1.prisma.userInvitation.findMany({
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
        }
        catch (error) {
            next(error);
        }
    }
    // Cancelar invitación (solo admin)
    static async cancelInvitation(req, res, next) {
        try {
            const { id } = req.params;
            const adminId = req.user?.id;
            if (!adminId) {
                throw (0, errorHandler_1.createError)('Authentication required', 401);
            }
            // Verificar que el usuario es admin
            const admin = await database_1.prisma.user.findUnique({
                where: { id: adminId }
            });
            if (!admin || admin.role !== 'admin') {
                throw (0, errorHandler_1.createError)('Admin privileges required', 403);
            }
            // Eliminar invitación
            await database_1.prisma.userInvitation.delete({
                where: {
                    id,
                    usedAt: null // Solo se pueden cancelar invitaciones no usadas
                }
            });
            res.json({
                message: 'Invitation cancelled successfully'
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Reenviar invitación (solo admin)
    static async resendInvitation(req, res, next) {
        try {
            const { id } = req.params;
            const adminId = req.user?.id;
            if (!adminId) {
                throw (0, errorHandler_1.createError)('Authentication required', 401);
            }
            // Verificar que el usuario es admin
            const admin = await database_1.prisma.user.findUnique({
                where: { id: adminId }
            });
            if (!admin || admin.role !== 'admin') {
                throw (0, errorHandler_1.createError)('Admin privileges required', 403);
            }
            // Buscar invitación
            const invitation = await database_1.prisma.userInvitation.findUnique({
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
                throw (0, errorHandler_1.createError)('Invitation not found', 404);
            }
            if (invitation.usedAt) {
                throw (0, errorHandler_1.createError)('Cannot resend used invitation', 400);
            }
            // Generar nuevo token y extender expiración
            const newToken = crypto_1.default.randomBytes(32).toString('hex');
            const newExpiresAt = new Date();
            newExpiresAt.setDate(newExpiresAt.getDate() + 7);
            const updatedInvitation = await database_1.prisma.userInvitation.update({
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
        }
        catch (error) {
            next(error);
        }
    }
}
exports.InvitationController = InvitationController;
//# sourceMappingURL=invitationController.js.map