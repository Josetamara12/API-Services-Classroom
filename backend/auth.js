// Importación de dependencias
const { google } = require('googleapis');
const fs = require('fs').promises;
const readline = require('readline');

// Definición de los permisos necesarios para acceder a las APIs de Google Classroom
const SCOPES = process.env.SCOPES || [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me',
];

// Rutas de los archivos de credenciales y token
const TOKEN_PATH = process.env.TOKEN_PATH || 'token.json';
const CREDENTIALS_PATH = process.env.CREDENTIALS_PATH || 'credentials.json';

/**
 * Carga las credenciales desde el archivo local.
 * @returns {Promise<Object>} Las credenciales instaladas del cliente.
 */
async function loadCredentials() {
  try {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const parsedCredentials = JSON.parse(content);
    if (!parsedCredentials.installed) {
      throw new Error('Invalid credentials format. Expected "installed" key.');
    }
    return parsedCredentials.installed;
  } catch (err) {
    throw new Error('Error loading credentials: ' + err.message);
  }
}

/**
 * Autentica al cliente usando las credenciales y el token almacenado (si existe).
 * Si no hay token, inicia el flujo de autenticación.
 * @param {string} [code] Código de autorización, si existe.
 * @returns {Promise<google.auth.OAuth2>} Cliente OAuth2 autenticado.
 */
async function authenticate(code) {
  const credentials = await loadCredentials();
  const { client_secret, client_id, redirect_uris } = credentials;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  try {
    if (code) {
      // Si se recibe un código, obtenemos el token usando ese código
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      // Guarda el token para uso futuro
      await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
      console.log('Token stored to', TOKEN_PATH);
    } else {
      // Si no hay código, intenta cargar el token almacenado
      const token = await fs.readFile(TOKEN_PATH);
      oAuth2Client.setCredentials(JSON.parse(token));
    }
    return oAuth2Client;
  } catch (err) {
    throw new Error('Error authenticating with Google: ' + err.message);
  }
}

module.exports = { authenticate };
