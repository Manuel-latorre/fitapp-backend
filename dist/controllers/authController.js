"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const database_1 = require("../config/database");
const errorHandler_1 = require("../middlewares/errorHandler");
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// Esquemas de validación
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters')
});
const generateTokenSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid('Invalid user ID')
});
class AuthController {
    // Login con email y contraseña
    static async login(req, res, next) {
        try {
            const validation = loginSchema.safeParse(req.body);
            if (!validation.success) {
                throw (0, errorHandler_1.createError)('Invalid input data', 400);
            }
            const { email, password } = validation.data;
            // Buscar usuario por email
            const user = await database_1.prisma.user.findUnique({
                where: { email }
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('Invalid email or password', 401);
            }
            // Verificar contraseña
            const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                throw (0, errorHandler_1.createError)('Invalid email or password', 401);
            }
            // Generar token JWT
            const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                email: user.email,
                role: user.role
            }, JWT_SECRET, { expiresIn: '24h' });
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
        }
        catch (error) {
            next(error);
        }
    }
    // Generar token para usuario específico (solo admin)
    static async generateToken(req, res, next) {
        try {
            const validation = generateTokenSchema.safeParse(req.body);
            if (!validation.success) {
                throw (0, errorHandler_1.createError)('Invalid input data', 400);
            }
            const { userId } = validation.data;
            // Verificar que el usuario existe
            const user = await database_1.prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            // Generar token JWT
            const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                email: user.email,
                role: user.role
            }, JWT_SECRET, { expiresIn: '24h' });
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
        }
        catch (error) {
            next(error);
        }
    }
    // Verificar token
    static async verifyToken(req, res, next) {
        try {
            // El middleware de auth ya verificó el token
            if (!req.user) {
                throw (0, errorHandler_1.createError)('Authentication required', 401);
            }
            // Obtener información actualizada del usuario
            const user = await database_1.prisma.user.findUnique({
                where: { id: req.user.id }
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('User not found', 404);
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
        }
        catch (error) {
            next(error);
        }
    }
    // Obtener información del usuario actual
    static async getCurrentUser(req, res, next) {
        try {
            if (!req.user) {
                throw (0, errorHandler_1.createError)('Authentication required', 401);
            }
            const user = await database_1.prisma.user.findUnique({
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
                            plans: true,
                            exerciseTracking: true
                        }
                    }
                }
            });
            if (!user) {
                throw (0, errorHandler_1.createError)('User not found', 404);
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
                        totalPlans: user._count.plans,
                        totalTracking: user._count.exerciseTracking
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map