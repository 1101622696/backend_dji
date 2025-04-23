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
const obtenerDatosPiloto = async (nombreHoja, rango = 'A1:AB1000') => {
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

const getPilotos = () => obtenerDatosPiloto('3.Pilotos');

const getSiguienteCodigo = async () => {
  const solicitudes = await getPilotos();
  
  const numeros = solicitudes
    .map(item => {
      const match = item["id piloto"]?.match(/\d+/); 
      return match ? parseInt(match[0], 10) : null;
    })
    .filter(n => n !== null);
  
  const max = numeros.length ? Math.max(...numeros) : 0;
  const siguiente = (max + 1).toString().padStart(1, '0');
  
  return `P-${siguiente}`;
};

const guardarPiloto = async ({ nombreCompleto, primerApellido, SegundoApellido, tipoDocumento, identificacion, paisExpedicion, ciudadExpedicion, fechaExpedicion, paisNacimiento, ciudadNacimiento, fechaNacimiento, grupoSanguineo, factorRH, genero, estadoCivil, ciudadOrigen, direccion, telefonoMovil, fechaExamen, email, contratopiloto, Link, fechadecreacion, tiempoacumulado, distanciaacumulada, vuelosrealizados, estado }) => {
  const sheets = await getSheetsClient();
  const idPiloto = await getSiguienteCodigo();
  const nuevaFila = [idPiloto, nombreCompleto, primerApellido, SegundoApellido, tipoDocumento, identificacion, paisExpedicion, ciudadExpedicion, fechaExpedicion, paisNacimiento, ciudadNacimiento, fechaNacimiento, grupoSanguineo, factorRH, genero, estadoCivil, ciudadOrigen, direccion, telefonoMovil, fechaExamen, email, contratopiloto, Link, fechadecreacion, tiempoacumulado, distanciaacumulada, vuelosrealizados, estado];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: '3.Pilotos!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [nuevaFila] },
  });

  return { idPiloto };
};
const getPilotoByStatus = async (status) => {
  const pilotos = await getPilotos();
  return pilotos.filter(piloto => 
    piloto["estado piloto"] && piloto["estado piloto"].toLowerCase() === status.toLowerCase()
  );
};
const getPilotoById = async (identificacion) => {
  const pilotos = await getPilotos();
  return pilotos.find(piloto => 
    piloto["identificación"] && piloto["identificación"].toLowerCase() === identificacion.toLowerCase()
  );
};

const editarPilotoporIdentificacion = async (identificacion, nuevosDatos) => {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: '3.Pilotos!A2:N', 
  });

  const filas = response.data.values;
  const encabezado = [
    "idPiloto", 
    "nombreCompleto", 
    "primerApellido", 
    "SegundoApellido", 
    "tipoDocumento", 
    "identificacion", 
    "paisExpedicion", 
    "ciudadExpedicion", 
    "fechaExpedicion", 
    "paisNacimiento", 
    "ciudadNacimiento", 
    "fechaNacimiento", 
    "grupoSanguineo", 
    "factorRH", 
    "genero", 
    "contratopiloto", 
    "estadoCivil", 
    "ciudadOrigen", 
    "direccion", 
    "telefonoMovil", 
    "fechaExamen", 
    "email"
  ];

  const filaIndex = filas.findIndex(fila => fila[5]?.toLowerCase() === identificacion.toLowerCase());

  if (filaIndex === -1) {
    return null; 
  }

  const filaEditada = encabezado.map((campo) => nuevosDatos[campo] ?? filas[filaIndex][encabezado.indexOf(campo)]);

  const filaEnHoja = filaIndex + 2;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `3.Pilotos!A${filaEnHoja}:AB${filaEnHoja}`,
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

const procesarArchivos = async (archivos, identificacion) => {
  if (!archivos || archivos.length === 0) {
    return null;
  }
  
  // ID de la carpeta padre que proporcionaste
  const carpetaPadreId = '1Ys_okDNkr4RalNdDFLGW4jlNTmsEPAjS';
  
  // Crear una carpeta con la identificacion
  const carpeta = await crearCarpeta(identificacion, carpetaPadreId);
  
  // Subir cada archivo a la carpeta creada
  const enlaces = [];
  for (const archivo of archivos) {
    const enlace = await subirArchivo(archivo, carpeta.id);
    enlaces.push(enlace);
  }
  
  // Devolver el enlace a la carpeta
  return carpeta.webViewLink;
};

const actualizarEstadoEnSheets = async (identificacion, nuevoEstado = "activo") => {
  try {
    const sheets = await getSheetsClient();
    
    // Primero, obtener todos los datos para encontrar la fila del identificacion
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: '3.Pilotos',
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No se encontraron datos en la hoja');
    }
    
    // Determinar qué columna contiene el identificacion y el estado
    const headers = rows[0];
    const identificacionIndex = headers.findIndex(header => 
      header.toLowerCase() === 'identificación');
    const estadoIndex = headers.findIndex(header => 
      header.toLowerCase() === 'estado piloto');
    
    if (identificacionIndex === -1 || estadoIndex === -1) {
      throw new Error('No se encontraron las columnas necesarias');
    }
    
    // Encontrar la fila que corresponde al identificacion
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][identificacionIndex] && 
          rows[i][identificacionIndex].toLowerCase() === identificacion.toLowerCase()) {
        rowIndex = i;
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error(`No se encontró la identificacion ${identificacion}`);
    }
    
    // Actualizar el estado en Google Sheets
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `3.Pilotos!${getColumnLetter(estadoIndex + 1)}${rowIndex + 1}`,
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

export const pilotoHelper = {
  getPilotos,
  guardarPiloto,
  getPilotoByStatus,
  getPilotoById,
  editarPilotoporIdentificacion,
  getSiguienteCodigo,
  procesarArchivos,
  actualizarEstadoEnSheets
};