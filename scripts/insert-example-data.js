#!/usr/bin/env node

const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const exampleData = {
  user: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'María García',
    email: 'maria.garcia@email.com',
    role: 'user',
    password: 'password123',
    phone: '+34 123 456 789'
  },
  plan: {
    title: 'Semana 1 - Entrenamiento Integral',
    description: 'Plan de entrenamiento completo para María García enfocado en fuerza y acondicionamiento'
  },
  sessions: [
    {
      sessionNumber: 1,
      name: 'Sesión 1 - Entrenamiento Completo',
      blocks: [
        {
          title: 'Bloque de Movilidad',
          position: 1,
          exercises: [
            {
              exerciseName: 'Movilidad de Cadera',
              series: 2,
              reps: '10 cada lado',
              rest: '30 seg',
              observations: 'Movimientos controlados, sin rebotes'
            },
            {
              exerciseName: 'Rotaciones de Hombros',
              series: 2,
              reps: '15 hacia adelante, 15 hacia atrás',
              rest: '30 seg',
              observations: 'Amplitud completa de movimiento'
            }
          ]
        },
        {
          title: 'Bloque de Activación',
          position: 2,
          exercises: [
            {
              exerciseName: 'Sentadillas con Peso Corporal',
              series: 2,
              reps: '15-20',
              rest: '60 seg',
              observations: 'Activación previa, peso corporal únicamente'
            },
            {
              exerciseName: 'Flexiones de Brazos',
              series: 2,
              reps: '10-15',
              rest: '60 seg',
              observations: 'Modificar según nivel: rodillas si es necesario'
            }
          ]
        },
        {
          title: 'Bloque Principal 1',
          position: 3,
          exercises: [
            {
              exerciseName: 'Sentadillas con Barra',
              series: 4,
              reps: '8-12',
              rest: '2-3min',
              observations: 'Notas adicionales sobre la técnica, progresión, etc.'
            },
            {
              exerciseName: 'Press de Banca',
              series: 4,
              reps: '6-10',
              rest: '2-3min',
              observations: 'Control en la bajada, pausa en el pecho'
            }
          ]
        },
        {
          title: 'Bloque Principal 2',
          position: 4,
          exercises: [
            {
              exerciseName: 'Peso Muerto',
              series: 4,
              reps: '5-8',
              rest: '3-4min',
              observations: 'Técnica perfecta, activación del core'
            },
            {
              exerciseName: 'Remo con Barra',
              series: 4,
              reps: '8-12',
              rest: '2-3min',
              observations: 'Retracción escapular, pecho hacia afuera'
            }
          ]
        },
        {
          title: 'Bloque Principal 3',
          position: 5,
          exercises: [
            {
              exerciseName: 'Curl de Bíceps con Mancuernas',
              series: 3,
              reps: '12-15',
              rest: '60-90 seg',
              observations: 'Movimiento controlado, evitar balanceo'
            },
            {
              exerciseName: 'Extensiones de Tríceps',
              series: 3,
              reps: '12-15',
              rest: '60-90 seg',
              observations: 'Codos fijos, rango completo de movimiento'
            },
            {
              exerciseName: 'Plancha',
              series: 3,
              reps: '30-60 seg',
              rest: '90 seg',
              observations: 'Mantener línea recta, activar core'
            }
          ]
        }
      ]
    },
    {
      sessionNumber: 2,
      name: 'Sesión 2 - Tren Inferior + Core',
      blocks: [
        {
          title: 'Bloque de Movilidad',
          position: 1,
          exercises: [
            {
              exerciseName: 'Movilidad de Cadera y Tobillo',
              series: 2,
              reps: '12 cada lado',
              rest: '30 seg',
              observations: 'Enfoque en flexibilidad de cadera para sentadillas'
            },
            {
              exerciseName: 'Activación Glúteos',
              series: 2,
              reps: '15 cada lado',
              rest: '30 seg',
              observations: 'Caminata lateral con banda elástica'
            }
          ]
        },
        {
          title: 'Bloque de Activación',
          position: 2,
          exercises: [
            {
              exerciseName: 'Sentadillas Goblet',
              series: 2,
              reps: '15',
              rest: '60 seg',
              observations: 'Con mancuerna, activación previa'
            },
            {
              exerciseName: 'Puente de Glúteos',
              series: 2,
              reps: '20',
              rest: '60 seg',
              observations: 'Activación glúteos y core'
            }
          ]
        },
        {
          title: 'Bloque Principal - Piernas',
          position: 3,
          exercises: [
            {
              exerciseName: 'Sentadilla Búlgara',
              series: 4,
              reps: '10 cada pierna',
              rest: '2-3min',
              observations: 'Con mancuernas, trabajo unilateral'
            },
            {
              exerciseName: 'Peso Muerto Rumano',
              series: 4,
              reps: '8-12',
              rest: '2-3min',
              observations: 'Enfoque en isquiotibiales y glúteos'
            },
            {
              exerciseName: 'Zancadas',
              series: 3,
              reps: '12 cada pierna',
              rest: '90 seg',
              observations: 'Alternadas, con o sin peso'
            }
          ]
        },
        {
          title: 'Bloque Core',
          position: 4,
          exercises: [
            {
              exerciseName: 'Plancha Lateral',
              series: 3,
              reps: '30 seg cada lado',
              rest: '60 seg',
              observations: 'Mantener línea recta, activar oblicuos'
            },
            {
              exerciseName: 'Dead Bug',
              series: 3,
              reps: '10 cada lado',
              rest: '60 seg',
              observations: 'Control y estabilidad del core'
            },
            {
              exerciseName: 'Russian Twist',
              series: 3,
              reps: '20',
              rest: '60 seg',
              observations: 'Con o sin peso, rotación controlada'
            }
          ]
        }
      ]
    },
    {
      sessionNumber: 3,
      name: 'Sesión 3 - Tren Superior + Cardio',
      blocks: [
        {
          title: 'Bloque de Movilidad',
          position: 1,
          exercises: [
            {
              exerciseName: 'Círculos de Brazos',
              series: 2,
              reps: '15 hacia adelante, 15 hacia atrás',
              rest: '30 seg',
              observations: 'Amplitud completa, preparación hombros'
            },
            {
              exerciseName: 'Estiramientos de Pecho',
              series: 2,
              reps: '30 seg cada posición',
              rest: '30 seg',
              observations: 'En marco de puerta, diferentes ángulos'
            }
          ]
        },
        {
          title: 'Bloque de Activación',
          position: 2,
          exercises: [
            {
              exerciseName: 'Flexiones Inclinadas',
              series: 2,
              reps: '10-15',
              rest: '60 seg',
              observations: 'En banco o superficie elevada'
            },
            {
              exerciseName: 'Band Pull-Apart',
              series: 2,
              reps: '15',
              rest: '60 seg',
              observations: 'Activación músculos posteriores'
            }
          ]
        },
        {
          title: 'Bloque Principal - Tren Superior',
          position: 3,
          exercises: [
            {
              exerciseName: 'Press de Hombros',
              series: 4,
              reps: '8-12',
              rest: '2-3min',
              observations: 'Con mancuernas, core activado'
            },
            {
              exerciseName: 'Remo en Polea',
              series: 4,
              reps: '10-12',
              rest: '2-3min',
              observations: 'Retracción escapular, pecho hacia afuera'
            },
            {
              exerciseName: 'Fondos en Paralelas',
              series: 3,
              reps: '8-15',
              rest: '90 seg',
              observations: 'Asistidos si es necesario'
            },
            {
              exerciseName: 'Dominadas Asistidas',
              series: 3,
              reps: '5-10',
              rest: '2min',
              observations: 'Con banda elástica o máquina asistida'
            }
          ]
        },
        {
          title: 'Bloque Cardio',
          position: 4,
          exercises: [
            {
              exerciseName: 'Intervalos en Cinta',
              series: 1,
              reps: '20 min',
              rest: null,
              observations: '5 min calentamiento, 10 min intervalos (1:1), 5 min enfriamiento'
            },
            {
              exerciseName: 'Mountain Climbers',
              series: 3,
              reps: '30 seg',
              rest: '60 seg',
              observations: 'Ritmo alto, core activado'
            },
            {
              exerciseName: 'Burpees',
              series: 3,
              reps: '10',
              rest: '90 seg',
              observations: 'Modificar según nivel de condición física'
            }
          ]
        }
      ]
    }
  ]
};

async function insertExampleData() {
  try {
    log('blue', '🚀 Insertando datos de ejemplo en la base de datos...');
    
    // 1. Crear o actualizar usuario
    log('yellow', '👤 Creando usuario María García...');
    const user = await prisma.user.upsert({
      where: { email: exampleData.user.email },
      update: {
        name: exampleData.user.name,
        phone: exampleData.user.phone
      },
      create: exampleData.user
    });
    log('green', `✅ Usuario creado: ${user.name} (${user.email})`);

    // 2. Crear plan
    log('yellow', '📋 Creando plan de entrenamiento...');
    const plan = await prisma.plan.create({
      data: {
        userId: user.id,
        title: exampleData.plan.title,
        description: exampleData.plan.description
      }
    });
    log('green', `✅ Plan creado: ${plan.title}`);

    // 3. Crear sesiones con bloques y ejercicios
    for (const sessionData of exampleData.sessions) {
      log('yellow', `🏃 Creando ${sessionData.name}...`);
      
      const session = await prisma.planSession.create({
        data: {
          planId: plan.id,
          sessionNumber: sessionData.sessionNumber,
          name: sessionData.name
        }
      });

      // Crear bloques para esta sesión
      for (const blockData of sessionData.blocks) {
        log('cyan', `  📦 Creando ${blockData.title}...`);
        
        const block = await prisma.sessionBlock.create({
          data: {
            sessionId: session.id,
            title: blockData.title,
            position: blockData.position
          }
        });

        // Crear ejercicios para este bloque
        for (const exerciseData of blockData.exercises) {
          await prisma.blockExercise.create({
            data: {
              blockId: block.id,
              exerciseName: exerciseData.exerciseName,
              series: exerciseData.series,
              reps: exerciseData.reps,
              rest: exerciseData.rest,
              observations: exerciseData.observations
            }
          });
        }
        
        log('green', `    ✅ ${blockData.exercises.length} ejercicios añadidos a ${blockData.title}`);
      }
      
      log('green', `✅ ${sessionData.name} creada con ${sessionData.blocks.length} bloques`);
    }

    // 4. Mostrar resumen
    log('green', '🎉 ¡Datos insertados exitosamente!');
    log('cyan', '📊 Resumen:');
    log('white', `   👤 Usuario: ${user.name} (${user.email})`);
    log('white', `   📋 Plan: ${plan.title}`);
    log('white', `   🏃 Sesiones: ${exampleData.sessions.length}`);
    
    const totalBlocks = exampleData.sessions.reduce((sum, session) => sum + session.blocks.length, 0);
    const totalExercises = exampleData.sessions.reduce((sum, session) => 
      sum + session.blocks.reduce((blockSum, block) => blockSum + block.exercises.length, 0), 0
    );
    
    log('white', `   📦 Bloques: ${totalBlocks}`);
    log('white', `   💪 Ejercicios: ${totalExercises}`);
    
    log('magenta', '🔗 URLs para probar:');
    log('white', `   📋 Plan completo: GET /api/plans/${plan.id}`);
    log('white', `   👤 Usuario: GET /api/users/${user.id}`);
    log('white', `   🏃 Sesiones: GET /api/sessions?planId=${plan.id}`);
    log('white', `   📚 Swagger: http://localhost:3000/api-docs`);

  } catch (error) {
    log('red', '❌ Error insertando datos:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  insertExampleData();
}

module.exports = { insertExampleData, exampleData }; 