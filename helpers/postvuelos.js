import { google } from 'googleapis';
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
// Obtener datos 
const obtenerDatosPostvuelo = async (nombreHoja, rango = 'A1:S1000') => {
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

const getPostvuelos = () => obtenerDatosPostvuelo('PostVuelo');

const getSiguienteConsecutivo = async () => {
  const postvuelos = await getPostvuelos();
  
  const numeros = postvuelos
    .map(item => {
      const match = item["id - postvuelo"]?.match(/\d+/); 
      return match ? parseInt(match[0], 10) : null;
    })
    .filter(n => n !== null);
  
  const max = numeros.length ? Math.max(...numeros) : 0;
  const siguiente = (max + 1).toString().padStart(1, '0');
  
  return `PV-${siguiente}`;
};

const guardarPostvuelo = async ({ consecutivo, username, dronusado, fechaInicio, horaInicio, horaFin, duracion, distanciaRecorrida, alturaMaxima, incidentes, propositoAlcanzado, observacionesVuelo, fechadeCreacion, Link, useremail, estado, proposito, empresa }) => {
  const sheets = await getSheetsClient();
  const idPostvuelo = await getSiguienteConsecutivo();
  const nuevaFila = [idPostvuelo, consecutivo, username, dronusado, fechaInicio, horaInicio, horaFin, duracion, distanciaRecorrida, alturaMaxima, incidentes, propositoAlcanzado, observacionesVuelo, fechadeCreacion, Link, useremail, estado, proposito, empresa];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Postvuelo!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [nuevaFila] },
  });

  return { idPostvuelo };
};

  const getPostvuelosByStatus = async (status) => {
    const postvuelos = await getPostvuelos();
    return postvuelos.filter(postvuelo => 
      postvuelo["estado del postvuelo"] && postvuelo["estado del postvuelo"].toLowerCase() === status.toLowerCase()
    );
  };
  const getEsPostvueloPendiente = async (consecutivo) => {
    const postvuelo = await getPostvueloByConsecutivo(consecutivo);
    return postvuelo && postvuelo["estado del postvuelo"] && postvuelo["estado del postvuelo"].toLowerCase() === 'pendiente';
  };
  const getPostvuelosByEmail = async (email) => {
    const postvuelos = await getPostvuelos();
    return postvuelos.filter(postvuelo => 
      postvuelo.usuario && postvuelo.usuario.toLowerCase() === email.toLowerCase()
    );
  };
  const getPostvuelosByEmailAndStatus = async (email, status) => {
    const postvuelos = await getPostvuelos();
    return postvuelos.filter(postvuelo => 
      postvuelo["correo de usuario"] && 
      postvuelo["correo de usuario"].toLowerCase() === email.toLowerCase() &&
      postvuelo["estado del postvuelo"] && 
      postvuelo["estado del postvuelo"].toLowerCase() === status.toLowerCase()
    );
  };
  const getPostvueloByConsecutivo = async (consecutivo) => {
    const postvuelos = await getPostvuelos();
    return postvuelos.find(postvuelo => 
      postvuelo["consecutivo-solicitud"] && postvuelo["consecutivo-solicitud"].toLowerCase() === consecutivo.toLowerCase()
    );
  };

const getPostvuelosConEtapas = async () => {
  try {
    const postvuelos = await getPostvuelos();
    
    return postvuelos.map(postvuelo => {
      return {
        ...postvuelo,
        solicitudExiste: true, // Si hay postvuelo, la solicitud debe existir
        solicitudAprobada: true, // Si hay postvuelo, la solicitud debe estar aprobada
        prevueloExiste: true, // Si hay postvuelo, el prevuelo debe existir
        prevueloAprobado: true, // Si hay postvuelo, el prevuelo debe estar aprobado
        postvueloExiste: true, // El postvuelo obviamente existe
        postvueloAprobado: postvuelo["estado del postvuelo"] === "Aprobado",
        estadoProceso: postvuelo["estado del postvuelo"] === "Aprobado" 
          ? 'Proceso Completado' 
          : 'Postvuelo pendiente de aprobación'
      };
    });
  } catch (error) {
    console.error('Error al obtener postvuelos con etapas:', error);
    throw error;
  }
};

const getPostvueloConEtapas = async (consecutivo) => {
  try {
    const postvuelos = await getPostvuelos();
    const postvuelo = postvuelos.find(p => p['consecutivo-solicitud'] === consecutivo);
    
    if (!postvuelo) {
      return null;
    }
    
    return {
      ...postvuelo,
      solicitudExiste: true,
      solicitudAprobada: true,
      prevueloExiste: true,
      prevueloAprobado: true,
      postvueloExiste: true,
      postvueloAprobado: postvuelo["estado del postvuelo"] === "Aprobado",
      estadoProceso: postvuelo["estado del postvuelo"] === "Aprobado" 
        ? 'Proceso Completado' 
        : 'Postvuelo pendiente de aprobación'
    };
  } catch (error) {
    console.error('Error al obtener postvuelo con etapas:', error);
    throw error;
  }
};

  const editarPostvueloPorConsecutivo = async (consecutivo, nuevosDatos) => {
    const sheets = await getSheetsClient();
  
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'PostVuelo!A2:N', 
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
        filaActual[1], 
        filaActual[2], 
        filaActual[3], 
        filaActual[4], 
    nuevosDatos.horaInicio || filaActual[5],
    nuevosDatos.horaFin || filaActual[6],
    nuevosDatos.duracion || filaActual[7],
    nuevosDatos.distanciaRecorrida || filaActual[8],
    nuevosDatos.alturaMaxima || filaActual[9],
    nuevosDatos.incidentes || filaActual[10],
    nuevosDatos.propositoAlcanzado || filaActual[11],
    nuevosDatos.observacionesVuelo || filaActual[12],
    filaActual[13], 
    nuevosDatos.Link || filaActual[14],
    filaActual[15], 
    filaActual[16], 
    filaActual[17], 
    filaActual[18], 
    ];
  
    const filaEnHoja = filaIndex + 2;
  
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `PostVuelo!A${filaEnHoja}:S${filaEnHoja}`,
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
  const carpetaPadreId = '1-P0Y8rdlvgZaEsnPVN4hzf42pWhH1WY1';
  
  // Crear una carpeta con el nombre del consecutivo
  const carpeta = await buscarCarpetaPorNombre(consecutivo, carpetaPadreId);
  
  // Buscar si ya existe una carpeta con el nombre del consecutivo
  if (!carpeta) {
    carpeta = await crearCarpeta(consecutivo, carpetaPadreId);
  }
  
  // Si no existe, crearla
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
      range: 'PostVuelo',
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No se encontraron datos en la hoja');
    }
    
    // Determinar qué columna contiene el consecutivo y el estado
    const headers = rows[0];
    const consecutivoIndex = headers.findIndex(header => 
      header.toLowerCase() === 'consecutivo-solicitud');
    const estadoIndex = headers.findIndex(header => 
      header.toLowerCase() === 'estado del postvuelo');
    
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
      range: `PostVuelo!${getColumnLetter(estadoIndex + 1)}${rowIndex + 1}`,
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

function getColumnLetter(columnNumber) {
  let columnLetter = '';
  while (columnNumber > 0) {
    const remainder = (columnNumber - 1) % 26;
    columnLetter = String.fromCharCode(65 + remainder) + columnLetter;
    columnNumber = Math.floor((columnNumber - 1) / 26);
  }
  return columnLetter;
}

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

export const postvueloHelper = {
  getPostvuelos,
  guardarPostvuelo,
  getPostvuelosByStatus,
  getEsPostvueloPendiente,
  getPostvuelosByEmail,
  getPostvuelosByEmailAndStatus,
  getPostvueloByConsecutivo,
  getPostvuelosConEtapas,
  getPostvueloConEtapas,
  editarPostvueloPorConsecutivo,
  procesarArchivos,
  getSiguienteConsecutivo,
  actualizarEstadoEnSheets,
  buscarCarpetaPorNombre,
  subirArchivosACarpetaExistente

};