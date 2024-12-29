// Importación de dependencias
const express = require('express');
const { authenticate } = require('./auth'); // Llamada a la función authenticate
const { google } = require('googleapis'); // Importa googleapis

// Crear la app de express
const app = express();
const port = process.env.PORT || 3000;

// Ruta para iniciar la autenticación
app.get('/auth', (req, res) => {
  const authUrl = getAuthUrl(); // Obtiene la URL de autenticación desde Google
  res.redirect(authUrl);
});

// Ruta para manejar la redirección de Google después de aceptar permisos
app.get('/', async (req, res) => {
  const code = req.query.code; // Código de autorización que Google envía

  if (!code) {
    res.status(400).send('Código de autorización no recibido');
    return;
  }

  try {
    const authClient = await authenticate(code); // Usa el código para obtener el token
    res.json({ success: true, message: 'Autenticación exitosa', authClient });
  } catch (error) {
    console.error('Error en la autenticación:', error.message);
    res.status(500).json({ success: false, message: 'Error en la autenticación', error: error.message });
  }
});

// Función para obtener la URL de autenticación
function getAuthUrl() {
  const credentials = require('./credentials.json');
  const { client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, credentials.installed.client_secret, redirect_uris[0]);
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/classroom.courses.readonly',
      'https://www.googleapis.com/auth/classroom.rosters.readonly',
      'https://www.googleapis.com/auth/classroom.coursework.me'
    ]
  });
  return authUrl;
}

/* Rutas especificas. */
const cors = require('cors'); 
const { listarCursos, obtenerEstudiantes, obtenerTareas, obtenerEntregas, exportarEstudiantesAExcel } = require('./conexionAPI');

// Middleware para manejar CORS (Cross-Origin Resource Sharing)
app.use(cors()); 

// Middleware para servir archivos estaticos (como index.html)
const path = require('path');
app.use(express.static(path.join(__dirname, '../Frontend')));

// Ruta para obtener los cursos
app.get('/api/cursos', async (req, res) => {
  try {
    const cursos = await listarCursos();
    res.json(cursos); // envio la lista de los cursos al frontend
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener los cursos. ' });
  }
});

// Ruta para obtener estudiantes de un curso
app.get('/api/estudiantes/:courseId', async (req, res) => {
  const { courseId } = req.params;
  try {
    const estudiantes = await obtenerEstudiantes(courseId);
    res.json(estudiantes); // envia la lista de estudiantes al frontend
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener los estudiantes. '});
  }
}); 

// Ruta para obtener las tareas del curso
app.get('/api/tareas/:courseId', async (req, res) => {
  const { courseId } = req.params;
  try {
    const tareas = await obtenerTareas(courseId);
    res.json(tareas); // envia la lista de tareas al frontend
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener las tareas. '});
  }
});

// Ruta para obtener las entregas de una tarea
app.get('/api/entregas/:courseId', async (req, res) => {
  const { courseId, tareaId } = req.params;
  try {
    const entregas = await obtenerEntregas(courseId, tareaId);
    res.json(entregas); // envia la lista de entregas al fronted
  } catch (error) {
    res.status(500).json({ Error: 'No se pudo obtener las entregas. '});
  }
});

// Ruta para exportar estudiantes a Excel
app.post('/api/exportar-estudiantes/:courseId', async (req, res) => {
  const { courseId } = req.params;
  try {
    await exportarEstudiantesAExcel(courseId);
    res.json({ success: true, message: 'Estudiantes exportados correctamente.' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo exportar los estudiantes.' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});