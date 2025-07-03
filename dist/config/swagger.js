"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUi = exports.specs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
exports.swaggerUi = swagger_ui_express_1.default;
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FitApp Backend API',
            version: '1.0.0',
            description: 'API completa para la aplicación de seguimiento de ejercicios y planes de entrenamiento',
            contact: {
                name: 'FitApp Development Team',
                email: 'admin@fitapp.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT Authorization header using the Bearer scheme'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'ID único del usuario',
                            example: '123e4567-e89b-12d3-a456-426614174000'
                        },
                        name: {
                            type: 'string',
                            description: 'Nombre del usuario',
                            example: 'Juan Pérez'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email del usuario',
                            example: 'juan.perez@email.com'
                        },
                        role: {
                            type: 'string',
                            enum: ['user', 'trainer', 'admin'],
                            description: 'Rol del usuario',
                            example: 'user'
                        },
                        phone: {
                            type: 'string',
                            nullable: true,
                            description: 'Teléfono del usuario',
                            example: '+34 600 123 456'
                        },
                        profilePicture: {
                            type: 'string',
                            format: 'uri',
                            nullable: true,
                            description: 'URL de la foto de perfil',
                            example: 'https://example.com/profile.jpg'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de creación',
                            example: '2024-01-01T12:00:00.000Z'
                        }
                    },
                    example: {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        name: 'Juan Pérez',
                        email: 'juan.perez@email.com',
                        role: 'user',
                        phone: '+34 600 123 456',
                        profilePicture: 'https://example.com/profile.jpg',
                        createdAt: '2024-01-01T12:00:00.000Z'
                    }
                },
                Plan: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: '550e8400-e29b-41d4-a716-446655440000'
                        },
                        userId: {
                            type: 'string',
                            format: 'uuid',
                            description: 'ID del usuario propietario',
                            example: '123e4567-e89b-12d3-a456-426614174000'
                        },
                        title: {
                            type: 'string',
                            description: 'Título del plan',
                            example: 'Plan de Fuerza - Semana 1'
                        },
                        description: {
                            type: 'string',
                            nullable: true,
                            description: 'Descripción del plan',
                            example: 'Plan enfocado en desarrollo de fuerza básica con ejercicios compuestos'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T12:00:00.000Z'
                        },
                        sessions: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/PlanSession' }
                        }
                    },
                    example: {
                        id: '550e8400-e29b-41d4-a716-446655440000',
                        userId: '123e4567-e89b-12d3-a456-426614174000',
                        title: 'Plan de Fuerza - Semana 1',
                        description: 'Plan enfocado en desarrollo de fuerza básica con ejercicios compuestos',
                        createdAt: '2024-01-01T12:00:00.000Z',
                        sessions: []
                    }
                },
                PlanSession: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: '660e8400-e29b-41d4-a716-446655440001'
                        },
                        planId: {
                            type: 'string',
                            format: 'uuid',
                            example: '550e8400-e29b-41d4-a716-446655440000'
                        },
                        sessionNumber: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 5,
                            description: 'Número de sesión (1-5)',
                            example: 1
                        },
                        name: {
                            type: 'string',
                            description: 'Nombre de la sesión',
                            example: 'Sesión 1 - Tren Superior'
                        },
                        completed: {
                            type: 'boolean',
                            description: 'Estado de completado',
                            example: false
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T12:00:00.000Z'
                        }
                    },
                    example: {
                        id: '660e8400-e29b-41d4-a716-446655440001',
                        planId: '550e8400-e29b-41d4-a716-446655440000',
                        sessionNumber: 1,
                        name: 'Sesión 1 - Tren Superior',
                        completed: false,
                        createdAt: '2024-01-01T12:00:00.000Z'
                    }
                },
                SessionBlock: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: '770e8400-e29b-41d4-a716-446655440002'
                        },
                        sessionId: {
                            type: 'string',
                            format: 'uuid',
                            example: '660e8400-e29b-41d4-a716-446655440001'
                        },
                        title: {
                            type: 'string',
                            description: 'Título del bloque',
                            example: 'Bloque A - Ejercicios principales'
                        },
                        position: {
                            type: 'integer',
                            description: 'Posición para ordenamiento',
                            example: 1
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T12:00:00.000Z'
                        }
                    },
                    example: {
                        id: '770e8400-e29b-41d4-a716-446655440002',
                        sessionId: '660e8400-e29b-41d4-a716-446655440001',
                        title: 'Bloque A - Ejercicios principales',
                        position: 1,
                        createdAt: '2024-01-01T12:00:00.000Z'
                    }
                },
                BlockExercise: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: '880e8400-e29b-41d4-a716-446655440003'
                        },
                        blockId: {
                            type: 'string',
                            format: 'uuid',
                            example: '770e8400-e29b-41d4-a716-446655440002'
                        },
                        exerciseName: {
                            type: 'string',
                            description: 'Nombre del ejercicio',
                            example: 'Press de banca con barra'
                        },
                        series: {
                            type: 'integer',
                            description: 'Número de series',
                            example: 4
                        },
                        reps: {
                            type: 'string',
                            description: 'Especificación de repeticiones (ej: "8/8", "10", "20\\"20\\"")',
                            example: '8'
                        },
                        rest: {
                            type: 'string',
                            nullable: true,
                            description: 'Tiempo de descanso',
                            example: '3min'
                        },
                        observations: {
                            type: 'string',
                            nullable: true,
                            description: 'Observaciones del ejercicio',
                            example: 'Controlar la fase excéntrica, pausa de 1 segundo en el pecho'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T12:00:00.000Z'
                        }
                    },
                    example: {
                        id: '880e8400-e29b-41d4-a716-446655440003',
                        blockId: '770e8400-e29b-41d4-a716-446655440002',
                        exerciseName: 'Press de banca con barra',
                        series: 4,
                        reps: '8',
                        rest: '3min',
                        observations: 'Controlar la fase excéntrica, pausa de 1 segundo en el pecho',
                        createdAt: '2024-01-01T12:00:00.000Z'
                    }
                },
                ExerciseTracking: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: '990e8400-e29b-41d4-a716-446655440004'
                        },
                        exerciseId: {
                            type: 'string',
                            format: 'uuid',
                            example: '880e8400-e29b-41d4-a716-446655440003'
                        },
                        userId: {
                            type: 'string',
                            format: 'uuid',
                            example: '123e4567-e89b-12d3-a456-426614174000'
                        },
                        kg: {
                            type: 'string',
                            nullable: true,
                            description: 'Peso utilizado',
                            example: '80'
                        },
                        pse: {
                            type: 'string',
                            nullable: true,
                            description: 'Esfuerzo percibido (PSE)',
                            example: '8'
                        },
                        rir: {
                            type: 'string',
                            nullable: true,
                            description: 'Repeticiones en reserva (RIR)',
                            example: '2'
                        },
                        done: {
                            type: 'boolean',
                            description: 'Estado de completado',
                            example: true
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T12:00:00.000Z'
                        }
                    },
                    example: {
                        id: '990e8400-e29b-41d4-a716-446655440004',
                        exerciseId: '880e8400-e29b-41d4-a716-446655440003',
                        userId: '123e4567-e89b-12d3-a456-426614174000',
                        kg: '80',
                        pse: '8',
                        rir: '2',
                        done: true,
                        createdAt: '2024-01-01T12:00:00.000Z'
                    }
                },
                UserInvitation: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: 'aa0e8400-e29b-41d4-a716-446655440005'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email del usuario invitado',
                            example: 'nuevo.usuario@email.com'
                        },
                        token: {
                            type: 'string',
                            description: 'Token único de invitación',
                            example: 'inv_1234567890abcdef'
                        },
                        invitedBy: {
                            type: 'string',
                            format: 'uuid',
                            description: 'ID del usuario que envió la invitación',
                            example: '123e4567-e89b-12d3-a456-426614174000'
                        },
                        expiresAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de expiración',
                            example: '2024-01-08T12:00:00.000Z'
                        },
                        usedAt: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            description: 'Fecha de uso de la invitación',
                            example: null
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T12:00:00.000Z'
                        }
                    },
                    example: {
                        id: 'aa0e8400-e29b-41d4-a716-446655440005',
                        email: 'nuevo.usuario@email.com',
                        token: 'inv_1234567890abcdef',
                        invitedBy: '123e4567-e89b-12d3-a456-426614174000',
                        expiresAt: '2024-01-08T12:00:00.000Z',
                        usedAt: null,
                        createdAt: '2024-01-01T12:00:00.000Z'
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Tipo de error',
                            example: 'ValidationError'
                        },
                        message: {
                            type: 'string',
                            description: 'Mensaje descriptivo del error',
                            example: 'Los datos proporcionados no son válidos'
                        },
                        details: {
                            type: 'array',
                            items: {
                                type: 'object'
                            },
                            description: 'Detalles adicionales del error (validaciones, etc.)',
                            example: [
                                {
                                    field: 'email',
                                    message: 'El email no tiene un formato válido'
                                }
                            ]
                        }
                    },
                    example: {
                        error: 'ValidationError',
                        message: 'Los datos proporcionados no son válidos',
                        details: [
                            {
                                field: 'email',
                                message: 'El email no tiene un formato válido'
                            }
                        ]
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Login exitoso'
                        },
                        token: {
                            type: 'string',
                            description: 'JWT token',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJlbWFpbCI6Imp1YW4ucGVyZXpAZW1haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE2NDYzNjQwMDAsImV4cCI6MTY0NjQ1MDQwMH0.abc123def456'
                        },
                        user: {
                            $ref: '#/components/schemas/User'
                        }
                    },
                    example: {
                        message: 'Login exitoso',
                        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJlbWFpbCI6Imp1YW4ucGVyZXpAZW1haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE2NDYzNjQwMDAsImV4cCI6MTY0NjQ1MDQwMH0.abc123def456',
                        user: {
                            id: '123e4567-e89b-12d3-a456-426614174000',
                            name: 'Juan Pérez',
                            email: 'juan.perez@email.com',
                            role: 'user',
                            phone: '+34 600 123 456',
                            profilePicture: 'https://example.com/profile.jpg',
                            createdAt: '2024-01-01T12:00:00.000Z'
                        }
                    }
                },
                CreateUserRequest: {
                    type: 'object',
                    required: ['name', 'email'],
                    properties: {
                        name: {
                            type: 'string',
                            example: 'Ana García'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'ana.garcia@email.com'
                        },
                        role: {
                            type: 'string',
                            enum: ['user', 'trainer', 'admin'],
                            example: 'user'
                        },
                        phone: {
                            type: 'string',
                            nullable: true,
                            example: '+34 611 222 333'
                        },
                        profilePicture: {
                            type: 'string',
                            nullable: true,
                            example: 'https://example.com/ana-profile.jpg'
                        }
                    },
                    example: {
                        name: 'Ana García',
                        email: 'ana.garcia@email.com',
                        role: 'user',
                        phone: '+34 611 222 333',
                        profilePicture: 'https://example.com/ana-profile.jpg'
                    }
                },
                CreatePlanRequest: {
                    type: 'object',
                    required: ['userId', 'title'],
                    properties: {
                        userId: {
                            type: 'string',
                            format: 'uuid',
                            example: '123e4567-e89b-12d3-a456-426614174000'
                        },
                        title: {
                            type: 'string',
                            example: 'Plan de Hipertrofia - Semana 2'
                        },
                        description: {
                            type: 'string',
                            nullable: true,
                            example: 'Segundo plan enfocado en hipertrofia muscular con mayor volumen'
                        }
                    },
                    example: {
                        userId: '123e4567-e89b-12d3-a456-426614174000',
                        title: 'Plan de Hipertrofia - Semana 2',
                        description: 'Segundo plan enfocado en hipertrofia muscular con mayor volumen'
                    }
                },
                CreateTrackingRequest: {
                    type: 'object',
                    required: ['exerciseId', 'userId'],
                    properties: {
                        exerciseId: {
                            type: 'string',
                            format: 'uuid',
                            example: '880e8400-e29b-41d4-a716-446655440003'
                        },
                        userId: {
                            type: 'string',
                            format: 'uuid',
                            example: '123e4567-e89b-12d3-a456-426614174000'
                        },
                        kg: {
                            type: 'string',
                            nullable: true,
                            example: '85'
                        },
                        pse: {
                            type: 'string',
                            nullable: true,
                            example: '7'
                        },
                        rir: {
                            type: 'string',
                            nullable: true,
                            example: '3'
                        }
                    },
                    example: {
                        exerciseId: '880e8400-e29b-41d4-a716-446655440003',
                        userId: '123e4567-e89b-12d3-a456-426614174000',
                        kg: '85',
                        pse: '7',
                        rir: '3'
                    }
                },
                UserStatsResponse: {
                    type: 'object',
                    properties: {
                        totalPlans: {
                            type: 'integer',
                            example: 3
                        },
                        completedSessions: {
                            type: 'integer',
                            example: 8
                        },
                        totalExerciseTracking: {
                            type: 'integer',
                            example: 45
                        },
                        completedExercises: {
                            type: 'integer',
                            example: 38
                        },
                        progressPercentage: {
                            type: 'number',
                            format: 'float',
                            example: 84.4
                        }
                    },
                    example: {
                        totalPlans: 3,
                        completedSessions: 8,
                        totalExerciseTracking: 45,
                        completedExercises: 38,
                        progressPercentage: 84.4
                    }
                }
            }
        },
        tags: [
            {
                name: 'Health',
                description: 'Health check endpoints'
            },
            {
                name: 'Authentication',
                description: 'Endpoints de autenticación y autorización'
            },
            {
                name: 'Invitations',
                description: 'Sistema de invitaciones por magic link'
            },
            {
                name: 'Users',
                description: 'Gestión de usuarios'
            },
            {
                name: 'Plans',
                description: 'Gestión de planes de entrenamiento'
            },
            {
                name: 'Sessions',
                description: 'Gestión de sesiones de entrenamiento'
            },
            {
                name: 'Blocks',
                description: 'Gestión de bloques de ejercicios'
            },
            {
                name: 'Exercises',
                description: 'Gestión de ejercicios'
            },
            {
                name: 'Tracking',
                description: 'Seguimiento de ejercicios'
            },
            {
                name: 'Statistics',
                description: 'Estadísticas y reportes'
            },
            {
                name: 'Admin',
                description: 'Funciones administrativas'
            }
        ]
    },
    apis: [
        './src/routes/*.ts',
        './src/controllers/*.ts'
    ]
};
exports.specs = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map