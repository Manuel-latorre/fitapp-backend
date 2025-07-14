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
                            example: 'Plan de Fuerza - Enero 2024'
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
                        weeks: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Week' }
                        }
                    },
                    example: {
                        id: '550e8400-e29b-41d4-a716-446655440000',
                        userId: '123e4567-e89b-12d3-a456-426614174000',
                        title: 'Plan de Fuerza - Enero 2024',
                        description: 'Plan enfocado en desarrollo de fuerza básica con ejercicios compuestos',
                        createdAt: '2024-01-01T12:00:00.000Z',
                        weeks: [
                            {
                                id: '650e8400-e29b-41d4-a716-446655440001',
                                planId: '550e8400-e29b-41d4-a716-446655440000',
                                title: 'Semana 1 - Adaptación',
                                createdAt: '2024-01-01T12:00:00.000Z',
                                sessions: [
                                    {
                                        id: '660e8400-e29b-41d4-a716-446655440001',
                                        weekId: '650e8400-e29b-41d4-a716-446655440001',
                                        sessionNumber: 1,
                                        name: 'Día 1 - Tren Superior',
                                        completed: false,
                                        createdAt: '2024-01-01T12:00:00.000Z'
                                    },
                                    {
                                        id: '660e8400-e29b-41d4-a716-446655440002',
                                        weekId: '650e8400-e29b-41d4-a716-446655440001',
                                        sessionNumber: 2,
                                        name: 'Día 2 - Tren Inferior',
                                        completed: false,
                                        createdAt: '2024-01-01T12:00:00.000Z'
                                    }
                                ]
                            },
                            {
                                id: '650e8400-e29b-41d4-a716-446655440002',
                                planId: '550e8400-e29b-41d4-a716-446655440000',
                                title: 'Semana 2 - Progresión',
                                createdAt: '2024-01-08T12:00:00.000Z',
                                sessions: []
                            }
                        ]
                    }
                },
                Week: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: '650e8400-e29b-41d4-a716-446655440001'
                        },
                        planId: {
                            type: 'string',
                            format: 'uuid',
                            description: 'ID del plan al que pertenece',
                            example: '550e8400-e29b-41d4-a716-446655440000'
                        },
                        title: {
                            type: 'string',
                            description: 'Título de la semana',
                            example: 'Semana 1 - Adaptación'
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
                        id: '650e8400-e29b-41d4-a716-446655440001',
                        planId: '550e8400-e29b-41d4-a716-446655440000',
                        title: 'Semana 1 - Adaptación',
                        createdAt: '2024-01-01T12:00:00.000Z',
                        sessions: [
                            {
                                id: '660e8400-e29b-41d4-a716-446655440001',
                                weekId: '650e8400-e29b-41d4-a716-446655440001',
                                sessionNumber: 1,
                                name: 'Día 1 - Tren Superior',
                                completed: false,
                                createdAt: '2024-01-01T12:00:00.000Z'
                            },
                            {
                                id: '660e8400-e29b-41d4-a716-446655440002',
                                weekId: '650e8400-e29b-41d4-a716-446655440001',
                                sessionNumber: 2,
                                name: 'Día 2 - Tren Inferior',
                                completed: false,
                                createdAt: '2024-01-01T12:00:00.000Z'
                            }
                        ]
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
                        weekId: {
                            type: 'string',
                            format: 'uuid',
                            description: 'ID de la semana a la que pertenece',
                            example: '650e8400-e29b-41d4-a716-446655440001'
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
                        weekId: '650e8400-e29b-41d4-a716-446655440001',
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
                        status: {
                            type: 'string',
                            description: 'Estado del bloque (pending, in_progress, completed)',
                            example: 'pending'
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
                        status: 'pending',
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
                        kg: {
                            type: 'number',
                            nullable: true,
                            description: 'Peso en kilogramos usado por el usuario',
                            example: 80.5
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
                            description: 'Observaciones del admin o usuario sobre el ejercicio',
                            example: 'Excelente técnica, aumentar peso próxima vez'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'in_progress', 'completed'],
                            description: 'Estado del ejercicio',
                            example: 'pending'
                        },
                        pse: {
                            type: 'string',
                            nullable: true,
                            description: 'Esfuerzo percibido 1-10 (PSE)',
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
                            description: 'Ejercicio completado por el usuario',
                            example: false
                        },
                        completedAt: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            description: 'Fecha de completado',
                            example: null
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T12:00:00.000Z'
                        },
                        link: {
                            type: 'string',
                            nullable: true,
                            description: 'Enlace de referencia para el ejercicio (video, imagen, etc.)',
                            example: 'https://www.youtube.com/watch?v=ejemplo-press-banca'
                        }
                    },
                    example: {
                        id: '880e8400-e29b-41d4-a716-446655440003',
                        blockId: '770e8400-e29b-41d4-a716-446655440002',
                        exerciseName: 'Press de banca con barra',
                        series: 4,
                        reps: '8',
                        kg: 85.5,
                        rest: '3min',
                        observations: 'Excelente progreso, técnica perfecta',
                        status: 'completed',
                        pse: '8',
                        rir: '2',
                        done: true,
                        completedAt: '2024-01-08T15:30:00.000Z',
                        createdAt: '2024-01-01T12:00:00.000Z',
                        link: 'https://www.youtube.com/watch?v=ejemplo-press-banca'
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
                            example: 'Plan de Hipertrofia - Febrero 2024'
                        },
                        description: {
                            type: 'string',
                            nullable: true,
                            example: 'Plan enfocado en hipertrofia muscular con mayor volumen'
                        }
                    },
                    example: {
                        userId: '123e4567-e89b-12d3-a456-426614174000',
                        title: 'Plan de Hipertrofia - Febrero 2024',
                        description: 'Plan enfocado en hipertrofia muscular con mayor volumen'
                    }
                },
                CreateWeekRequest: {
                    type: 'object',
                    required: ['planId', 'title'],
                    properties: {
                        planId: {
                            type: 'string',
                            format: 'uuid',
                            description: 'ID del plan al que pertenece la semana',
                            example: '550e8400-e29b-41d4-a716-446655440000'
                        },
                        title: {
                            type: 'string',
                            description: 'Título de la semana',
                            example: 'Semana 2 - Progresión'
                        }
                    },
                    examples: {
                        semana_adaptacion: {
                            summary: 'Semana de adaptación',
                            value: {
                                planId: '550e8400-e29b-41d4-a716-446655440000',
                                title: 'Semana 1 - Adaptación'
                            }
                        },
                        semana_progresion: {
                            summary: 'Semana de progresión',
                            value: {
                                planId: '550e8400-e29b-41d4-a716-446655440000',
                                title: 'Semana 2 - Progresión'
                            }
                        },
                        semana_especializacion: {
                            summary: 'Semana de especialización',
                            value: {
                                planId: '550e8400-e29b-41d4-a716-446655440000',
                                title: 'Semana 3 - Especialización'
                            }
                        }
                    },
                    example: {
                        planId: '550e8400-e29b-41d4-a716-446655440000',
                        title: 'Semana 2 - Progresión'
                    }
                },
                UpdatePlanRequest: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            minLength: 1,
                            description: 'Nuevo título del plan (opcional)',
                            example: 'Plan de Fuerza Avanzado - Semana 3'
                        },
                        description: {
                            type: 'string',
                            nullable: true,
                            description: 'Nueva descripción del plan (opcional)',
                            example: 'Plan avanzado enfocado en fuerza máxima con ejercicios compuestos y progresión lineal'
                        }
                    },
                    example: {
                        title: 'Plan de Fuerza Avanzado - Semana 3',
                        description: 'Plan avanzado enfocado en fuerza máxima con ejercicios compuestos y progresión lineal'
                    }
                },
                CreateSessionRequest: {
                    type: 'object',
                    required: ['weekId', 'sessionNumber', 'name'],
                    properties: {
                        weekId: {
                            type: 'string',
                            format: 'uuid',
                            description: 'ID de la semana a la que pertenece la sesión',
                            example: '650e8400-e29b-41d4-a716-446655440001'
                        },
                        sessionNumber: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 5,
                            description: 'Número de sesión dentro de la semana (1-5)',
                            example: 1
                        },
                        name: {
                            type: 'string',
                            description: 'Nombre descriptivo de la sesión',
                            example: 'Día 1 - Tren Superior'
                        }
                    },
                    examples: {
                        tren_superior: {
                            summary: 'Sesión de tren superior',
                            value: {
                                weekId: '650e8400-e29b-41d4-a716-446655440001',
                                sessionNumber: 1,
                                name: 'Día 1 - Tren Superior'
                            }
                        },
                        tren_inferior: {
                            summary: 'Sesión de tren inferior',
                            value: {
                                weekId: '650e8400-e29b-41d4-a716-446655440001',
                                sessionNumber: 2,
                                name: 'Día 2 - Tren Inferior'
                            }
                        },
                        fullbody: {
                            summary: 'Sesión fullbody',
                            value: {
                                weekId: '650e8400-e29b-41d4-a716-446655440001',
                                sessionNumber: 3,
                                name: 'Día 3 - Fullbody'
                            }
                        },
                        cardio: {
                            summary: 'Sesión de cardio',
                            value: {
                                weekId: '650e8400-e29b-41d4-a716-446655440001',
                                sessionNumber: 4,
                                name: 'Día 4 - Cardio HIIT'
                            }
                        }
                    },
                    example: {
                        weekId: '650e8400-e29b-41d4-a716-446655440001',
                        sessionNumber: 1,
                        name: 'Día 1 - Tren Superior'
                    }
                },
                CreateBlockRequest: {
                    type: 'object',
                    required: ['sessionId', 'title', 'position'],
                    properties: {
                        sessionId: {
                            type: 'string',
                            format: 'uuid',
                            example: '660e8400-e29b-41d4-a716-446655440001'
                        },
                        title: {
                            type: 'string',
                            example: 'Bloque A - Ejercicios principales'
                        },
                        position: {
                            type: 'integer',
                            minimum: 1,
                            example: 1
                        },
                        status: {
                            type: 'string',
                            description: 'Estado del bloque (pending, in_progress, completed)',
                            example: 'pending'
                        }
                    },
                    example: {
                        sessionId: '660e8400-e29b-41d4-a716-446655440001',
                        title: 'Bloque A - Ejercicios principales',
                        position: 1,
                        status: 'pending'
                    }
                },
                UpdateBlockRequest: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            minLength: 1,
                            description: 'Nuevo título del bloque (opcional)',
                            example: 'Bloque A Modificado - Ejercicios principales'
                        },
                        position: {
                            type: 'integer',
                            minimum: 1,
                            description: 'Nueva posición del bloque (opcional)',
                            example: 2
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'in_progress', 'completed'],
                            description: 'Nuevo estado del bloque (opcional)',
                            example: 'in_progress'
                        }
                    },
                    example: {
                        title: 'Bloque A Modificado - Ejercicios principales',
                        position: 2,
                        status: 'in_progress'
                    }
                },
                CreateExerciseRequest: {
                    type: 'object',
                    required: ['blockId', 'exerciseName', 'series', 'reps'],
                    properties: {
                        blockId: {
                            type: 'string',
                            format: 'uuid',
                            example: '770e8400-e29b-41d4-a716-446655440002'
                        },
                        exerciseName: {
                            type: 'string',
                            example: 'Press de Banca'
                        },
                        series: {
                            type: 'integer',
                            minimum: 1,
                            example: 4
                        },
                        reps: {
                            type: 'string',
                            example: '8-10'
                        },
                        kg: {
                            type: 'number',
                            nullable: true,
                            example: 80.5
                        },
                        rest: {
                            type: 'string',
                            nullable: true,
                            example: '2-3 min'
                        },
                        observations: {
                            type: 'string',
                            nullable: true,
                            example: 'Mantener control en la fase excéntrica'
                        },
                        status: {
                            type: 'string',
                            description: 'Estado del ejercicio (pending, in_progress, completed)',
                            example: 'pending'
                        },
                        link: {
                            type: 'string',
                            nullable: true,
                            description: 'Enlace de referencia para el ejercicio (video, imagen, etc.)',
                            example: 'https://www.youtube.com/watch?v=ejemplo-press-banca'
                        }
                    },
                    example: {
                        blockId: '770e8400-e29b-41d4-a716-446655440002',
                        exerciseName: 'Press de Banca',
                        series: 4,
                        reps: '8-10',
                        kg: 80.5,
                        rest: '2-3 min',
                        observations: 'Mantener control en la fase excéntrica',
                        status: 'pending',
                        link: 'https://www.youtube.com/watch?v=ejemplo-press-banca'
                    }
                },
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
                name: 'Weeks',
                description: 'Gestión de semanas dentro de los planes'
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
                description: 'Gestión de ejercicios (con tracking integrado)'
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