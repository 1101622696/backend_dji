import { google } from 'googleapis';
import path from 'path';
import stream from 'stream';

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
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ],
    });
  } else {
    // Para desarrollo local, usar el archivo
    return new google.auth.GoogleAuth({
      keyFile: './config/credenciales-sheets.json',
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ],
    });
  }
};

// Cliente Sheets
const getSheetsClient = async () => {
  const authClient = getAuth();
  const client = await authClient.getClient();
  return google.sheets({ version: 'v4', auth: client });
};

const getDriveClient = async () => {
  const authClient = getAuth();
  const client = await authClient.getClient();
  return google.drive({ version: 'v3', auth: client });
};

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

const guardarSolicitud = async ({ useremail, username, proposito, empresa, fecha_inicio, hora_inicio, fecha_fin, hora_fin, detalles_cronograma, peso_maximo, municipio, departamento, tipodecontactovisualconlaua, vueloespecial, justificacionvueloespecial, poligononombre, altura_poligono, latitud_poligono_1, longitud_poligono_1, latitud_poligono_2, longitud_poligono_2, latitud_poligono_3, longitud_poligono_3, latitud_poligono_4, longitud_poligono_4, latitud_poligono_5, longitud_poligono_5, tramolinealnombre, altura_tramo, latitud_tramo_1, longitud_tramo_1, latitud_tramo_2, longitud_tramo_2, latitud_tramo_3, longitud_tramo_3, latitud_tramo_4, longitud_tramo_4, latitud_tramo_5, longitud_tramo_5, circuferenciaencoordenadayradionombre, altura_circunferencia, latitud_circunferencia_1, longitud_circunferencia_1, check_kmz, Link, estado, fechadeCreacion, realizado }) => {
  const sheets = await getSheetsClient();
  const consecutivo = await getSiguienteConsecutivo();
  const nuevaFila = [consecutivo, useremail, username, proposito, empresa, fecha_inicio, hora_inicio, fecha_fin, hora_fin, detalles_cronograma, peso_maximo, municipio, departamento, tipodecontactovisualconlaua, vueloespecial, justificacionvueloespecial, poligononombre, altura_poligono, latitud_poligono_1, longitud_poligono_1, latitud_poligono_2, longitud_poligono_2, latitud_poligono_3, longitud_poligono_3, latitud_poligono_4, longitud_poligono_4, latitud_poligono_5, longitud_poligono_5, tramolinealnombre, altura_tramo, latitud_tramo_1, longitud_tramo_1, latitud_tramo_2, longitud_tramo_2, latitud_tramo_3, longitud_tramo_3, latitud_tramo_4, longitud_tramo_4, latitud_tramo_5, longitud_tramo_5, circuferenciaencoordenadayradionombre, altura_circunferencia, latitud_circunferencia_1, longitud_circunferencia_1, check_kmz, Link, estado, fechadeCreacion, realizado, username, useremail];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'SolicitudVuelo!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [nuevaFila] },
  });

  return { consecutivo };
};

const getSolicitudesByConsecutivo = async (consecutivo) => {
  const solicitudes = await getSolicitudesVuelo();
  return solicitudes.find(solicitud => 
    solicitud.consecutivo && solicitud.consecutivo.toLowerCase() === consecutivo.toLowerCase()
  );
};
const getSolicitudesByStatus = async (status) => {
  const solicitudes = await getSolicitudesVuelo();
  return solicitudes.filter(solicitud => 
    solicitud.estado && solicitud.estado.toLowerCase() === status.toLowerCase()
  );
};

const getConsecutivosPrevuelo = async () => {
  try {
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Prevuelo!C:C', 
    });
    
    if (!response.data.values || response.data.values.length === 0) {
      return [];
    }
    
    const consecutivos = response.data.values.slice(1).map(row => row[0]?.toLowerCase());
    return consecutivos.filter(Boolean); 
  } catch (error) {
    console.error('Error al obtener consecutivos de Prevuelo:', error);
    throw error;
  }
};

// Función para obtener solicitudes que no están en la hoja Prevuelo ("en proceso")
const getSolicitudesEnProceso = async () => {
  try {
    // Obtener todas las solicitudes
    const solicitudes = await getSolicitudesVuelo();
    
    // Obtener todos los consecutivos de Prevuelo
    const consecutivosPrevuelo = await getConsecutivosPrevuelo();
    
    // Filtrar las solicitudes que no están en Prevuelo
    return solicitudes.filter(solicitud => 
      solicitud.consecutivo && 
      !consecutivosPrevuelo.includes(solicitud.consecutivo.toLowerCase())
    );
  } catch (error) {
    console.error('Error al obtener solicitudes en proceso:', error);
    throw error;
  }
};

// Función para obtener solicitudes en proceso filtradas por email
const getSolicitudesEnProcesoPorEmail = async (email) => {
  try {
    // Obtener todas las solicitudes en proceso
    const solicitudesEnProceso = await getSolicitudesEnProceso();
    
    // Filtrar por el email del usuario
    return solicitudesEnProceso.filter(solicitud => 
      solicitud.usuario && 
      solicitud.usuario.toLowerCase() === email.toLowerCase()
    );
  } catch (error) {
    console.error('Error al obtener solicitudes en proceso por email:', error);
    throw error;
  }
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

const editarSolicitudPorConsecutivo = async (consecutivo, nuevosDatos) => {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'SolicitudVuelo!A2:N', 
  });

  const filas = response.data.values;
  const encabezado = [
    'consecutivo',
    'useremail',
    'username',
    'proposito',
    'empresa', 
    'fecha_inicio', 
    'hora_inicio', 
    'fecha_fin', 
    'hora_fin', 
    'detalles_cronograma', 
    'peso_maximo', 
    'municipio', 
    'departamento', 
    'tipodecontactovisualconlaua', 
    'vueloespecial', 
    'justificacionvueloespecial', 
    'poligononombre', 
    'altura_poligono', 
    'latitud_poligono_1', 
    'longitud_poligono_1', 
    'latitud_poligono_2', 
    'longitud_poligono_2', 
    'latitud_poligono_3', 
    'longitud_poligono_3', 
    'latitud_poligono_4', 
    'longitud_poligono_4', 
    'latitud_poligono_5', 
    'longitud_poligono_5', 
    'tramolinealnombre', 
    'altura_tramo', 
    'latitud_tramo_1', 
    'longitud_tramo_1', 
    'latitud_tramo_2', 
    'longitud_tramo_2', 
    'latitud_tramo_3', 
    'longitud_tramo_3', 
    'latitud_tramo_4', 
    'longitud_tramo_4', 
    'latitud_tramo_5', 
    'longitud_tramo_5', 
    'circuferenciaencoordenadayradionombre', 
    'altura_circunferencia', 
    'latitud_circunferencia_1', 
    'longitud_circunferencia_1', 
    'check_kmz', 
    'Link', 
    'estado', 
    'fechadeCreacion', 
    'realizado', 
    'username', 
    'useremail'
  ];

  const filaIndex = filas.findIndex(fila => fila[0]?.toLowerCase() === consecutivo.toLowerCase());

  if (filaIndex === -1) {
    return null; 
  }

  const filaEditada = encabezado.map((campo) => nuevosDatos[campo] ?? filas[filaIndex][encabezado.indexOf(campo)]);

  const filaEnHoja = filaIndex + 2;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `SolicitudVuelo!A${filaEnHoja}:AY${filaEnHoja}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [filaEditada],
    },
  });

  return true;
};

const crearCarpeta = async (nombreCarpeta, parentFolderId) => {
  const drive = await getDriveClient();
  
  const fileMetadata = {
    name: nombreCarpeta,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parentFolderId ? [parentFolderId] : []
  };
  
  const respuesta = await drive.files.create({
    resource: fileMetadata,
    fields: 'id, webViewLink'
  });
  
  return respuesta.data;
};

const subirArchivo = async (archivo, carpetaId) => {
  const drive = await getDriveClient();
  
  // Si estamos trabajando con buffer desde multer
  const fileMetadata = {
    name: archivo.originalname,
    parents: [carpetaId]
  };
  
  const bufferStream = new stream.PassThrough();
  bufferStream.end(archivo.buffer);
  
  const media = {
    mimeType: archivo.mimetype,
    body: bufferStream
  };
  
  const respuesta = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, webViewLink'
  });
  
  return respuesta.data.webViewLink;
};

const procesarArchivos = async (archivos, consecutivo) => {
  if (!archivos || archivos.length === 0) {
    return null;
  }
  
  // ID de la carpeta padre que proporcionaste
  const carpetaPadreId = '1iaCvCuKoK-uMelKCg2OREkFBQj8bq5fW';
  
  // Crear una carpeta con el nombre del consecutivo
  const carpeta = await crearCarpeta(consecutivo, carpetaPadreId);
  
  // Subir cada archivo a la carpeta creada
  const enlaces = [];
  for (const archivo of archivos) {
    const enlace = await subirArchivo(archivo, carpeta.id);
    enlaces.push(enlace);
  }
  
  // Devolver el enlace a la carpeta
  return carpeta.webViewLink;
};

const actualizarEstadoEnSheets = async (consecutivo, nuevoEstado = "aprobado") => {
  try {
    const sheets = await getSheetsClient();
    
    // Primero, obtener todos los datos para encontrar la fila del consecutivo
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'SolicitudVuelo',
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No se encontraron datos en la hoja');
    }
    
    // Determinar qué columna contiene el consecutivo y el estado
    const headers = rows[0];
    const consecutivoIndex = headers.findIndex(header => 
      header.toLowerCase() === 'consecutivo');
    const estadoIndex = headers.findIndex(header => 
      header.toLowerCase() === 'estado');
    
    if (consecutivoIndex === -1 || estadoIndex === -1) {
      throw new Error('No se encontraron las columnas necesarias');
    }
    
    // Encontrar la fila que corresponde al consecutivo
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][consecutivoIndex] && 
          rows[i][consecutivoIndex].toLowerCase() === consecutivo.toLowerCase()) {
        rowIndex = i;
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error(`No se encontró el consecutivo ${consecutivo}`);
    }
    
    // Actualizar el estado en Google Sheets
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `SolicitudVuelo!${getColumnLetter(estadoIndex + 1)}${rowIndex + 1}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[nuevoEstado]]
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error al actualizar el estado en Google Sheets:', error);
    throw error;
  }
};

// Función auxiliar para convertir número de columna a letra
function getColumnLetter(columnNumber) {
  let columnLetter = '';
  while (columnNumber > 0) {
    const remainder = (columnNumber - 1) % 26;
    columnLetter = String.fromCharCode(65 + remainder) + columnLetter;
    columnNumber = Math.floor((columnNumber - 1) / 26);
  }
  return columnLetter;
}

// Reemplaza tu función actual por esta:
const putSolicitudByStatus = async (consecutivo, nuevoEstado = "aprobado") => {
  return await actualizarEstadoEnSheets(consecutivo, nuevoEstado);
};



export const solicitudHelper = {
  getSolicitudesVuelo,
  guardarSolicitud,
  getSolicitudesByStatus,
  getSolicitudesByEmail,
  getSolicitudesByEmailAndStatus,
  getSolicitudesByConsecutivo,
  getSolicitudesEnProceso,
  getSolicitudesEnProcesoPorEmail,
  editarSolicitudPorConsecutivo,
  getSiguienteConsecutivo,
  procesarArchivos,
  putSolicitudByStatus
};