"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middlewares/errorHandler");
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
// Esquemas de validación
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    role: zod_1.z.enum(['user', 'trainer', 'admin']).default('user'),
    phone: zod_1.z.string().optional(),
    profilePicture: zod_1.z.string().url().optional()
});
const updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
    role: zod_1.z.enum(['user', 'trainer', 'admin']).optional(),
    phone: zod_1.z.string().optional(),
    profilePicture: zod_1.z.string().url().optional()
});
class UserController {
    // Obtener todos los usuarios (solo para admins)
    static async getAllUsers(req, res, next) {
        try {
            const users = await database_1.prisma.user.findMany({
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
        }
        catch (error) {
            next(error);
        }
    }
    // Obtener usuario por ID
    static async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await database_1.prisma.user.findUnique({
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
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            res.json({ user });
        }
        catch (error) {
            next(error);
        }
    }
    // Crear nuevo usuario
    static async createUser(req, res, next) {
        try {
            const validation = createUserSchema.safeParse(req.body);
            if (!validation.success) {
                throw (0, errorHandler_1.createError)('Invalid input data', 400);
            }
            const { password, ...userData } = validation.data;
            // Verificar que el email no esté en uso
            const existingUser = await database_1.prisma.user.findUnique({
                where: { email: userData.email }
            });
            if (existingUser) {
                throw (0, errorHandler_1.createError)('Email already in use', 409);
            }
            // Hash de la contraseña
            const saltRounds = 10;
            const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
            const user = await database_1.prisma.user.create({
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
        }
        catch (error) {
            next(error);
        }
    }
    // Actualizar usuario
    static async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const validation = updateUserSchema.safeParse(req.body);
            if (!validation.success) {
                throw (0, errorHandler_1.createError)('Invalid input data', 400);
            }
            const updateData = validation.data;
            // Si se está actualizando el email, verificar que no esté en uso
            if (updateData.email) {
                const existingUser = await database_1.prisma.user.findFirst({
                    where: {
                        email: updateData.email,
                        NOT: { id }
                    }
                });
                if (existingUser) {
                    throw (0, errorHandler_1.createError)('Email already in use', 409);
                }
            }
            const user = await database_1.prisma.user.update({
                where: { id },
                data: updateData
            });
            res.json({
                message: 'User updated successfully',
                user
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Eliminar usuario
    static async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            await database_1.prisma.user.delete({
                where: { id }
            });
            res.json({ message: 'User deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    // Obtener planes de un usuario
    static async getUserPlans(req, res, next) {
        try {
            const { id } = req.params;
            const user = await database_1.prisma.user.findUnique({
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
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            res.json({
                userId: user.id,
                userName: user.name,
                plans: user.plans
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=userController.js.map