import { google } from 'googleapis';
import path from 'path';
import stream from 'stream';
import { prevueloHelper } from '../helpers/prevuelos.js';
import {postvueloHelper} from '../helpers/postvuelos.js';

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

const guardarSolicitud = async ({ useremail, username, tipodeoperacionaerea, empresa, fecha_inicio, hora_inicio, fecha_fin, hora_fin, detalles_cronograma, peso_maximo, municipio, departamento, tipodecontactovisualconlaua, vueloespecial, justificacionvueloespecial, poligononombre, altura_poligono, latitud_poligono_1, longitud_poligono_1, latitud_poligono_2, longitud_poligono_2, latitud_poligono_3, longitud_poligono_3, latitud_poligono_4, longitud_poligono_4, latitud_poligono_5, longitud_poligono_5, tramolinealnombre, altura_tramo, latitud_tramo_1, longitud_tramo_1, latitud_tramo_2, longitud_tramo_2, latitud_tramo_3, longitud_tramo_3, latitud_tramo_4, longitud_tramo_4, latitud_tramo_5, longitud_tramo_5, circuferenciaencoordenadayradionombre, altura_circunferencia, latitud_circunferencia_1, longitud_circunferencia_1, check_kmz, Link, estado, fechadeCreacion, realizado }) => {
  const sheets = await getSheetsClient();
  const consecutivo = await getSiguienteConsecutivo();
  const nuevaFila = [consecutivo, useremail, username, tipodeoperacionaerea, empresa, fecha_inicio, hora_inicio, fecha_fin, hora_fin, detalles_cronograma, peso_maximo, municipio, departamento, tipodecontactovisualconlaua, vueloespecial, justificacionvueloespecial, poligononombre, altura_poligono, latitud_poligono_1, longitud_poligono_1, latitud_poligono_2, longitud_poligono_2, latitud_poligono_3, longitud_poligono_3, latitud_poligono_4, longitud_poligono_4, latitud_poligono_5, longitud_poligono_5, tramolinealnombre, altura_tramo, latitud_tramo_1, longitud_tramo_1, latitud_tramo_2, longitud_tramo_2, latitud_tramo_3, longitud_tramo_3, latitud_tramo_4, longitud_tramo_4, latitud_tramo_5, longitud_tramo_5, circuferenciaencoordenadayradionombre, altura_circunferencia, latitud_circunferencia_1, longitud_circunferencia_1, check_kmz, Link, estado, fechadeCreacion, realizado, username, useremail];

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
const getEssolicitudPendiente = async (consecutivo) => {
  const solicitud = await getSolicitudesByConsecutivo(consecutivo);
  return solicitud && solicitud.estado && solicitud.estado.toLowerCase() === 'pendiente';
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

const getSolicitudConEtapas = async (consecutivo) => {
  try {
    const solicitudes = await getSolicitudesVuelo();
    const solicitud = solicitudes.find(s => s.consecutivo === consecutivo);
    
    if (!solicitud) {
      return null;
    }
    
    // Comprobaciones dependientes en cascada
    const solicitudExiste = true;
    const solicitudAprobada = solicitud.estado === 'Aprobado';
    
    // Solo buscar prevuelo si la solicitud está aprobada
    let prevuelo = null;
    let prevueloExiste = false;
    let prevueloAprobado = false;
    
    if (solicitudAprobada) {
      const prevuelos = await prevueloHelper.getPrevuelos();
      prevuelo = prevuelos.find(p => p.solicitudesaprobadas === consecutivo);
      prevueloExiste = !!prevuelo;
      prevueloAprobado = prevuelo ? prevuelo["estado del prevuelo"] === "Aprobado" : false;
    }
    
    // Solo buscar postvuelo si el prevuelo existe y está aprobado
    let postvuelo = null;
    let postvueloExiste = false;
    let postvueloAprobado = false;
    
    if (prevueloExiste && prevueloAprobado) {
      const postvuelos = await postvueloHelper.getPostvuelos();
      postvuelo = postvuelos.find(p => p['consecutivo-solicitud'] === consecutivo);
      postvueloExiste = !!postvuelo;
      postvueloAprobado = postvuelo ? postvuelo["estado del postvuelo"] === "Aprobado" : false;
    }
    
    return {
      solicitud,
      solicitudExiste,
      solicitudAprobada,
      prevueloExiste,
      prevueloAprobado,
      postvueloExiste,
      postvueloAprobado,
      estadoProceso: determinarEstadoProceso(
        solicitudExiste, 
        solicitudAprobada, 
        prevueloExiste, 
        prevueloAprobado, 
        postvueloExiste, 
        postvueloAprobado
      )
    };
  } catch (error) {
    console.error('Error al obtener solicitud con etapas:', error);
    throw error;
  }
};

// Función determinarEstadoProceso refactorizada
const determinarEstadoProceso = (
  solicitudExiste, 
  solicitudAprobada, 
  prevueloExiste, 
  prevueloAprobado, 
  postvueloExiste, 
  postvueloAprobado
) => {
  if (!solicitudExiste) return 'Desconocido';
  
  if (!solicitudAprobada) {
    return 'Pendiente de aprobación';
  }
  
  if (!prevueloExiste) {
    return 'Solicitud aprobada, pendiente de prevuelo';
  }
  
  if (!prevueloAprobado) {
    return 'Prevuelo pendiente de aprobación';
  }
  
  if (!postvueloExiste) {
    return 'Prevuelo aprobado, pendiente de postvuelo';
  }
  
  if (!postvueloAprobado) {
    return 'Postvuelo pendiente de aprobación';
  }
  
  return 'Proceso Completado';
};

// También refactorizamos getAllSolicitudesConEtapas
const getAllSolicitudesConEtapas = async () => {
  try {
    const solicitudes = await getSolicitudesVuelo();
    const prevuelos = await prevueloHelper.getPrevuelos();
    const postvuelos = await postvueloHelper.getPostvuelos();
    
    return solicitudes.map(solicitud => {
      const solicitudExiste = true;
      const solicitudAprobada = solicitud.estado === 'Aprobado';
      
      let prevueloExiste = false;
      let prevueloAprobado = false;
      
      if (solicitudAprobada) {
        const prevuelo = prevuelos.find(p => p.solicitudesaprobadas === solicitud.consecutivo);
        prevueloExiste = !!prevuelo;
        prevueloAprobado = prevuelo ? prevuelo["estado del prevuelo"] === "Aprobado" : false;
      }
      
      let postvueloExiste = false;
      let postvueloAprobado = false;
      
      if (prevueloExiste && prevueloAprobado) {
        const postvuelo = postvuelos.find(p => p['consecutivo-solicitud'] === solicitud.consecutivo);
        postvueloExiste = !!postvuelo;
        postvueloAprobado = postvuelo ? postvuelo["estado del postvuelo"] === "Aprobado" : false;
      }
      
      return {
        ...solicitud,
        solicitudExiste,
        solicitudAprobada,
        prevueloExiste,
        prevueloAprobado,
        postvueloExiste,
        postvueloAprobado,
        estadoProceso: determinarEstadoProceso(
          solicitudExiste, 
          solicitudAprobada, 
          prevueloExiste, 
          prevueloAprobado, 
          postvueloExiste, 
          postvueloAprobado
        )
      };
    });
  } catch (error) {
    console.error('Error al obtener todas las solicitudes con etapas:', error);
    throw error;
  }
};

const editarSolicitudPorConsecutivo = async (consecutivo, nuevosDatos) => {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'SolicitudVuelo!A2:N', 
  });

  const filas = response.data.values;
  const filaIndex = filas.findIndex(fila => fila[0]?.toLowerCase() === consecutivo.toLowerCase());

  if (filaIndex === -1) {
    return null; 
  }

  // teer los datos actuales
  const filaActual = filas[filaIndex];
  
  const filaEditada = [
    filaActual[0], 
    nuevosDatos.useremail || filaActual[1],
    nuevosDatos.username || filaActual[2], 
    nuevosDatos.tipodeoperacionaerea || filaActual[3], 
    nuevosDatos.empresa || filaActual[4],
    nuevosDatos.fecha_inicio || filaActual[5], 
    nuevosDatos.hora_inicio || filaActual[6], 
    nuevosDatos.fecha_fin || filaActual[7], 
    nuevosDatos.hora_fin || filaActual[8], 
    nuevosDatos.detalles_cronograma || filaActual[9], 
    nuevosDatos.peso_maximo || filaActual[10], 
    nuevosDatos.municipio || filaActual[11], 
    nuevosDatos.departamento || filaActual[12], 
    nuevosDatos.tipodecontactovisualconlaua || filaActual[13], 
    nuevosDatos.vueloespecial || filaActual[14], 
    nuevosDatos.justificacionvueloespecial || filaActual[15], 
    nuevosDatos.poligononombre || filaActual[16], 
    nuevosDatos.altura_poligono || filaActual[17], 
    nuevosDatos.latitud_poligono_1 || filaActual[18], 
    nuevosDatos.longitud_poligono_1 || filaActual[19], 
    nuevosDatos.latitud_poligono_2 || filaActual[20], 
    nuevosDatos.longitud_poligono_2 || filaActual[21], 
    nuevosDatos.latitud_poligono_3 || filaActual[22], 
    nuevosDatos.longitud_poligono_3 || filaActual[23], 
    nuevosDatos.latitud_poligono_4 || filaActual[24], 
    nuevosDatos.longitud_poligono_4 || filaActual[25], 
    nuevosDatos.latitud_poligono_5 || filaActual[26], 
    nuevosDatos.longitud_poligono_5 || filaActual[27], 
    nuevosDatos.tramolinealnombre || filaActual[28], 
    nuevosDatos.altura_tramo || filaActual[29], 
    nuevosDatos.latitud_tramo_1 || filaActual[30], 
    nuevosDatos.longitud_tramo_1 || filaActual[31], 
    nuevosDatos.latitud_tramo_2 || filaActual[32], 
    nuevosDatos.longitud_tramo_2 || filaActual[33], 
    nuevosDatos.latitud_tramo_3 || filaActual[34], 
    nuevosDatos.longitud_tramo_3 || filaActual[35], 
    nuevosDatos.latitud_tramo_4 || filaActual[36], 
    nuevosDatos.longitud_tramo_4 || filaActual[37], 
    nuevosDatos.latitud_tramo_5 || filaActual[38], 
    nuevosDatos.longitud_tramo_5 || filaActual[39], 
    nuevosDatos.circuferenciaencoordenadayradionombre || filaActual[40], 
    nuevosDatos.altura_circunferencia || filaActual[41], 
    nuevosDatos.latitud_circunferencia_1 || filaActual[42], 
    nuevosDatos.longitud_circunferencia_1 || filaActual[43], 
    filaActual[44], 
    nuevosDatos.Link || filaActual[45], 
    filaActual[46], 
    filaActual[47], 
    nuevosDatos.realizado || filaActual[48], 
    nuevosDatos.username || filaActual[49], 
    nuevosDatos.useremail || filaActual[50], 
  ];

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
  
  // Buscar si ya existe una carpeta con el nombre del consecutivo
  let carpeta = await buscarCarpetaPorNombre(consecutivo, carpetaPadreId);
  
  // Si no existe, crearla
  if (!carpeta) {
    carpeta = await crearCarpeta(consecutivo, carpetaPadreId);
  }
  
  // Subir cada archivo a la carpeta (existente o recién creada)
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

const subirArchivosACarpetaExistente = async (archivos, carpetaId) => {
  if (!archivos || archivos.length === 0) {
    return null;
  }
  
  // Subir cada archivo a la carpeta existente
  const enlaces = [];
  for (const archivo of archivos) {
    const enlace = await subirArchivo(archivo, carpetaId);
    enlaces.push(enlace);
  }
  
  // Devolver el enlace a la carpeta (necesitamos obtenerlo)
  const drive = await getDriveClient();
  const carpeta = await drive.files.get({
    fileId: carpetaId,
    fields: 'webViewLink'
  });
  
  return carpeta.data.webViewLink;
};

const buscarCarpetaPorNombre = async (nombreCarpeta, parentFolderId) => {
  const drive = await getDriveClient();
  
  // Crear consulta para buscar por nombre exacto dentro de la carpeta padre
  let query = `name = '${nombreCarpeta}' and mimeType = 'application/vnd.google-apps.folder'`;
  if (parentFolderId) {
    query += ` and '${parentFolderId}' in parents`;
  }
  
  const response = await drive.files.list({
    q: query,
    fields: 'files(id, name, webViewLink)',
    spaces: 'drive'
  });
  
  return response.data.files.length > 0 ? response.data.files[0] : null;
};

export const solicitudHelper = {
  getSolicitudesVuelo,
  guardarSolicitud,
  getSolicitudesByStatus,
  getEssolicitudPendiente,
  getSolicitudesByEmail,
  getSolicitudesByEmailAndStatus,
  getSolicitudesByConsecutivo,
  getSolicitudesEnProceso,
  getSolicitudesEnProcesoPorEmail,
  getAllSolicitudesConEtapas,
  determinarEstadoProceso,
  getSolicitudConEtapas,
  editarSolicitudPorConsecutivo,
  getSiguienteConsecutivo,
  procesarArchivos,
  putSolicitudByStatus,
  subirArchivosACarpetaExistente,
  buscarCarpetaPorNombre
};