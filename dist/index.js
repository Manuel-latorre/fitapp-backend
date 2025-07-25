"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("./middlewares/errorHandler");
const database_1 = require("./config/database");
const index_1 = __importDefault(require("./routes/index"));
const swagger_1 = require("./config/swagger");
// Cargar variables de entorno
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware de seguridad
app.use((0, helmet_1.default)());
// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', // Vite frontend
    'http://localhost:5174', // Vite preview
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL, // Frontend configurado
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permitir requests sin origin (como aplicaciones móviles o Postman)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Swagger Documentation
app.use('/api-docs', swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'FitApp API Documentation',
    explorer: true
}));
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Verificar el estado del servidor
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                 message:
 *                   type: string
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        message: 'FitApp Backend API is running'
    });
});
// Routes
app.use('/api', index_1.default);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        availableRoutes: [
            'GET /health - Health check',
            'GET /api - Main API routes'
        ]
    });
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// Start server with database initialization
const startServer = async () => {
    try {
        console.log('🔄 Initializing database connection...');
        await (0, database_1.initializeDatabase)();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
            console.log(`📋 API Base URL: http://localhost:${PORT}/api`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map