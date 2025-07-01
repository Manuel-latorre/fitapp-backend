"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTrainerOrAdmin = exports.requireAdmin = exports.requireRole = exports.optionalAuthMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware de autenticación simple con JWT
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Please provide a valid authentication token'
        });
    }
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    try {
        const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired token'
        });
    }
};
exports.authMiddleware = authMiddleware;
// Middleware opcional para rutas que pueden funcionar con o sin autenticación
const optionalAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }
    // Si hay token, usar el middleware de autenticación requerida
    return (0, exports.authMiddleware)(req, res, next);
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
// Middleware para verificar roles específicos
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
// Middleware para verificar que es admin
exports.requireAdmin = (0, exports.requireRole)(['admin']);
// Middleware para verificar que es trainer o admin
exports.requireTrainerOrAdmin = (0, exports.requireRole)(['trainer', 'admin']);
//# sourceMappingURL=auth.js.map