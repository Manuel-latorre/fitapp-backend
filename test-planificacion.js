// Script para probar la creación de una planificación completa
// Ejecutar con: node test-planificacion.js

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Configurar axios para usar el token de autenticación
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE', // Reemplazar con token real
    'Content-Type': 'application/json'
  }
});

// Datos de ejemplo
const USUARIO_ID = '550e8400-e29b-41d4-a716-446655440000'; // María García
let planId, sessionIds = {}, blockIds = {};

async function crearPlanificacionCompleta() {
  try {
    console.log('🚀 Iniciando creación de planificación completa...\n');

    // 1. CREAR PLAN
    console.log('1️⃣ Creando plan...');
    const planResponse = await api.post('/plans', {
      userId: USUARIO_ID,
      title: 'Semana 1 - Entrenamiento Integral',
      description: 'Plan de entrenamiento completo para María García enfocado en fuerza y acondicionamiento'
    });
    
    planId = planResponse.data.plan.id;
    console.log('✅ Plan creado:', planId);
    console.log('   Título:', planResponse.data.plan.title);
    console.log('');

    // 2. CREAR SESIONES
    console.log('2️⃣ Creando sesiones...');
    const sesiones = [
      { sessionNumber: 1, name: 'Sesión 1 - Entrenamiento Completo', key: 'session1' },
      { sessionNumber: 2, name: 'Sesión 2 - Tren Inferior + Core', key: 'session2' },
      { sessionNumber: 3, name: 'Sesión 3 - Tren Superior + Cardio', key: 'session3' }
    ];

    for (const sesion of sesiones) {
      const sessionResponse = await api.post('/sessions', {
        planId: planId,
        sessionNumber: sesion.sessionNumber,
        name: sesion.name
      });
      
      sessionIds[sesion.key] = sessionResponse.data.session.id;
      console.log(`✅ ${sesion.name} creada:`, sessionIds[sesion.key]);
    }
    console.log('');

    // 3. CREAR BLOQUES
    console.log('3️⃣ Creando bloques...');
    
    // Bloques de la Sesión 1
    console.log('📍 Bloques de la Sesión 1:');
    const bloquesS1 = [
      { title: 'Bloque de Movilidad', position: 1, key: 's1_movilidad' },
      { title: 'Bloque de Activación', position: 2, key: 's1_activacion' },
      { title: 'Bloque Principal 1', position: 3, key: 's1_principal1' },
      { title: 'Bloque Principal 2', position: 4, key: 's1_principal2' },
      { title: 'Bloque Principal 3', position: 5, key: 's1_principal3' }
    ];

    for (const bloque of bloquesS1) {
      const blockResponse = await api.post('/blocks', {
        sessionId: sessionIds.session1,
        title: bloque.title,
        position: bloque.position
      });
      
      blockIds[bloque.key] = blockResponse.data.block.id;
      console.log(`✅ ${bloque.title} creado`);
    }

    // Bloques de la Sesión 2
    console.log('📍 Bloques de la Sesión 2:');
    const bloquesS2 = [
      { title: 'Bloque de Movilidad', position: 1, key: 's2_movilidad' },
      { title: 'Bloque de Activación', position: 2, key: 's2_activacion' },
      { title: 'Bloque Principal - Piernas', position: 3, key: 's2_piernas' },
      { title: 'Bloque Core', position: 4, key: 's2_core' }
    ];

    for (const bloque of bloquesS2) {
      const blockResponse = await api.post('/blocks', {
        sessionId: sessionIds.session2,
        title: bloque.title,
        position: bloque.position
      });
      
      blockIds[bloque.key] = blockResponse.data.block.id;
      console.log(`✅ ${bloque.title} creado`);
    }

    // Bloques de la Sesión 3
    console.log('📍 Bloques de la Sesión 3:');
    const bloquesS3 = [
      { title: 'Bloque de Movilidad', position: 1, key: 's3_movilidad' },
      { title: 'Bloque de Activación', position: 2, key: 's3_activacion' },
      { title: 'Bloque Principal - Tren Superior', position: 3, key: 's3_superior' },
      { title: 'Bloque Cardio', position: 4, key: 's3_cardio' }
    ];

    for (const bloque of bloquesS3) {
      const blockResponse = await api.post('/blocks', {
        sessionId: sessionIds.session3,
        title: bloque.title,
        position: bloque.position
      });
      
      blockIds[bloque.key] = blockResponse.data.block.id;
      console.log(`✅ ${bloque.title} creado`);
    }
    console.log('');

    // 4. CREAR EJERCICIOS
    console.log('4️⃣ Creando ejercicios...');
    
    // 4.1 EJERCICIOS DE LA SESIÓN 1
    console.log('💪 SESIÓN 1 - Entrenamiento Completo:');
    console.log('📍 Bloque de Movilidad:');
    await crearEjercicio(blockIds.s1_movilidad, 'Movilidad de Cadera', 2, '10 cada lado', '30 seg', 'Movimientos controlados, sin rebotes');
    await crearEjercicio(blockIds.s1_movilidad, 'Rotaciones de Hombros', 2, '15 hacia adelante, 15 hacia atrás', '30 seg', 'Amplitud completa de movimiento');

    console.log('📍 Bloque de Activación:');
    await crearEjercicio(blockIds.s1_activacion, 'Sentadillas con Peso Corporal', 2, '15-20', '60 seg', 'Activación previa, peso corporal únicamente');
    await crearEjercicio(blockIds.s1_activacion, 'Flexiones de Brazos', 2, '10-15', '60 seg', 'Modificar según nivel: rodillas si es necesario');

    console.log('📍 Bloque Principal 1:');
    await crearEjercicio(blockIds.s1_principal1, 'Sentadillas con Barra', 4, '8-12', '2-3min', 'Notas adicionales sobre la técnica, progresión, etc.');
    await crearEjercicio(blockIds.s1_principal1, 'Press de Banca', 4, '6-10', '2-3min', 'Control en la bajada, pausa en el pecho');

    console.log('📍 Bloque Principal 2:');
    await crearEjercicio(blockIds.s1_principal2, 'Peso Muerto', 4, '5-8', '3-4min', 'Técnica perfecta, activación del core');
    await crearEjercicio(blockIds.s1_principal2, 'Remo con Barra', 4, '8-12', '2-3min', 'Retracción escapular, pecho hacia afuera');

    console.log('📍 Bloque Principal 3:');
    await crearEjercicio(blockIds.s1_principal3, 'Curl de Bíceps con Mancuernas', 3, '12-15', '60-90 seg', 'Movimiento controlado, evitar balanceo');
    await crearEjercicio(blockIds.s1_principal3, 'Extensiones de Tríceps', 3, '12-15', '60-90 seg', 'Codos fijos, rango completo de movimiento');
    await crearEjercicio(blockIds.s1_principal3, 'Plancha', 3, '30-60 seg', '90 seg', 'Mantener línea recta, activar core');

    // 4.2 EJERCICIOS DE LA SESIÓN 2
    console.log('🦵 SESIÓN 2 - Tren Inferior + Core:');
    console.log('📍 Bloque de Movilidad:');
    await crearEjercicio(blockIds.s2_movilidad, 'Movilidad de Cadera y Tobillo', 2, '12 cada lado', '30 seg', 'Enfoque en flexibilidad de cadera para sentadillas');
    await crearEjercicio(blockIds.s2_movilidad, 'Activación Glúteos', 2, '15 cada lado', '30 seg', 'Caminata lateral con banda elástica');

    console.log('📍 Bloque de Activación:');
    await crearEjercicio(blockIds.s2_activacion, 'Sentadillas Goblet', 2, '15', '60 seg', 'Con mancuerna, activación previa');
    await crearEjercicio(blockIds.s2_activacion, 'Puente de Glúteos', 2, '20', '60 seg', 'Activación glúteos y core');

    console.log('📍 Bloque Principal - Piernas:');
    await crearEjercicio(blockIds.s2_piernas, 'Sentadilla Búlgara', 4, '10 cada pierna', '2-3min', 'Con mancuernas, trabajo unilateral');
    await crearEjercicio(blockIds.s2_piernas, 'Peso Muerto Rumano', 4, '8-12', '2-3min', 'Enfoque en isquiotibiales y glúteos');
    await crearEjercicio(blockIds.s2_piernas, 'Zancadas', 3, '12 cada pierna', '90 seg', 'Alternadas, con o sin peso');

    console.log('📍 Bloque Core:');
    await crearEjercicio(blockIds.s2_core, 'Plancha Lateral', 3, '30 seg cada lado', '60 seg', 'Mantener línea recta, activar oblicuos');
    await crearEjercicio(blockIds.s2_core, 'Dead Bug', 3, '10 cada lado', '60 seg', 'Control y estabilidad del core');
    await crearEjercicio(blockIds.s2_core, 'Russian Twist', 3, '20', '60 seg', 'Con o sin peso, rotación controlada');

    // 4.3 EJERCICIOS DE LA SESIÓN 3
    console.log('💪 SESIÓN 3 - Tren Superior + Cardio:');
    console.log('📍 Bloque de Movilidad:');
    await crearEjercicio(blockIds.s3_movilidad, 'Círculos de Brazos', 2, '15 hacia adelante, 15 hacia atrás', '30 seg', 'Amplitud completa, preparación hombros');
    await crearEjercicio(blockIds.s3_movilidad, 'Estiramientos de Pecho', 2, '30 seg cada posición', '30 seg', 'En marco de puerta, diferentes ángulos');

    console.log('📍 Bloque de Activación:');
    await crearEjercicio(blockIds.s3_activacion, 'Flexiones Inclinadas', 2, '10-15', '60 seg', 'En banco o superficie elevada');
    await crearEjercicio(blockIds.s3_activacion, 'Band Pull-Apart', 2, '15', '60 seg', 'Activación músculos posteriores');

    console.log('📍 Bloque Principal - Tren Superior:');
    await crearEjercicio(blockIds.s3_superior, 'Press de Hombros', 4, '8-12', '2-3min', 'Con mancuernas, core activado');
    await crearEjercicio(blockIds.s3_superior, 'Remo en Polea', 4, '10-12', '2-3min', 'Retracción escapular, pecho hacia afuera');
    await crearEjercicio(blockIds.s3_superior, 'Fondos en Paralelas', 3, '8-15', '90 seg', 'Asistidos si es necesario');
    await crearEjercicio(blockIds.s3_superior, 'Dominadas Asistidas', 3, '5-10', '2min', 'Con banda elástica o máquina asistida');

    console.log('📍 Bloque Cardio:');
    await crearEjercicio(blockIds.s3_cardio, 'Intervalos en Cinta', 1, '20 min', null, '5 min calentamiento, 10 min intervalos (1:1), 5 min enfriamiento');
    await crearEjercicio(blockIds.s3_cardio, 'Mountain Climbers', 3, '30 seg', '60 seg', 'Ritmo alto, core activado');
    await crearEjercicio(blockIds.s3_cardio, 'Burpees', 3, '10', '90 seg', 'Modificar según nivel de condición física');

    console.log('');

    // 5. VERIFICAR PLANIFICACIÓN CREADA
    console.log('5️⃣ Verificando planificación creada...');
    const planCompleto = await api.get(`/plans/${planId}`);
    
    console.log('✅ Planificación completa obtenida:');
    console.log('   Plan:', planCompleto.data.plan.title);
    console.log('   Usuario:', planCompleto.data.plan.user.name);
    console.log('   Sesiones:', planCompleto.data.plan.sessions.length);
    
    let totalBloques = 0;
    let totalEjercicios = 0;
    
    planCompleto.data.plan.sessions.forEach((session, index) => {
      console.log(`   📋 ${session.name}:`);
      console.log(`      - Bloques: ${session.blocks.length}`);
      
      let ejerciciosSesion = 0;
      session.blocks.forEach(block => {
        ejerciciosSesion += block.exercises.length;
        console.log(`      - ${block.title}: ${block.exercises.length} ejercicios`);
      });
      
      console.log(`      - Total ejercicios: ${ejerciciosSesion}`);
      totalBloques += session.blocks.length;
      totalEjercicios += ejerciciosSesion;
      console.log('');
    });
    
    console.log('📊 RESUMEN TOTAL:');
    console.log(`   Total bloques: ${totalBloques}`);
    console.log(`   Total ejercicios: ${totalEjercicios}`);
    console.log('');

    // 6. OPCIONAL: MARCAR SESIONES COMO COMPLETADAS
    console.log('6️⃣ Marcando sesiones como completadas...');
    
    await api.put(`/sessions/${sessionIds.session1}/complete`);
    console.log('✅ Sesión 1 marcada como completada');
    
    await api.put(`/sessions/${sessionIds.session2}/complete`);
    console.log('✅ Sesión 2 marcada como completada');
    
    await api.put(`/sessions/${sessionIds.session3}/complete`);
    console.log('✅ Sesión 3 marcada como completada');
    console.log('');

    console.log('🎉 ¡Planificación completa creada exitosamente!');
    console.log('');
    console.log('📋 Resumen:');
    console.log(`   Plan ID: ${planId}`);
    console.log(`   Sesiones creadas: ${Object.keys(sessionIds).length}`);
    console.log(`   - Sesión 1 ID: ${sessionIds.session1}`);
    console.log(`   - Sesión 2 ID: ${sessionIds.session2}`);
    console.log(`   - Sesión 3 ID: ${sessionIds.session3}`);
    console.log(`   Bloques creados: ${Object.keys(blockIds).length}`);
    console.log(`   Ejercicios creados: ${totalEjercicios}`);
    console.log('');
    console.log('🔍 Para ver la planificación completa, visita:');
    console.log(`   GET ${API_BASE}/plans/${planId}`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('   Status:', error.response?.status);
    console.error('   URL:', error.config?.url);
  }
}

async function crearEjercicio(blockId, exerciseName, series, reps, rest, observations) {
  try {
    const response = await api.post('/exercises', {
      blockId: blockId,
      exerciseName: exerciseName,
      series: series,
      reps: reps,
      rest: rest,
      observations: observations
    });
    
    console.log(`   ✅ ${exerciseName} - ${series} series x ${reps}`);
    return response.data.exercise;
  } catch (error) {
    console.error(`   ❌ Error creando ${exerciseName}:`, error.response?.data || error.message);
    throw error;
  }
}

// Ejecutar el script
if (require.main === module) {
  crearPlanificacionCompleta();
}

module.exports = { crearPlanificacionCompleta }; 