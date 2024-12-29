// Importa las bibliotecas necesarias para interactuar con Google Apps
const { google } = require('googleapis');
const { authenticate } = require('./auth');

/**
 * Función para listar los cursos disponibles en Google Classroom.
 */
async function listarCursos() {
  try {
    const auth = await authenticate();
    const classroom = google.classroom({ version: 'v1', auth });
    const response = await classroom.courses.list();
    const cursos = response.data.courses || [];

    if (cursos.length === 0) {
      console.log('No hay cursos disponibles.');
    } else {
      console.log('Cursos disponibles:');
      cursos.forEach((curso) => {
        console.log(`ID: ${curso.id}, Nombre: ${curso.name}`);
      });
    }
  } catch (error) {
    console.error('Error al listar los cursos:', error.message);
  }
}

/**
 * Función para obtener la lista de estudiantes de un curso específico.
 * @param {string} courseId - ID del curso.
 */
async function obtenerEstudiantes(courseId) {
  try {
    const auth = await authenticate();
    const classroom = google.classroom({ version: 'v1', auth });
    const response = await classroom.courses.students.list({ courseId });
    const estudiantes = response.data.students || [];

    if (estudiantes.length === 0) {
      console.log('No hay estudiantes en este curso.');
    } else {
      console.log('Estudiantes del curso:');
      estudiantes.forEach((student) => {
        console.log(`Nombre: ${student.profile.name.fullName}, Email: ${student.profile.emailAddress}`);
      });
    }
  } catch (error) {
    console.error('Error al obtener los estudiantes:', error.message);
  }
}

/**
 * Función para exportar la lista de estudiantes de un curso a una hoja de cálculo.
 * @param {string} courseId - ID del curso.
 */
async function exportarEstudiantesAExcel(courseId) {
  try {
    const auth = await authenticate();
    const classroom = google.classroom({ version: 'v1', auth });
    const response = await classroom.courses.students.list({ courseId });
    const estudiantes = response.data.students || [];

    if (estudiantes.length === 0) {
      console.log('No hay estudiantes inscritos en este curso.');
      return;
    }

    // Crear una hoja de cálculo y escribir los datos
    const { GoogleSpreadsheet } = require('google-spreadsheet');
    const doc = new GoogleSpreadsheet('<SPREADSHEET_ID>');

    await doc.useServiceAccountAuth(require('./credentials.json'));
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0]; // Supone que trabajas con la primera hoja

    // Escribir encabezados
    await sheet.setHeaderRow(['ID del Estudiante', 'Nombre', 'Correo Electrónico']);

    // Escribir datos de estudiantes
    const rows = estudiantes.map((student) => ({
      'ID del Estudiante': student.userId,
      'Nombre': student.profile.name.fullName,
      'Correo Electrónico': student.profile.emailAddress,
    }));

    await sheet.addRows(rows);
    console.log('Archivo generado con éxito:', doc.spreadsheetId);
  } catch (error) {
    console.error('Error al exportar estudiantes:', error.message);
  }
}

/**
 * Función para obtener la lista de tareas de un curso específico.
 * @param {string} courseId - ID del curso.
 */
async function obtenerTareas(courseId) {
  try {
    const auth = await authenticate();
    const classroom = google.classroom({ version: 'v1', auth });
    const response = await classroom.courses.courseWork.list({ courseId });
    const tareas = response.data.courseWork || [];

    if (tareas.length === 0) {
      console.log('No hay tareas asignadas.');
    } else {
      console.log('Tareas del curso:');
      tareas.forEach((tarea) => {
        console.log(`ID de la tarea: ${tarea.id}, Título: ${tarea.title}`);
      });
    }
  } catch (error) {
    console.error('Error al obtener las tareas:', error.message);
  }
}

/**
 * Función para verificar las entregas de una tarea específica.
 * @param {string} courseId - ID del curso.
 * @param {string} tareaId - ID de la tarea.
 */
async function obtenerEntregas(courseId, tareaId) {
  try {
    const auth = await authenticate();
    const classroom = google.classroom({ version: 'v1', auth });
    const response = await classroom.courses.courseWork.studentSubmissions.list({
      courseId,
      courseWorkId: tareaId,
    });
    const entregas = response.data.studentSubmissions || [];

    if (entregas.length === 0) {
      console.log('No se han realizado entregas.');
    } else {
      entregas.forEach((entrega) => {
        console.log(`Estudiante ID: ${entrega.userId}, Estado: ${entrega.state}`);
      });
    }
  } catch (error) {
    console.error('Error al obtener las entregas:', error.message);
  }
}

module.exports = {
  listarCursos,
  obtenerEstudiantes,
  exportarEstudiantesAExcel,
  obtenerTareas,
  obtenerEntregas,
};
