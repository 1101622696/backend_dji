import { google } from 'googleapis';
import stream from 'stream';

const spreadsheetId = '1sJwTVoeFelYt5QE2Pk8KSYFZ8_3wRQjWr5HlDkhhrso';

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
        'https://www.googleapis.com/auth/drive'],
    });
  } else {
    // Para desarrollo local, usar el archivo
    return new google.auth.GoogleAuth({
      keyFile: './config/credenciales-sheets.json',
      scopes: [        
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'],
    });
  }
};

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
const obtenerDatosDrones = async (nombreHoja, rango = 'A1:Z1000') => {
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

const getDrones = () => obtenerDatosDrones('3.Drones');

const getSiguienteCodigo = async () => {
  const drones = await getDrones();
  
  const numeros = drones
    .map(item => {
      const match = item.codigo?.match(/\d+/); // Extrae los números de SAV-0001
      return match ? parseInt(match[0], 10) : null;
    })
    .filter(n => n !== null);
  
  const max = numeros.length ? Math.max(...numeros) : 0;
  const siguiente = (max + 1).toString().padStart(1, '0');
  
  return `D-${siguiente}`;
};

const guardarDron = async ({ numeroSerie, marca, modelo, peso, dimensiones, autonomiavuelo, alturaMaxima, velocidadMaxima, fechaCompra, capacidadBateria, tipoCamarasSensores, Link, fechadecreacion, estado, fechapoliza, tiempoacumulado, distanciaacumulada, vuelosrealizados, contratodron, ubicaciondron, ocupadodron }) => {
  const sheets = await getSheetsClient();
  const codigo = await getSiguienteCodigo();
  const nuevaFila = [codigo, numeroSerie, marca, modelo, peso, dimensiones, autonomiavuelo, alturaMaxima, velocidadMaxima, fechaCompra, capacidadBateria, tipoCamarasSensores, Link, fechadecreacion, estado, fechapoliza, tiempoacumulado, distanciaacumulada, vuelosrealizados, contratodron, ubicaciondron, ocupadodron];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: '3.Drones!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [nuevaFila] },
  });

  return { codigo };
};
const getDronesByStatus = async (status) => {
  const drones = await getDrones();
  return drones.filter(dron => 
    dron["estado-dron"] && dron["estado-dron"].toLowerCase() === status.toLowerCase()
  );
};

const getDronesByStatusyOcupado = async (status, ocupado) => {
  const drones = await getDrones();
  return drones.filter(dron => 
    dron["estado-dron"] && dron["estado-dron"].toLowerCase() === status.toLowerCase()  &&
    dron["ocupado_dron"] && dron["ocupado_dron"].toLowerCase() === ocupado.toLowerCase()
  );
};

const getDronByNumeroserie = async (numeroserie) => {
  const drones = await getDrones();
  return drones.find(dron => 
    dron.numeroserie && dron.numeroserie.toLowerCase() === numeroserie.toLowerCase()
  );
};

const ordenarDronesPorCampoNumerico = (drones, campo, orden = 'desc') => {
  return drones.sort((a, b) => {
    const valorA = parseFloat(a[campo]) || 0;
    const valorB = parseFloat(b[campo]) || 0;
    
    return orden.toLowerCase() === 'desc' ? valorB - valorA : valorA - valorB;
  });
};
const filtrarDronesPorCampoTexto = (drones, campo, valor) => {
  return drones.filter(dron => 
    dron[campo] && dron[campo].toLowerCase() === valor.toLowerCase()
  );
};
const getDronesPorOcupacion = async (valor) => {
  const drones = await getDrones();
  return filtrarDronesPorCampoTexto(drones, "ocupado_dron", valor);
};

const getDronesPorEstado = async (valor) => {
  const drones = await getDrones();
  return filtrarDronesPorCampoTexto(drones, "estado-dron", valor);
};

const getDronesOrdenadosPorFechaPoliza = async (orden = 'desc') => {
  const drones = await getDrones();
  
  return drones.sort((a, b) => {
    const fechaA = new Date(a["fecha de póliza"] || 0);
    const fechaB = new Date(b["fecha de póliza"] || 0);
    
    return orden.toLowerCase() === 'desc' ? fechaB - fechaA : fechaA - fechaB;
  });
};

const getDronOrdenadosPorTiempo = async (orden = 'desc') => {
  const drones = await getDrones();
  return ordenarDronesPorCampoNumerico(drones, "tiempo acumulado-dron", orden);
};

const getDronOrdenadosPorDistancia = async (orden = 'desc') => {
  const drones = await getDrones();
  return ordenarDronesPorCampoNumerico(drones, "distancia acumulada-dron", orden);
};

const getDronOrdenadosPorVuelos = async (orden = 'desc') => {
  const drones = await getDrones();
  return ordenarDronesPorCampoNumerico(drones, "vuelos realizados-dron", orden);
};

const getDronOrdenadosPorPeso = async (orden = 'desc') => {
  const drones = await getDrones();
  return ordenarDronesPorCampoNumerico(drones, "peso", orden);
};

const getDronOrdenadosPorVelocidad = async (orden = 'desc') => {
  const drones = await getDrones();
  return ordenarDronesPorCampoNumerico(drones, "velocidadmaxima", orden);
};


const editarDronporNumeroserie = async (numeroserie, nuevosDatos) => {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: '3.Drones!A2:N', 
  });

  const filas = response.data.values;
  const filaIndex = filas.findIndex(fila => fila[1]?.toLowerCase() === numeroserie.toLowerCase());

  if (filaIndex === -1) {
    return null; 
  }

  // teer los datos actuales
  const filaActual = filas[filaIndex];
  
  const filaEditada = [
    filaActual[0], 
    nuevosDatos.numeroSerie || filaActual[1],
    nuevosDatos.marca || filaActual[2],
    nuevosDatos.modelo || filaActual[3],
    nuevosDatos.peso || filaActual[4],
    nuevosDatos.dimensiones || filaActual[5],
    nuevosDatos.autonomiavuelo || filaActual[6],
    nuevosDatos.alturaMaxima || filaActual[7],
    nuevosDatos.velocidadMaxima || filaActual[8],
    nuevosDatos.fechaCompra || filaActual[9],
    nuevosDatos.capacidadBateria || filaActual[10],
    nuevosDatos.tipoCamarasSensores || filaActual[11],
    nuevosDatos.Link || filaActual[12],
    filaActual[13], 
    filaActual[14], 
    nuevosDatos.contratodron || filaActual[15],
    filaActual[16], 
    filaActual[17], 
    filaActual[18], 
    nuevosDatos.contratodron || filaActual[19],
    nuevosDatos.ubicaciondron || filaActual[20],
    nuevosDatos.ubicaciondron || filaActual[21],
  ];

  const filaEnHoja = filaIndex + 2;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `3.Drones!A${filaEnHoja}:V${filaEnHoja}`,
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
  try {
    const drive = await getDriveClient();

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
  } catch (error) {
    console.error('Error subiendo archivo:', error.message);
    throw error;
  }
};

const procesarArchivos = async (archivos, numeroSerie) => {
  if (!archivos || archivos.length === 0) {
    return null;
  }
  
  // ID de la carpeta padre que proporcionaste
  const carpetaPadreId = '1LPVkbgDSu3lfv0visAqh_kVrile_Twbl';
  
  // Crear una carpeta con el nombre del numeroSerie
  let carpeta = await buscarCarpetaPorNombre(numeroSerie, carpetaPadreId);
  
  if (!carpeta) {
    carpeta = await crearCarpeta(numeroSerie, carpetaPadreId);
  }
  
  // Subir cada archivo a la carpeta creada
  const enlaces = [];
  for (const archivo of archivos) {
    const enlace = await subirArchivo(archivo, carpeta.id);
    enlaces.push(enlace);
  }
  
  // Devolver el enlace a la carpeta
  return carpeta.webViewLink;
};

// Corregido: actualizarEstadoEnSheets
const actualizarEstadoEnSheets = async (numeroserie, nuevoEstado = "activo") => {
  try {
    const sheets = await getSheetsClient();
    
    // Primero, obtener todos los datos para encontrar la fila del numeroSerie
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: '3.Drones',
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No se encontraron datos en la hoja');
    }
    
    // Determinar qué columna contiene el numeroSerie y el estado
    const headers = rows[0];
    const numeroSerieIndex = headers.findIndex(header => 
      header.toLowerCase() === 'numeroserie');
    const estadoIndex = headers.findIndex(header => 
      header.toLowerCase() === 'estado-dron');
    
    if (numeroSerieIndex === -1 || estadoIndex === -1) {
      throw new Error('No se encontraron las columnas necesarias');
    }
    
    // Encontrar la fila que corresponde al numeroSerie
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][numeroSerieIndex] && 
          rows[i][numeroSerieIndex].toLowerCase() === numeroserie.toLowerCase()) {
        rowIndex = i;
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error(`No se encontró el numero de Serie ${numeroserie}`);
    }
    
    // Actualizar el estado en Google Sheets
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `3.Drones!${getColumnLetter(estadoIndex + 1)}${rowIndex + 1}`,
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

export const dronHelper = {
  getDrones,
  guardarDron,
  getDronesByStatus,
  getDronesByStatusyOcupado,
  getDronByNumeroserie,
  getDronOrdenadosPorTiempo,
  getDronOrdenadosPorDistancia,
  getDronOrdenadosPorVuelos,
  getDronOrdenadosPorVelocidad,
  getDronOrdenadosPorPeso,
  getDronesOrdenadosPorFechaPoliza,
  getDronesPorOcupacion,
  getDronesPorEstado,
  editarDronporNumeroserie,
  procesarArchivos,
  actualizarEstadoEnSheets,
  subirArchivosACarpetaExistente,
  buscarCarpetaPorNombre
};