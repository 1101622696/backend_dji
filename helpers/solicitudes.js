import { google } from 'googleapis';
import path from 'path';

const spreadsheetId = '1sJwTVoeFelYt5QE2Pk8KSYFZ8_3wRQjWr5HlDkhhrso';

// Función para crear el cliente de autenticación
const getAuth = () => {
  // Verificar si estamos en producción (Render)
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    // Usar variables de entorno
    return new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        // Añade otras variables según sea necesario
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } else {
    // Para desarrollo local, usar el archivo
    return new google.auth.GoogleAuth({
      keyFile: './config/credenciales-sheets.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }
};

// Cliente Sheets
const getSheetsClient = async () => {
  const authClient = getAuth();
  const client = await authClient.getClient();
  return google.sheets({ version: 'v4', auth: client });
};

// Obtener datos 
const obtenerDatosSolicitud = async (nombreHoja, rango = 'A1:AY1000') => {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${nombreHoja}!${rango}`,
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) return [];

  const headers = rows[0].map(h => h.trim().toLowerCase());
  return rows.slice(1).map(row =>
    Object.fromEntries(row.map((val, i) => [headers[i], val]))
  );
};

const getSolicitudesVuelo = () => obtenerDatosSolicitud('SolicitudVuelo');

const getSiguienteConsecutivo = async () => {
  const solicitudes = await getSolicitudesVuelo();
  
  const numeros = solicitudes
    .map(item => {
      const match = item.consecutivo?.match(/\d+/); // Extrae los números de SAV-0001
      return match ? parseInt(match[0], 10) : null;
    })
    .filter(n => n !== null);
  
  const max = numeros.length ? Math.max(...numeros) : 0;
  const siguiente = (max + 1).toString().padStart(4, '0');
  
  return `SAV-${siguiente}`;
};

const guardarSolicitud = async ({ proposito, fecha_inicio, hora_inicio, fecha_fin, hora_fin, empresa, peso_maximo, detalles_cronograma, departamento, municipio, tipodecontactovisualconlaua, vueloespecial }) => {
  const sheets = await getSheetsClient();
  const consecutivo = await getSiguienteConsecutivo();
  const nuevaFila = [consecutivo, proposito, fecha_inicio, hora_inicio, fecha_fin, hora_fin, empresa, peso_maximo, detalles_cronograma, departamento, municipio, tipodecontactovisualconlaua, vueloespecial];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'SolicitudVuelo!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [nuevaFila] },
  });

  return { consecutivo };
};

const getSolicitudesByStatus = async (status) => {
  const solicitudes = await getSolicitudesVuelo();
  return solicitudes.filter(solicitud => 
    solicitud.estado && solicitud.estado.toLowerCase() === status.toLowerCase()
  );
};
const getSolicitudesByEmail = async (email) => {
  const solicitudes = await getSolicitudesVuelo();
  return solicitudes.filter(solicitud => 
    solicitud.usuario && solicitud.usuario.toLowerCase() === email.toLowerCase()
  );
};
const getSolicitudesByEmailAndStatus = async (email, status) => {
  const solicitudes = await getSolicitudesVuelo();
  return solicitudes.filter(solicitud => 
    solicitud.usuario && 
    solicitud.usuario.toLowerCase() === email.toLowerCase() &&
    solicitud.estado && 
    solicitud.estado.toLowerCase() === status.toLowerCase()
  );
};
export const solicitudHelper = {
  getSolicitudesVuelo,
  guardarSolicitud,
  getSolicitudesByStatus,
  getSolicitudesByEmail,
  getSolicitudesByEmailAndStatus
};