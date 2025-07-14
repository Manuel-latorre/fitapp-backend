"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const userController_1 = require("../controllers/userController");
const planController_1 = require("../controllers/planController");
const weekController_1 = require("../controllers/weekController");
const authController_1 = require("../controllers/authController");
const invitationController_1 = require("../controllers/invitationController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /:
 *   get:
 *     summary: API Information
 *     description: Información general de la API y enlaces a la documentación
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Información de la API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 version:
 *                   type: string
 *                 documentation:
 *                   type: object
 *                 swaggerDocs:
 *                   type: string
 */
router.get('/', (req, res, next) => {
    res.json({
        message: 'FitApp Backend API',
        version: '1.0.0',
        swaggerDocs: `${req.protocol}://${req.get('host')}/api-docs`,
        documentation: {
            auth: 'POST /auth/login, POST /auth/verify, GET /auth/me',
            invitations: 'POST /invitations/invite (admin), GET /invitations/verify/:token, POST /invitations/complete',
            users: 'GET/POST /users, GET/PUT/DELETE /users/:id',
            plans: 'GET/POST /plans, GET/PUT/DELETE /plans/:id',
            weeks: 'GET /plans/:planId/weeks, POST /weeks, GET/PUT/DELETE /weeks/:id',
            exercises: 'POST /exercises, PUT/DELETE /exercises/:id (tracking integrado)'
        }
    });
});
// ===== RUTAS DE AUTENTICACIÓN =====
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login de usuario
 *     description: Autenticar usuario con email y obtener JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@fitapp.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: admin123
 *           examples:
 *             admin:
 *               summary: Login como administrador
 *               value:
 *                 email: admin@fitapp.com
 *                 password: admin123
 *             usuario_normal:
 *               summary: Login como usuario normal
 *               value:
 *                 email: juan.perez@email.com
 *                 password: micontraseña123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             examples:
 *               admin_success:
 *                 summary: Login exitoso de administrador
 *                 value:
 *                   message: "Login exitoso"
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   user:
 *                     id: "admin-uuid-123"
 *                     name: "Administrator"
 *                     email: "admin@fitapp.com"
 *                     role: "admin"
 *                     phone: null
 *                     profilePicture: null
 *                     createdAt: "2024-01-01T12:00:00.000Z"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               user_not_found:
 *                 summary: Usuario no encontrado
 *                 value:
 *                   error: "NotFound"
 *                   message: "Usuario no encontrado"
 *                   details: []
 */
router.post('/auth/login', authController_1.AuthController.login);
/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verificar token JWT
 *     description: Verificar la validez del token JWT actual
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/auth/verify', auth_1.authMiddleware, authController_1.AuthController.verifyToken);
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtener usuario actual
 *     description: Obtener información completa del usuario autenticado
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   allOf:
 *                     - $ref: '#/components/schemas/User'
 *                     - type: object
 *                       properties:
 *                         plans:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Plan'
 *                         stats:
 *                           type: object
 *                           properties:
 *                             totalPlans:
 *                               type: integer
 *                             totalTracking:
 *                               type: integer
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/auth/me', auth_1.authMiddleware, authController_1.AuthController.getCurrentUser);
/**
 * @swagger
 * /auth/generate-token:
 *   post:
 *     summary: Generar token para usuario (Solo Admin)
 *     description: Generar un token JWT para un usuario específico
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Token generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       403:
 *         description: Permisos insuficientes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/auth/generate-token', auth_1.requireAdmin, authController_1.AuthController.generateToken);
// ===== RUTAS DE INVITACIONES =====
/**
 * @swagger
 * /invitations/invite:
 *   post:
 *     summary: Invitar usuario (Solo Admin)
 *     description: |
 *       Enviar invitación por email a un nuevo usuario con datos pre-cargados.
 *
 *       **Características:**
 *       - El admin puede pre-cargar nombre, teléfono y rol
 *       - Se envía un email profesional con magic link
 *       - El usuario solo necesita crear su contraseña
 *       - Los datos pre-cargados se incluyen en la URL del magic link
 *       - Expiración automática en 7 días
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nuevo@usuario.com
 *               name:
 *                 type: string
 *                 example: María López
 *               phone:
 *                 type: string
 *                 example: "+34 622 333 444"
 *               role:
 *                 type: string
 *                 enum: [user, trainer]
 *                 default: user
 *                 example: user
 *           examples:
 *             nuevo_usuario:
 *               summary: Invitar nuevo usuario
 *               value:
 *                 email: "maria.lopez@email.com"
 *                 name: "María López"
 *                 phone: "+34 622 333 444"
 *                 role: "user"
 *             nuevo_entrenador:
 *               summary: Invitar nuevo entrenador
 *               value:
 *                 email: "carlos.trainer@fitgym.com"
 *                 name: "Carlos Trainer"
 *                 phone: "+34 611 222 333"
 *                 role: "trainer"
 *     responses:
 *       201:
 *         description: Invitación enviada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invitation sent successfully"
 *                 invitation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                       enum: [user, trainer]
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                     invitedBy:
 *                       type: string
 *                     emailSent:
 *                       type: boolean
 *                       description: Indica si el email se envió correctamente
 *                 magicLink:
 *                   type: string
 *                   description: URL del magic link (solo en desarrollo)
 *                   example: "http://localhost:5173/register?token=abc123&name=María%20López&phone=%2B34%20622%20333%20444&role=user"
 *             examples:
 *               invitation_sent:
 *                 summary: Invitación enviada exitosamente
 *                 value:
 *                   message: "Invitation sent successfully"
 *                   invitation:
 *                     id: "bb0e8400-e29b-41d4-a716-446655440006"
 *                     email: "maria.lopez@email.com"
 *                     role: "user"
 *                     expiresAt: "2024-01-08T12:00:00.000Z"
 *                     invitedBy: "Administrator"
 *                     emailSent: true
 *                   magicLink: "http://localhost:5173/register?token=inv_maria_xyz789&name=María%20López&phone=%2B34%20622%20333%20444&role=user"
 *       400:
 *         description: Datos inválidos o email ya invitado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalid_data:
 *                 summary: Datos de entrada inválidos
 *                 value:
 *                   error: "BadRequest"
 *                   message: "Invalid input data"
 *                   details: [
 *                     {
 *                       field: "name",
 *                       message: "Name is required"
 *                     }
 *                   ]
 *               already_invited:
 *                 summary: Email ya invitado
 *                 value:
 *                   error: "BadRequest"
 *                   message: "An active invitation already exists for this email"
 *                   details: []
 *               user_exists:
 *                 summary: Usuario ya existe
 *                 value:
 *                   error: "BadRequest"
 *                   message: "User with this email already exists"
 *                   details: []
 *       403:
 *         description: Permisos insuficientes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               insufficient_permissions:
 *                 summary: No es administrador
 *                 value:
 *                   error: "Forbidden"
 *                   message: "Acceso denegado. Se requieren permisos de administrador"
 *                   details: []
 */
router.post('/invitations/invite', auth_1.authMiddleware, auth_1.requireAdmin, invitationController_1.InvitationController.inviteUser);
/**
 * @swagger
 * /invitations/verify/{token}:
 *   get:
 *     summary: Verificar token de invitación
 *     description: |
 *       Verificar la validez de un token de invitación y obtener datos pre-cargados.
 *
 *       **Devuelve:**
 *       - Estado de la invitación (válida/expirada/usada)
 *       - Datos pre-cargados por el admin (nombre, teléfono, rol)
 *       - Información del admin que envió la invitación
 *     tags: [Invitations]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token único de invitación
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invitation is valid"
 *                 invitation:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       format: email
 *                     invitedBy:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                     metadata:
 *                       type: object
 *                       description: Datos pre-cargados por el admin
 *                       properties:
 *                         name:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         role:
 *                           type: string
 *                           enum: [user, trainer]
 *             examples:
 *               valid_invitation:
 *                 summary: Invitación válida con datos pre-cargados
 *                 value:
 *                   message: "Invitation is valid"
 *                   invitation:
 *                     email: "maria.lopez@email.com"
 *                     invitedBy: "Administrator"
 *                     expiresAt: "2024-01-08T12:00:00.000Z"
 *                     metadata:
 *                       name: "María López"
 *                       phone: "+34 622 333 444"
 *                       role: "user"
 *       400:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalid_token:
 *                 summary: Token inválido
 *                 value:
 *                   error: "NotFound"
 *                   message: "Invalid invitation token"
 *                   details: []
 *               expired_token:
 *                 summary: Token expirado
 *                 value:
 *                   error: "Gone"
 *                   message: "Invitation has expired"
 *                   details: []
 *               used_token:
 *                 summary: Token ya usado
 *                 value:
 *                   error: "Gone"
 *                   message: "Invitation has already been used"
 *                   details: []
 */
router.get('/invitations/verify/:token', invitationController_1.InvitationController.verifyInvitation);
/**
 * @swagger
 * /invitations/complete:
 *   post:
 *     summary: Completar registro con invitación
 *     description: |
 *       Completar el registro de usuario usando un token de invitación válido.
 *
 *       **Nota:** El usuario solo necesita proporcionar su contraseña.
 *       Los datos como nombre, teléfono y rol ya están pre-cargados
 *       por el administrador en la invitación.
 *     tags: [Invitations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 example: inv_maria_xyz789
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: micontraseña123
 *               profilePicture:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 example: "https://example.com/maria-profile.jpg"
 *           examples:
 *             registro_completo:
 *               summary: Registro con contraseña y foto de perfil
 *               value:
 *                 token: "inv_maria_xyz789"
 *                 password: "micontraseña123"
 *                 profilePicture: "https://example.com/maria-profile.jpg"
 *             registro_basico:
 *               summary: Registro solo con contraseña
 *               value:
 *                 token: "inv_carlos_abc123"
 *                 password: "entrenador456"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *             examples:
 *               registration_success:
 *                 summary: Registro completado exitosamente
 *                 value:
 *                   message: "Usuario registrado exitosamente"
 *                   user:
 *                     id: "cc0e8400-e29b-41d4-a716-446655440007"
 *                     name: "María López"
 *                     email: "maria.lopez@email.com"
 *                     role: "user"
 *                     phone: "+34 622 333 444"
 *                     profilePicture: "https://example.com/maria-profile.jpg"
 *                     createdAt: "2024-01-01T12:30:00.000Z"
 *                   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjYzBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDciLCJlbWFpbCI6Im1hcmlhLmxvcGV6QGVtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjQ2MzY0MDAwLCJleHAiOjE2NDY0NTA0MDB9.abc123def456"
 *       400:
 *         description: Token inválido o datos incorrectos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalid_token:
 *                 summary: Token de invitación inválido o expirado
 *                 value:
 *                   error: "BadRequest"
 *                   message: "Token de invitación inválido o expirado"
 *                   details: []
 *               validation_error:
 *                 summary: Datos de validación incorrectos
 *                 value:
 *                   error: "ValidationError"
 *                   message: "Los datos proporcionados no son válidos"
 *                   details: [
 *                     {
 *                       field: "name",
 *                       message: "El nombre es requerido"
 *                     }
 *                   ]
 */
router.post('/invitations/complete', invitationController_1.InvitationController.completeRegistration);
/**
 * @swagger
 * /invitations/pending:
 *   get:
 *     summary: Obtener invitaciones pendientes (Solo Admin)
 *     description: Listar todas las invitaciones pendientes no utilizadas
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de invitaciones pendientes
 *       403:
 *         description: Permisos insuficientes
 */
/**
 * @swagger
 * /invitations/pending:
 *   get:
 *     summary: Obtener invitaciones pendientes
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de invitaciones pendientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserInvitation'
 *       401:
 *         description: No autorizado (requiere admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/invitations/pending', auth_1.authMiddleware, auth_1.requireAdmin, invitationController_1.InvitationController.getPendingInvitations);
/**
 * @swagger
 * /invitations/{id}:
 *   delete:
 *     summary: Cancelar invitación
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "aa0e8400-e29b-41d4-a716-446655440005"
 *     responses:
 *       200:
 *         description: Invitación cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invitación cancelada exitosamente"
 *       404:
 *         description: Invitación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado (requiere admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/invitations/:id', auth_1.authMiddleware, auth_1.requireAdmin, invitationController_1.InvitationController.cancelInvitation);
/**
 * @swagger
 * /invitations/{id}/resend:
 *   post:
 *     summary: Reenviar invitación
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "aa0e8400-e29b-41d4-a716-446655440005"
 *     responses:
 *       200:
 *         description: Invitación reenviada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invitación reenviada exitosamente"
 *                 invitation:
 *                   $ref: '#/components/schemas/UserInvitation'
 *       404:
 *         description: Invitación no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado (requiere admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/invitations/:id/resend', auth_1.authMiddleware, auth_1.requireAdmin, invitationController_1.InvitationController.resendInvitation);
// ===== RUTAS DE USUARIOS =====
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *             examples:
 *               users_list:
 *                 summary: Lista de usuarios del sistema
 *                 value:
 *                   - id: "admin-uuid-123"
 *                     name: "Administrator"
 *                     email: "admin@fitapp.com"
 *                     role: "admin"
 *                     phone: null
 *                     profilePicture: null
 *                     createdAt: "2024-01-01T10:00:00.000Z"
 *                   - id: "123e4567-e89b-12d3-a456-426614174000"
 *                     name: "Juan Pérez"
 *                     email: "juan.perez@email.com"
 *                     role: "user"
 *                     phone: "+34 600 123 456"
 *                     profilePicture: "https://example.com/profile.jpg"
 *                     createdAt: "2024-01-01T12:00:00.000Z"
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *           examples:
 *             nuevo_usuario:
 *               summary: Crear usuario normal
 *               value:
 *                 name: "Pedro Martínez"
 *                 email: "pedro.martinez@email.com"
 *                 role: "user"
 *                 phone: "+34 655 777 888"
 *                 profilePicture: "https://example.com/pedro-profile.jpg"
 *             nuevo_entrenador:
 *               summary: Crear entrenador
 *               value:
 *                 name: "Laura Fitness"
 *                 email: "laura@fitnesscenter.com"
 *                 role: "trainer"
 *                 phone: "+34 677 888 999"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             examples:
 *               user_created:
 *                 summary: Usuario creado exitosamente
 *                 value:
 *                   message: "Usuario creado exitosamente"
 *                   user:
 *                     id: "dd0e8400-e29b-41d4-a716-446655440008"
 *                     name: "Pedro Martínez"
 *                     email: "pedro.martinez@email.com"
 *                     role: "user"
 *                     phone: "+34 655 777 888"
 *                     profilePicture: "https://example.com/pedro-profile.jpg"
 *                     createdAt: "2024-01-01T13:00:00.000Z"
 */
router.get('/users', userController_1.UserController.getAllUsers);
router.post('/users', userController_1.UserController.createUser);
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Información del usuario
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Usuario eliminado
 */
router.get('/users/:id', userController_1.UserController.getUserById);
router.put('/users/:id', userController_1.UserController.updateUser);
router.delete('/users/:id', userController_1.UserController.deleteUser);
/**
 * @swagger
 * /users/{id}/plans:
 *   get:
 *     summary: Obtener planes de un usuario
 *     description: |
 *       Obtiene todos los planes de entrenamiento asociados a un usuario específico.
 *       Incluye información completa de cada plan con sus sesiones, bloques y ejercicios.
 *
 *       **Características:**
 *       - Planes ordenados por fecha de creación (más recientes primero)
 *       - Sesiones ordenadas por número de sesión
 *       - Bloques ordenados por posición
 *       - Incluye información completa de ejercicios con tracking
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Planes del usuario obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                 userName:
 *                   type: string
 *                 plans:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       sessions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                             sessionNumber:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             completed:
 *                               type: boolean
 *                             blocks:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                     format: uuid
 *                                   title:
 *                                     type: string
 *                                   position:
 *                                     type: integer
 *                                   status:
 *                                     type: string
 *                                   exercises:
 *                                     type: array
 *                                     items:
 *                                       type: object
 *                                       properties:
 *                                         id:
 *                                           type: string
 *                                           format: uuid
 *                                         exerciseName:
 *                                           type: string
 *                                         series:
 *                                           type: integer
 *                                         reps:
 *                                           type: string
 *                                         kg:
 *                                           type: number
 *                                           nullable: true
 *                                         rest:
 *                                           type: string
 *                                           nullable: true
 *                                         observations:
 *                                           type: string
 *                                           nullable: true
 *                                         status:
 *                                           type: string
 *                                         pse:
 *                                           type: string
 *                                           nullable: true
 *                                         rir:
 *                                           type: string
 *                                           nullable: true
 *                                         done:
 *                                           type: boolean
 *                                         completedAt:
 *                                           type: string
 *                                           format: date-time
 *                                           nullable: true
 *             examples:
 *               usuario_con_planes:
 *                 summary: Usuario con múltiples planes
 *                 value:
 *                   userId: "123e4567-e89b-12d3-a456-426614174000"
 *                   userName: "Juan Pérez"
 *                   plans:
 *                     - id: "550e8400-e29b-41d4-a716-446655440000"
 *                       userId: "123e4567-e89b-12d3-a456-426614174000"
 *                       title: "Plan de Fuerza - Semana 1"
 *                       description: "Plan enfocado en desarrollo de fuerza básica con ejercicios compuestos"
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       sessions:
 *                         - id: "660e8400-e29b-41d4-a716-446655440001"
 *                           sessionNumber: 1
 *                           name: "Tren Superior"
 *                           completed: false
 *                           blocks:
 *                             - id: "770e8400-e29b-41d4-a716-446655440002"
 *                               title: "Calentamiento"
 *                               position: 1
 *                               status: "pending"
 *                               exercises:
 *                                 - id: "880e8400-e29b-41d4-a716-446655440003"
 *                                   exerciseName: "Movilidad de hombros"
 *                                   series: 2
 *                                   reps: "10-15"
 *                                   kg: null
 *                                   rest: "30s"
 *                                   observations: "Movimientos controlados"
 *                                   status: "pending"
 *                                   pse: null
 *                                   rir: null
 *                                   done: false
 *                                   completedAt: null
 *                             - id: "770e8400-e29b-41d4-a716-446655440004"
 *                               title: "Ejercicios Principales"
 *                               position: 2
 *                               status: "pending"
 *                               exercises:
 *                                 - id: "880e8400-e29b-41d4-a716-446655440005"
 *                                   exerciseName: "Press de Banca"
 *                                   series: 4
 *                                   reps: "6-8"
 *                                   kg: 80
 *                                   rest: "3min"
 *                                   observations: "Controlar la fase excéntrica"
 *                                   status: "completed"
 *                                   pse: "7"
 *                                   rir: "2"
 *                                   done: true
 *                                   completedAt: "2024-01-15T11:45:00.000Z"
 *                                 - id: "880e8400-e29b-41d4-a716-446655440006"
 *                                   exerciseName: "Remo con Barra"
 *                                   series: 4
 *                                   reps: "8-10"
 *                                   kg: 70
 *                                   rest: "2min"
 *                                   observations: "Mantener la espalda recta"
 *                                   status: "pending"
 *                                   pse: null
 *                                   rir: null
 *                                   done: false
 *                                   completedAt: null
 *                         - id: "660e8400-e29b-41d4-a716-446655440007"
 *                           sessionNumber: 2
 *                           name: "Tren Inferior"
 *                           completed: false
 *                           blocks:
 *                             - id: "770e8400-e29b-41d4-a716-446655440008"
 *                               title: "Ejercicios Principales"
 *                               position: 1
 *                               status: "pending"
 *                               exercises:
 *                                 - id: "880e8400-e29b-41d4-a716-446655440009"
 *                                   exerciseName: "Sentadilla"
 *                                   series: 4
 *                                   reps: "8-12"
 *                                   kg: 100
 *                                   rest: "3min"
 *                                   observations: "Profundidad completa"
 *                                   status: "pending"
 *                                   pse: null
 *                                   rir: null
 *                                   done: false
 *                                   completedAt: null
 *                     - id: "551e8400-e29b-41d4-a716-446655440010"
 *                       userId: "123e4567-e89b-12d3-a456-426614174000"
 *                       title: "Plan de Hipertrofia - Semana 2"
 *                       description: "Plan enfocado en hipertrofia muscular con mayor volumen"
 *                       createdAt: "2024-01-10T09:00:00.000Z"
 *                       sessions:
 *                         - id: "660e8400-e29b-41d4-a716-446655440011"
 *                           sessionNumber: 1
 *                           name: "Push"
 *                           completed: true
 *                           blocks:
 *                             - id: "770e8400-e29b-41d4-a716-446655440012"
 *                               title: "Pectorales"
 *                               position: 1
 *                               status: "completed"
 *                               exercises:
 *                                 - id: "880e8400-e29b-41d4-a716-446655440013"
 *                                   exerciseName: "Press Inclinado"
 *                                   series: 3
 *                                   reps: "10-12"
 *                                   kg: 65
 *                                   rest: "90s"
 *                                   observations: "Buen rango de movimiento"
 *                                   status: "completed"
 *                                   pse: "8"
 *                                   rir: "1"
 *                                   done: true
 *                                   completedAt: "2024-01-10T10:30:00.000Z"
 *               usuario_sin_planes:
 *                 summary: Usuario sin planes asignados
 *                 value:
 *                   userId: "dd0e8400-e29b-41d4-a716-446655440008"
 *                   userName: "María García"
 *                   plans: []
 *               usuario_plan_simple:
 *                 summary: Usuario con un plan básico
 *                 value:
 *                   userId: "99fe8400-e29b-41d4-a716-446655440009"
 *                   userName: "Carlos Rodriguez"
 *                   plans:
 *                     - id: "552e8400-e29b-41d4-a716-446655440014"
 *                       userId: "99fe8400-e29b-41d4-a716-446655440009"
 *                       title: "Plan de Iniciación"
 *                       description: "Plan básico para principiantes"
 *                       createdAt: "2024-01-12T14:00:00.000Z"
 *                       sessions:
 *                         - id: "660e8400-e29b-41d4-a716-446655440015"
 *                           sessionNumber: 1
 *                           name: "Cuerpo Completo"
 *                           completed: false
 *                           blocks:
 *                             - id: "770e8400-e29b-41d4-a716-446655440016"
 *                               title: "Ejercicios Básicos"
 *                               position: 1
 *                               status: "pending"
 *                               exercises:
 *                                 - id: "880e8400-e29b-41d4-a716-446655440017"
 *                                   exerciseName: "Flexiones"
 *                                   series: 3
 *                                   reps: "8-12"
 *                                   kg: null
 *                                   rest: "60s"
 *                                   observations: "Mantener el core activo"
 *                                   status: "pending"
 *                                   pse: null
 *                                   rir: null
 *                                   done: false
 *                                   completedAt: null
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *             examples:
 *               usuario_no_encontrado:
 *                 summary: Usuario no existe
 *                 value:
 *                   error: "NotFound"
 *                   message: "User not found"
 *                   details: []
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *             examples:
 *               no_autenticado:
 *                 summary: Token no válido
 *                 value:
 *                   error: "Unauthorized"
 *                   message: "Invalid or expired token"
 */
router.get('/users/:id/plans', userController_1.UserController.getUserPlans);
// ===== RUTAS DE PLANES =====
/**
 * @swagger
 * /plans:
 *   get:
 *     summary: Obtener todos los planes
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de planes de entrenamiento
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Plan'
 *             examples:
 *               plans_list:
 *                 summary: Lista de planes disponibles
 *                 value:
 *                   - id: "550e8400-e29b-41d4-a716-446655440000"
 *                     userId: "123e4567-e89b-12d3-a456-426614174000"
 *                     title: "Plan de Fuerza - Semana 1"
 *                     description: "Plan enfocado en desarrollo de fuerza básica"
 *                     createdAt: "2024-01-01T12:00:00.000Z"
 *                     sessions: []
 *                   - id: "551e8400-e29b-41d4-a716-446655440001"
 *                     userId: "123e4567-e89b-12d3-a456-426614174000"
 *                     title: "Plan de Hipertrofia - Semana 2"
 *                     description: "Plan enfocado en hipertrofia muscular"
 *                     createdAt: "2024-01-02T12:00:00.000Z"
 *                     sessions: []
 *   post:
 *     summary: Crear nuevo plan
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePlanRequest'
 *           examples:
 *             plan_fuerza:
 *               summary: Plan de fuerza
 *               value:
 *                 userId: "123e4567-e89b-12d3-a456-426614174000"
 *                 title: "Plan de Fuerza - Semana 3"
 *                 description: "Plan avanzado de desarrollo de fuerza con ejercicios compuestos"
 *             plan_cardio:
 *               summary: Plan de cardio
 *               value:
 *                 userId: "dd0e8400-e29b-41d4-a716-446655440008"
 *                 title: "Plan de Acondicionamiento Cardiovascular"
 *                 description: "Plan enfocado en mejorar la resistencia cardiovascular"
 *     responses:
 *       201:
 *         description: Plan creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 plan:
 *                   $ref: '#/components/schemas/Plan'
 *             examples:
 *               plan_created:
 *                 summary: Plan creado exitosamente
 *                 value:
 *                   message: "Plan creado exitosamente"
 *                   plan:
 *                     id: "552e8400-e29b-41d4-a716-446655440002"
 *                     userId: "123e4567-e89b-12d3-a456-426614174000"
 *                     title: "Plan de Fuerza - Semana 3"
 *                     description: "Plan avanzado de desarrollo de fuerza con ejercicios compuestos"
 *                     createdAt: "2024-01-03T12:00:00.000Z"
 *                     sessions: []
 */
router.get('/plans', planController_1.PlanController.getAllPlans);
router.post('/plans', planController_1.PlanController.createPlan);
/**
 * @swagger
 * /plans/{id}:
 *   get:
 *     summary: Obtener plan por ID
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalles del plan con sesiones, bloques y ejercicios
 *   put:
 *     summary: Actualizar plan
 *     description: Actualiza los datos de un plan existente. Permite modificar el título y/o descripción del plan.
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del plan a actualizar
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePlanRequest'
 *           examples:
 *             actualizar_titulo_descripcion:
 *               summary: Actualizar título y descripción
 *               value:
 *                 title: "Plan de Fuerza Avanzado - Semana 3"
 *                 description: "Plan avanzado enfocado en fuerza máxima con ejercicios compuestos y progresión lineal"
 *             actualizar_solo_titulo:
 *               summary: Actualizar solo el título
 *               value:
 *                 title: "Plan de Hipertrofia Modificado"
 *             actualizar_solo_descripcion:
 *               summary: Actualizar solo la descripción
 *               value:
 *                 description: "Descripción actualizada con nuevos objetivos y metodología"
 *             limpiar_descripcion:
 *               summary: Limpiar descripción
 *               value:
 *                 title: "Plan Sin Descripción"
 *                 description: null
 *     responses:
 *       200:
 *         description: Plan actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 plan:
 *                   $ref: '#/components/schemas/Plan'
 *             examples:
 *               plan_actualizado:
 *                 summary: Plan actualizado exitosamente
 *                 value:
 *                   message: "Plan updated successfully"
 *                   plan:
 *                     id: "550e8400-e29b-41d4-a716-446655440000"
 *                     userId: "123e4567-e89b-12d3-a456-426614174000"
 *                     title: "Plan de Fuerza Avanzado - Semana 3"
 *                     description: "Plan avanzado enfocado en fuerza máxima con ejercicios compuestos y progresión lineal"
 *                     createdAt: "2024-01-01T12:00:00.000Z"
 *                     user:
 *                       id: "123e4567-e89b-12d3-a456-426614174000"
 *                       name: "Juan Pérez"
 *                       email: "juan.perez@email.com"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Plan no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Eliminar plan
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Plan eliminado
 */
router.get('/plans/:id', planController_1.PlanController.getPlanById);
router.put('/plans/:id', planController_1.PlanController.updatePlan);
router.delete('/plans/:id', planController_1.PlanController.deletePlan);
// ===== RUTAS DE WEEKS =====
/**
 * @swagger
 * /plans/{planId}/weeks:
 *   get:
 *     summary: Obtener semanas de un plan
 *     description: Obtiene todas las semanas asociadas a un plan específico
 *     tags: [Weeks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del plan
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Lista de semanas del plan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 weeks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Week'
 *                 total:
 *                   type: integer
 *             examples:
 *               weeks_list:
 *                 summary: Lista de semanas
 *                 value:
 *                   weeks:
 *                     - id: "650e8400-e29b-41d4-a716-446655440001"
 *                       planId: "550e8400-e29b-41d4-a716-446655440000"
 *                       title: "Semana 1 - Adaptación"
 *                       createdAt: "2024-01-01T12:00:00.000Z"
 *                       sessions: []
 *                     - id: "650e8400-e29b-41d4-a716-446655440002"
 *                       planId: "550e8400-e29b-41d4-a716-446655440000"
 *                       title: "Semana 2 - Progresión"
 *                       createdAt: "2024-01-02T12:00:00.000Z"
 *                       sessions: []
 *                   total: 2
 *       404:
 *         description: Plan no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/plans/:planId/weeks', weekController_1.WeekController.getWeeksByPlan);
/**
 * @swagger
 * /weeks:
 *   post:
 *     summary: Crear nueva semana
 *     description: Crea una nueva semana dentro de un plan existente
 *     tags: [Weeks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWeekRequest'
 *           examples:
 *             semana_adaptacion:
 *               summary: Semana de adaptación
 *               value:
 *                 planId: "550e8400-e29b-41d4-a716-446655440000"
 *                 title: "Semana 1 - Adaptación"
 *             semana_progresion:
 *               summary: Semana de progresión
 *               value:
 *                 planId: "550e8400-e29b-41d4-a716-446655440000"
 *                 title: "Semana 2 - Progresión"
 *     responses:
 *       201:
 *         description: Semana creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 week:
 *                   $ref: '#/components/schemas/Week'
 *             examples:
 *               week_created:
 *                 summary: Semana creada exitosamente
 *                 value:
 *                   message: "Week created successfully"
 *                   week:
 *                     id: "650e8400-e29b-41d4-a716-446655440001"
 *                     planId: "550e8400-e29b-41d4-a716-446655440000"
 *                     title: "Semana 1 - Adaptación"
 *                     createdAt: "2024-01-01T12:00:00.000Z"
 *                     plan:
 *                       id: "550e8400-e29b-41d4-a716-446655440000"
 *                       title: "Plan de Fuerza - Enero 2024"
 *                       description: "Plan enfocado en desarrollo de fuerza básica"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Plan no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/weeks', weekController_1.WeekController.createWeek);
/**
 * @swagger
 * /weeks/{id}:
 *   get:
 *     summary: Obtener semana por ID
 *     description: Obtiene una semana específica con todas sus sesiones
 *     tags: [Weeks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la semana
 *         example: "650e8400-e29b-41d4-a716-446655440001"
 *     responses:
 *       200:
 *         description: Detalles de la semana
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 week:
 *                   $ref: '#/components/schemas/Week'
 *       404:
 *         description: Semana no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Actualizar semana
 *     description: Actualiza el título de una semana existente
 *     tags: [Weeks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la semana a actualizar
 *         example: "650e8400-e29b-41d4-a716-446655440001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 description: Nuevo título de la semana
 *                 example: "Semana 1 - Adaptación Modificada"
 *           examples:
 *             actualizar_titulo:
 *               summary: Actualizar título
 *               value:
 *                 title: "Semana 1 - Adaptación Modificada"
 *     responses:
 *       200:
 *         description: Semana actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 week:
 *                   $ref: '#/components/schemas/Week'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Semana no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Eliminar semana
 *     description: Elimina una semana y todas sus sesiones asociadas
 *     tags: [Weeks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la semana a eliminar
 *         example: "650e8400-e29b-41d4-a716-446655440001"
 *     responses:
 *       200:
 *         description: Semana eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Week deleted successfully"
 *       404:
 *         description: Semana no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/weeks/:id', weekController_1.WeekController.getWeekById);
router.put('/weeks/:id', weekController_1.WeekController.updateWeek);
router.delete('/weeks/:id', weekController_1.WeekController.deleteWeek);
// ===== RUTAS DE SESIONES =====
/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Crear nueva sesión en una semana
 *     description: Crea una nueva sesión de entrenamiento dentro de una semana existente
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSessionRequest'
 *           examples:
 *             session_tren_superior:
 *               summary: Sesión de tren superior
 *               value:
 *                 weekId: "650e8400-e29b-41d4-a716-446655440001"
 *                 sessionNumber: 1
 *                 name: "Día 1 - Tren Superior"
 *             session_tren_inferior:
 *               summary: Sesión de tren inferior
 *               value:
 *                 weekId: "650e8400-e29b-41d4-a716-446655440001"
 *                 sessionNumber: 2
 *                 name: "Día 2 - Tren Inferior"
 *             session_fullbody:
 *               summary: Sesión full body
 *               value:
 *                 weekId: "650e8400-e29b-41d4-a716-446655440002"
 *                 sessionNumber: 1
 *                 name: "Día 1 - Full Body"
 *             session_cardio:
 *               summary: Sesión de cardio
 *               value:
 *                 weekId: "650e8400-e29b-41d4-a716-446655440001"
 *                 sessionNumber: 3
 *                 name: "Día 3 - Cardio HIIT"
 *     responses:
 *       201:
 *         description: Sesión creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 session:
 *                   $ref: '#/components/schemas/PlanSession'
 *             examples:
 *               session_created:
 *                 summary: Sesión creada exitosamente
 *                 value:
 *                   message: "Session created successfully"
 *                   session:
 *                     id: "660e8400-e29b-41d4-a716-446655440001"
 *                     weekId: "650e8400-e29b-41d4-a716-446655440001"
 *                     sessionNumber: 1
 *                     name: "Día 1 - Tren Superior"
 *                     completed: false
 *                     createdAt: "2024-01-01T13:00:00.000Z"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Semana no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Ya existe una sesión con este número en la semana
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/sessions', planController_1.PlanController.createSession);
/**
 * @swagger
 * /sessions/{id}:
 *   put:
 *     summary: Actualizar sesión
 *     description: Actualiza los campos de una sesión específica (nombre, número de sesión, estado de completado)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la sesión a actualizar
 *         example: "660e8400-e29b-41d4-a716-446655440001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionNumber:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Número de la sesión dentro de la semana
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 description: Nombre de la sesión
 *               completed:
 *                 type: boolean
 *                 description: Estado de completado de la sesión
 *           examples:
 *             update_name:
 *               summary: Actualizar nombre de sesión
 *               value:
 *                 name: "Sesión 1 - Tren Superior Modificado"
 *             update_session_number:
 *               summary: Cambiar número de sesión
 *               value:
 *                 sessionNumber: 3
 *             update_completed:
 *               summary: Marcar como completada
 *               value:
 *                 completed: true
 *             update_multiple:
 *               summary: Actualizar múltiples campos
 *               value:
 *                 name: "Sesión 2 - Tren Inferior Avanzado"
 *                 sessionNumber: 2
 *                 completed: false
 *     responses:
 *       200:
 *         description: Sesión actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 session:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     weekId:
 *                       type: string
 *                       format: uuid
 *                     sessionNumber:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     completed:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     week:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         title:
 *                           type: string
 *                         planId:
 *                           type: string
 *                           format: uuid
 *             examples:
 *               session_updated:
 *                 summary: Sesión actualizada exitosamente
 *                 value:
 *                   message: "Session updated successfully"
 *                   session:
 *                     id: "660e8400-e29b-41d4-a716-446655440001"
 *                     weekId: "650e8400-e29b-41d4-a716-446655440001"
 *                     sessionNumber: 1
 *                     name: "Día 1 - Tren Superior Modificado"
 *                     completed: false
 *                     createdAt: "2024-01-01T13:00:00.000Z"
 *                     week:
 *                       id: "650e8400-e29b-41d4-a716-446655440001"
 *                       title: "Semana 1 - Adaptación"
 *                       planId: "550e8400-e29b-41d4-a716-446655440000"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Sesión no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Ya existe una sesión con este número en la semana
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/sessions/:id', planController_1.PlanController.updateSession);
/**
 * @swagger
 * /sessions/{id}/complete:
 *   put:
 *     summary: Marcar sesión como completada
 *     description: Marca una sesión específica como completada. Este endpoint no requiere requestBody ya que automáticamente establece completed=true.
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la sesión a completar
 *         example: "660e8400-e29b-41d4-a716-446655440001"
 *     requestBody:
 *       description: Este endpoint no requiere datos en el body. La acción se ejecuta automáticamente al hacer PUT a la URL.
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: {}
 *           examples:
 *             empty_body:
 *               summary: Sin datos en el body
 *               value: {}
 *             completar_sesion:
 *               summary: Completar sesión (body vacío)
 *               description: No se necesitan datos adicionales, solo hacer PUT request
 *               value: {}
 *     responses:
 *       200:
 *         description: Sesión marcada como completada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 session:
 *                   $ref: '#/components/schemas/PlanSession'
 *             examples:
 *               session_completed:
 *                 summary: Sesión completada exitosamente
 *                 value:
 *                   message: "Session marked as completed"
 *                   session:
 *                     id: "660e8400-e29b-41d4-a716-446655440001"
 *                     weekId: "650e8400-e29b-41d4-a716-446655440001"
 *                     sessionNumber: 1
 *                     name: "Día 1 - Tren Superior"
 *                     completed: true
 *                     createdAt: "2024-01-01T13:00:00.000Z"
 *               session_tren_inferior_completed:
 *                 summary: Sesión de tren inferior completada
 *                 value:
 *                   message: "Session marked as completed"
 *                   session:
 *                     id: "661e8400-e29b-41d4-a716-446655440002"
 *                     weekId: "650e8400-e29b-41d4-a716-446655440001"
 *                     sessionNumber: 2
 *                     name: "Día 2 - Tren Inferior"
 *                     completed: true
 *                     createdAt: "2024-01-02T10:00:00.000Z"
 *       404:
 *         description: Sesión no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               session_not_found:
 *                 summary: Sesión no encontrada
 *                 value:
 *                   error: "NotFound"
 *                   message: "Session not found"
 *       400:
 *         description: Sesión ya completada o error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               already_completed:
 *                 summary: Sesión ya completada
 *                 value:
 *                   error: "ValidationError"
 *                   message: "Session already completed"
 */
router.put('/sessions/:id/complete', planController_1.PlanController.completeSession);
// ===== RUTAS DE BLOQUES =====
/**
 * @swagger
 * /blocks:
 *   post:
 *     summary: Crear nuevo bloque en una sesión
 *     description: Crea un nuevo bloque de ejercicios dentro de una sesión específica
 *     tags: [Blocks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBlockRequest'
 *           examples:
 *             bloque_principal:
 *               summary: Bloque principal
 *               value:
 *                 sessionId: "660e8400-e29b-41d4-a716-446655440001"
 *                 title: "Bloque A - Ejercicios principales"
 *                 position: 1
 *                 status: "pending"
 *             bloque_accesorios:
 *               summary: Bloque de accesorios
 *               value:
 *                 sessionId: "660e8400-e29b-41d4-a716-446655440001"
 *                 title: "Bloque B - Ejercicios accesorios"
 *                 position: 2
 *                 status: "pending"
 *             bloque_cardio:
 *               summary: Bloque cardiovascular
 *               value:
 *                 sessionId: "661e8400-e29b-41d4-a716-446655440002"
 *                 title: "Bloque C - Trabajo cardiovascular"
 *                 position: 3
 *                 status: "pending"
 *     responses:
 *       201:
 *         description: Bloque creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 block:
 *                   $ref: '#/components/schemas/SessionBlock'
 *             examples:
 *               block_created:
 *                 summary: Bloque creado exitosamente
 *                 value:
 *                   message: "Bloque creado exitosamente"
 *                   block:
 *                     id: "770e8400-e29b-41d4-a716-446655440002"
 *                     sessionId: "660e8400-e29b-41d4-a716-446655440001"
 *                     title: "Bloque A - Ejercicios principales"
 *                     position: 1
 *                     status: "pending"
 *                     createdAt: "2024-01-01T13:30:00.000Z"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Sesión no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/blocks', planController_1.PlanController.createBlock);
/**
 * @swagger
 * /blocks/{id}:
 *   put:
 *     summary: Actualizar bloque
 *     description: Actualiza los datos de un bloque existente. Permite modificar el título, posición y/o estado del bloque.
 *     tags: [Blocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del bloque a actualizar
 *         example: "770e8400-e29b-41d4-a716-446655440002"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBlockRequest'
 *           examples:
 *             actualizar_titulo_posicion:
 *               summary: Actualizar título y posición
 *               value:
 *                 title: "Bloque A Modificado - Ejercicios principales"
 *                 position: 2
 *             cambiar_estado:
 *               summary: Cambiar estado del bloque
 *               value:
 *                 status: "in_progress"
 *             actualizar_completo:
 *               summary: Actualización completa
 *               value:
 *                 title: "Bloque B - Ejercicios accesorios avanzados"
 *                 position: 3
 *                 status: "completed"
 *             solo_titulo:
 *               summary: Actualizar solo título
 *               value:
 *                 title: "Bloque Principal Modificado"
 *     responses:
 *       200:
 *         description: Bloque actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 block:
 *                   $ref: '#/components/schemas/SessionBlock'
 *             examples:
 *               block_actualizado:
 *                 summary: Bloque actualizado exitosamente
 *                 value:
 *                   message: "Block updated successfully"
 *                   block:
 *                     id: "770e8400-e29b-41d4-a716-446655440002"
 *                     sessionId: "660e8400-e29b-41d4-a716-446655440001"
 *                     title: "Bloque A Modificado - Ejercicios principales"
 *                     position: 2
 *                     status: "in_progress"
 *                     createdAt: "2024-01-01T13:30:00.000Z"
 *                     session:
 *                       id: "660e8400-e29b-41d4-a716-446655440001"
 *                       name: "Sesión 1 - Tren Superior"
 *                       sessionNumber: 1
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Bloque no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Eliminar bloque
 *     description: Elimina un bloque específico y todos sus ejercicios asociados.
 *     tags: [Blocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del bloque a eliminar
 *         example: "770e8400-e29b-41d4-a716-446655440002"
 *     responses:
 *       200:
 *         description: Bloque eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               block_eliminado:
 *                 summary: Bloque eliminado exitosamente
 *                 value:
 *                   message: "Block deleted successfully"
 *       404:
 *         description: Bloque no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/blocks/:id', planController_1.PlanController.updateBlock);
router.delete('/blocks/:id', planController_1.PlanController.deleteBlock);
// ===== RUTAS DE EJERCICIOS =====
/**
 * @swagger
 * /exercises:
 *   post:
 *     summary: Crear nuevo ejercicio en un bloque
 *     description: Crea un nuevo ejercicio dentro de un bloque específico de una sesión
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExerciseRequest'
 *           examples:
 *             press_banca:
 *               summary: Press de banca
 *               value:
 *                 blockId: "770e8400-e29b-41d4-a716-446655440002"
 *                 exerciseName: "Press de Banca"
 *                 series: 4
 *                 reps: "8-10"
 *                 kg: 80.5
 *                 rest: "2-3 min"
 *                 observations: "Mantener control en la fase excéntrica"
 *                 status: "pending"
 *             sentadilla:
 *               summary: Sentadilla
 *               value:
 *                 blockId: "770e8400-e29b-41d4-a716-446655440002"
 *                 exerciseName: "Sentadilla"
 *                 series: 4
 *                 reps: "6-8"
 *                 rest: "3-4 min"
 *                 observations: "Profundidad completa, rodillas alineadas"
 *                 status: "pending"
 *             curl_biceps:
 *               summary: Curl de bíceps
 *               value:
 *                 blockId: "771e8400-e29b-41d4-a716-446655440003"
 *                 exerciseName: "Curl de Bíceps con Mancuernas"
 *                 series: 3
 *                 reps: "12-15"
 *                 rest: "60-90 seg"
 *                 status: "pending"
 *             cardio:
 *               summary: Ejercicio cardiovascular
 *               value:
 *                 blockId: "772e8400-e29b-41d4-a716-446655440004"
 *                 exerciseName: "Caminata en Cinta"
 *                 series: 1
 *                 reps: "20 min"
 *                 rest: null
 *                 observations: "Mantener ritmo constante, inclinación 3%"
 *                 status: "pending"
 *     responses:
 *       201:
 *         description: Ejercicio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 exercise:
 *                   $ref: '#/components/schemas/BlockExercise'
 *             examples:
 *               exercise_created:
 *                 summary: Ejercicio creado exitosamente
 *                 value:
 *                   message: "Ejercicio creado exitosamente"
 *                   exercise:
 *                     id: "880e8400-e29b-41d4-a716-446655440003"
 *                     blockId: "770e8400-e29b-41d4-a716-446655440002"
 *                     exerciseName: "Press de Banca"
 *                     series: 4
 *                     reps: "8-10"
 *                     rest: "2-3 min"
 *                     observations: "Mantener control en la fase excéntrica"
 *                     status: "pending"
 *                     createdAt: "2024-01-01T14:00:00.000Z"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Bloque no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/exercises', planController_1.PlanController.createExercise);
/**
 * @swagger
 * /exercises/{id}:
 *   put:
 *     summary: Actualizar ejercicio
 *     description: Actualiza los datos de un ejercicio, incluyendo progreso del usuario (kg, pse, rir, etc.)
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del ejercicio a actualizar
 *         example: "880e8400-e29b-41d4-a716-446655440003"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               exerciseName:
 *                 type: string
 *                 description: "Nombre del ejercicio (opcional)"
 *                 example: "Press de Banca Inclinado"
 *               series:
 *                 type: integer
 *                 minimum: 1
 *                 description: "Número de series (opcional)"
 *                 example: 4
 *               reps:
 *                 type: string
 *                 description: "Especificación de repeticiones (opcional)"
 *                 example: "8-10"
 *               kg:
 *                 type: number
 *                 description: "Peso utilizado por el usuario (opcional)"
 *                 example: 85.5
 *               rest:
 *                 type: string
 *                 description: "Tiempo de descanso (opcional)"
 *                 example: "2-3 min"
 *               observations:
 *                 type: string
 *                 description: "Observaciones del admin o usuario (opcional)"
 *                 example: "Excelente técnica, aumentar peso próxima vez"
 *               status:
 *                 type: string
 *                 enum: ['pending', 'in_progress', 'completed']
 *                 description: "Estado del ejercicio (opcional)"
 *                 example: "completed"
 *               pse:
 *                 type: string
 *                 description: "Esfuerzo percibido 1-10 (opcional)"
 *                 example: "8"
 *               rir:
 *                 type: string
 *                 description: "Repeticiones en reserva (opcional)"
 *                 example: "2"
 *               done:
 *                 type: boolean
 *                 description: "Marcar como completado (opcional)"
 *                 example: true
 *           examples:
 *             actualizar_progreso_usuario:
 *               summary: "Usuario actualiza su progreso"
 *               value:
 *                 kg: 87.5
 *                 pse: "8"
 *                 rir: "2"
 *                 observations: "Me sentí bien, listo para más peso"
 *                 status: "completed"
 *                 done: true
 *             comentario_admin:
 *               summary: "Admin deja feedback"
 *               value:
 *                 observations: "Admin: Excelente progreso, técnica perfecta. Subir a 90kg la próxima vez"
 *                 status: "completed"
 *             modificar_ejercicio:
 *               summary: "Modificar datos del ejercicio"
 *               value:
 *                 exerciseName: "Press de Banca con Pausa"
 *                 series: 5
 *                 reps: "6-8"
 *                 kg: 90
 *             marcar_en_progreso:
 *               summary: "Marcar como en progreso"
 *               value:
 *                 status: "in_progress"
 *                 pse: "7"
 *                 observations: "Primera serie completada"
 *     responses:
 *       200:
 *         description: Ejercicio actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 exercise:
 *                   $ref: '#/components/schemas/BlockExercise'
 *             examples:
 *               exercise_actualizado:
 *                 summary: Ejercicio actualizado exitosamente
 *                 value:
 *                   message: "Exercise updated successfully"
 *                   exercise:
 *                     id: "880e8400-e29b-41d4-a716-446655440003"
 *                     blockId: "770e8400-e29b-41d4-a716-446655440002"
 *                     exerciseName: "Press de Banca"
 *                     series: 4
 *                     reps: "8-10"
 *                     kg: 87.5
 *                     rest: "2-3 min"
 *                     observations: "Excelente progreso, técnica perfecta"
 *                     status: "completed"
 *                     pse: "8"
 *                     rir: "2"
 *                     done: true
 *                     completedAt: "2024-01-08T15:30:00.000Z"
 *                     createdAt: "2024-01-01T14:00:00.000Z"
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Ejercicio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Eliminar ejercicio
 *     description: Elimina un ejercicio específico del bloque
 *     tags: [Exercises]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del ejercicio a eliminar
 *         example: "880e8400-e29b-41d4-a716-446655440003"
 *     responses:
 *       200:
 *         description: Ejercicio eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               exercise_eliminado:
 *                 summary: Ejercicio eliminado exitosamente
 *                 value:
 *                   message: "Exercise deleted successfully"
 *       404:
 *         description: Ejercicio no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/exercises/:id', planController_1.PlanController.updateExercise);
router.delete('/exercises/:id', planController_1.PlanController.deleteExercise);
// ===== RUTAS ADMINISTRATIVAS =====
/**
 * @swagger
 * /admin/setup:
 *   post:
 *     summary: Crear usuario administrador inicial
 *     description: Crea el primer usuario administrador del sistema. Solo funciona si no existe ningún administrador.
 *     tags: [Admin]
 *     responses:
 *       201:
 *         description: Administrador creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Admin user created successfully"
 *                 credentials:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "admin@fitapp.com"
 *                     password:
 *                       type: string
 *                       example: "admin123"
 *                     note:
 *                       type: string
 *                       example: "Please change this password immediately after first login"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                       example: "Administrator"
 *                     email:
 *                       type: string
 *                       example: "admin@fitapp.com"
 *                     role:
 *                       type: string
 *                       example: "admin"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       409:
 *         description: Ya existe un administrador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Admin user already exists"
 *                 message:
 *                   type: string
 *                   example: "An administrator user has already been created"
 *                 hint:
 *                   type: string
 *                   example: "Use email: admin@fitapp.com and password: admin123 to login"
 */
router.post('/admin/setup', async (req, res, next) => {
    try {
        // Verificar si ya existe un admin
        const existingAdmin = await require('../config/database').prisma.user.findFirst({
            where: { role: 'admin' }
        });
        if (existingAdmin) {
            return res.status(409).json({
                error: 'Admin user already exists',
                message: 'An administrator user has already been created',
                hint: 'Use email: admin@fitapp.com and password: admin123 to login'
            });
        }
        // Hash de la contraseña por defecto
        const defaultPassword = 'admin123';
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(defaultPassword, saltRounds);
        // Crear usuario administrador
        const adminUser = await require('../config/database').prisma.user.create({
            data: {
                name: 'Administrator',
                email: 'admin@fitapp.com',
                password: hashedPassword,
                role: 'admin',
                profilePicture: null,
                phone: null
            }
        });
        res.status(201).json({
            message: 'Admin user created successfully',
            credentials: {
                email: 'admin@fitapp.com',
                password: 'admin123',
                note: 'Please change this password immediately after first login'
            },
            user: {
                id: adminUser.id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role,
                createdAt: adminUser.createdAt
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=index.js.map