import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import { UserController } from '../controllers/userController'
import { PlanController } from '../controllers/planController'
import { TrackingController } from '../controllers/trackingController'
import { AuthController } from '../controllers/authController'
import { InvitationController } from '../controllers/invitationController'
import { authMiddleware, requireAdmin } from '../middlewares/auth'

const router = Router()

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
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: 'FitApp Backend API',
    version: '1.0.0',
    swaggerDocs: `${req.protocol}://${req.get('host')}/api-docs`,
    documentation: {
      auth: 'POST /auth/login, POST /auth/verify, GET /auth/me',
      invitations: 'POST /invitations/invite (admin), GET /invitations/verify/:token, POST /invitations/complete',
      users: 'GET/POST /users, GET/PUT/DELETE /users/:id',
      plans: 'GET/POST /plans, GET/PUT/DELETE /plans/:id',
      tracking: 'GET/POST /tracking, GET/PUT/DELETE /tracking/:id',
      stats: 'GET /users/:userId/stats'
    }
  })
})

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
router.post('/auth/login', AuthController.login)

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
router.post('/auth/verify', authMiddleware, AuthController.verifyToken)

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
router.get('/auth/me', authMiddleware, AuthController.getCurrentUser)

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
router.post('/auth/generate-token', requireAdmin, AuthController.generateToken)

// ===== RUTAS DE INVITACIONES =====

/**
 * @swagger
 * /invitations/invite:
 *   post:
 *     summary: Invitar usuario (Solo Admin)
 *     description: Enviar invitación por magic link a un nuevo usuario
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nuevo@usuario.com
 *           examples:
 *             nuevo_usuario:
 *               summary: Invitar nuevo usuario
 *               value:
 *                 email: "maria.lopez@email.com"
 *             nuevo_entrenador:
 *               summary: Invitar nuevo entrenador
 *               value:
 *                 email: "carlos.trainer@fitgym.com"
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
 *                 invitation:
 *                   $ref: '#/components/schemas/UserInvitation'
 *                 magicLink:
 *                   type: string
 *             examples:
 *               invitation_sent:
 *                 summary: Invitación enviada exitosamente
 *                 value:
 *                   message: "Invitación enviada exitosamente"
 *                   invitation:
 *                     id: "bb0e8400-e29b-41d4-a716-446655440006"
 *                     email: "maria.lopez@email.com"
 *                     token: "inv_maria_xyz789"
 *                     invitedBy: "admin-uuid-123"
 *                     expiresAt: "2024-01-08T12:00:00.000Z"
 *                     usedAt: null
 *                     createdAt: "2024-01-01T12:00:00.000Z"
 *                   magicLink: "http://localhost:3000/invite?token=inv_maria_xyz789"
 *       400:
 *         description: Email ya invitado o usuario ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               already_invited:
 *                 summary: Email ya invitado
 *                 value:
 *                   error: "BadRequest"
 *                   message: "Este email ya tiene una invitación pendiente"
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
router.post('/invitations/invite', authMiddleware, requireAdmin, InvitationController.inviteUser)

/**
 * @swagger
 * /invitations/verify/{token}:
 *   get:
 *     summary: Verificar token de invitación
 *     description: Verificar la validez de un token de invitación
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
 *       400:
 *         description: Token inválido o expirado
 */
router.get('/invitations/verify/:token', InvitationController.verifyInvitation)

/**
 * @swagger
 * /invitations/complete:
 *   post:
 *     summary: Completar registro con invitación
 *     description: Completar el registro de usuario usando un token de invitación válido
 *     tags: [Invitations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - name
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 example: inv_maria_xyz789
 *               name:
 *                 type: string
 *                 example: María López
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: micontraseña123
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 example: "+34 622 333 444"
 *               profilePicture:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 example: "https://example.com/maria-profile.jpg"
 *           examples:
 *             registro_completo:
 *               summary: Registro completo con todos los datos
 *               value:
 *                 token: "inv_maria_xyz789"
 *                 name: "María López"
 *                 password: "micontraseña123"
 *                 phone: "+34 622 333 444"
 *                 profilePicture: "https://example.com/maria-profile.jpg"
 *             registro_basico:
 *               summary: Registro con datos mínimos
 *               value:
 *                 token: "inv_carlos_abc123"
 *                 name: "Carlos Trainer"
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
router.post('/invitations/complete', InvitationController.completeRegistration)

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
router.get('/invitations/pending', authMiddleware, requireAdmin, InvitationController.getPendingInvitations)

router.delete('/invitations/:id', authMiddleware, requireAdmin, InvitationController.cancelInvitation)
router.post('/invitations/:id/resend', authMiddleware, requireAdmin, InvitationController.resendInvitation)

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
router.get('/users', UserController.getAllUsers)
router.post('/users', UserController.createUser)

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
router.get('/users/:id', UserController.getUserById)
router.put('/users/:id', UserController.updateUser)
router.delete('/users/:id', UserController.deleteUser)

/**
 * @swagger
 * /users/{id}/plans:
 *   get:
 *     summary: Obtener planes de un usuario
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
 *         description: Planes del usuario
 */
router.get('/users/:id/plans', UserController.getUserPlans)

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
router.get('/plans', PlanController.getAllPlans)
router.post('/plans', PlanController.createPlan)

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
 *         description: Plan actualizado
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
router.get('/plans/:id', PlanController.getPlanById)
router.put('/plans/:id', PlanController.updatePlan)
router.delete('/plans/:id', PlanController.deletePlan)

// ===== RUTAS DE SESIONES =====
router.post('/sessions', PlanController.createSession)
router.put('/sessions/:id/complete', PlanController.completeSession)

// ===== RUTAS DE BLOQUES =====
router.post('/blocks', PlanController.createBlock)

// ===== RUTAS DE EJERCICIOS =====
router.post('/exercises', PlanController.createExercise)

// ===== RUTAS DE TRACKING =====

/**
 * @swagger
 * /tracking:
 *   get:
 *     summary: Obtener todos los seguimientos
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de seguimientos de ejercicios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExerciseTracking'
 *             examples:
 *               tracking_list:
 *                 summary: Lista de seguimientos de ejercicios
 *                 value:
 *                   - id: "990e8400-e29b-41d4-a716-446655440004"
 *                     exerciseId: "880e8400-e29b-41d4-a716-446655440003"
 *                     userId: "123e4567-e89b-12d3-a456-426614174000"
 *                     kg: "80"
 *                     pse: "8"
 *                     rir: "2"
 *                     done: true
 *                     createdAt: "2024-01-01T14:00:00.000Z"
 *                   - id: "991e8400-e29b-41d4-a716-446655440005"
 *                     exerciseId: "881e8400-e29b-41d4-a716-446655440004"
 *                     userId: "123e4567-e89b-12d3-a456-426614174000"
 *                     kg: "100"
 *                     pse: "9"
 *                     rir: "1"
 *                     done: true
 *                     createdAt: "2024-01-01T14:30:00.000Z"
 *   post:
 *     summary: Crear nuevo seguimiento
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTrackingRequest'
 *           examples:
 *             tracking_press_banca:
 *               summary: Seguimiento de press de banca
 *               value:
 *                 exerciseId: "880e8400-e29b-41d4-a716-446655440003"
 *                 userId: "123e4567-e89b-12d3-a456-426614174000"
 *                 kg: "85"
 *                 pse: "7"
 *                 rir: "3"
 *             tracking_sentadilla:
 *               summary: Seguimiento de sentadilla
 *               value:
 *                 exerciseId: "881e8400-e29b-41d4-a716-446655440004"
 *                 userId: "123e4567-e89b-12d3-a456-426614174000"
 *                 kg: "120"
 *                 pse: "8"
 *                 rir: "2"
 *             tracking_cardio:
 *               summary: Seguimiento de ejercicio cardiovascular
 *               value:
 *                 exerciseId: "882e8400-e29b-41d4-a716-446655440005"
 *                 userId: "dd0e8400-e29b-41d4-a716-446655440008"
 *                 kg: null
 *                 pse: "6"
 *                 rir: null
 *     responses:
 *       201:
 *         description: Seguimiento creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 tracking:
 *                   $ref: '#/components/schemas/ExerciseTracking'
 *             examples:
 *               tracking_created:
 *                 summary: Seguimiento creado exitosamente
 *                 value:
 *                   message: "Seguimiento registrado exitosamente"
 *                   tracking:
 *                     id: "992e8400-e29b-41d4-a716-446655440006"
 *                     exerciseId: "880e8400-e29b-41d4-a716-446655440003"
 *                     userId: "123e4567-e89b-12d3-a456-426614174000"
 *                     kg: "85"
 *                     pse: "7"
 *                     rir: "3"
 *                     done: false
 *                     createdAt: "2024-01-01T15:00:00.000Z"
 */
router.get('/tracking', TrackingController.getAllTracking)
router.post('/tracking', TrackingController.createTracking)

/**
 * @swagger
 * /tracking/user/{userId}:
 *   get:
 *     summary: Obtener seguimientos por usuario
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Seguimientos del usuario
 */
router.get('/tracking/user/:userId', TrackingController.getTrackingByUser)

/**
 * @swagger
 * /tracking/exercise/{exerciseId}:
 *   get:
 *     summary: Obtener seguimientos por ejercicio
 *     tags: [Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exerciseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Seguimientos del ejercicio
 */
router.get('/tracking/exercise/:exerciseId', TrackingController.getTrackingByExercise)

router.put('/tracking/:id', TrackingController.updateTracking)
router.delete('/tracking/:id', TrackingController.deleteTracking)
router.put('/tracking/:id/done', TrackingController.markAsDone)

// ===== RUTAS DE ESTADÍSTICAS =====

/**
 * @swagger
 * /users/{userId}/stats:
 *   get:
 *     summary: Obtener estadísticas de usuario
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Estadísticas del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserStatsResponse'
 *             examples:
 *               usuario_activo:
 *                 summary: Estadísticas de usuario activo
 *                 value:
 *                   totalPlans: 5
 *                   completedSessions: 12
 *                   totalExerciseTracking: 68
 *                   completedExercises: 58
 *                   progressPercentage: 85.3
 *               usuario_principiante:
 *                 summary: Estadísticas de usuario principiante
 *                 value:
 *                   totalPlans: 1
 *                   completedSessions: 2
 *                   totalExerciseTracking: 15
 *                   completedExercises: 8
 *                   progressPercentage: 53.3
 *               usuario_avanzado:
 *                 summary: Estadísticas de usuario avanzado
 *                 value:
 *                   totalPlans: 8
 *                   completedSessions: 25
 *                   totalExerciseTracking: 150
 *                   completedExercises: 142
 *                   progressPercentage: 94.7
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
router.get('/users/:userId/stats', TrackingController.getUserStats)

// ===== RUTAS ADMINISTRATIVAS =====
// Endpoint para crear usuario administrador
router.post('/admin/setup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await require('../config/database').prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (existingAdmin) {
      return res.status(409).json({
        error: 'Admin user already exists',
        message: 'An administrator user has already been created',
        hint: 'Use email: admin@fitapp.com and password: admin123 to login'
      })
    }

    // Hash de la contraseña por defecto
    const defaultPassword = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

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
    })

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
    })
  } catch (error) {
    next(error)
  }
})

export default router