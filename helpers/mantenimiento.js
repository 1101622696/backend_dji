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

const obtenerDatosMantenimiento = async (nombreHoja, rango = 'A1:Z1000') => {
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

const getMantenimientos = () => obtenerDatosMantenimiento('Mantenimiento');

const getSiguienteCodigo = async () => {
  const mantenimientos = await getMantenimientos();
  
  const numeros = mantenimientos
    .map(item => {
      const match = item.codigomantenimiento?.match(/\d+/); 
      return match ? parseInt(match[0], 10) : null;
    })
    .filter(n => n !== null);
  
  const max = numeros.length ? Math.max(...numeros) : 0;
  const siguiente = (max + 1).toString().padStart(1, '0');
  
  return `M-${siguiente}`;
};

const guardarMantenimiento = async ({ numeroserie, fechaMantenimiento, valor, empresaresponsable, idPiloto, descripcion, observaciones, pruebas, Link, fechadeCreacion, codigomantenimiento }) => {
  const sheets = await getSheetsClient();
 
  const numeroSerieValor = typeof numeroserie === 'object' && numeroserie !== null 
  ? numeroserie.valor || numeroserie.label || JSON.stringify(numeroserie) 
  : numeroserie;
  
const pilotoValor = typeof idPiloto === 'object' && idPiloto !== null
  ? idPiloto.valor || idPiloto.label || JSON.stringify(idPiloto)
  : idPiloto;

  const nuevaFila = [codigomantenimiento, numeroSerieValor, fechaMantenimiento, valor, empresaresponsable, pilotoValor, descripcion, observaciones, pruebas, Link, fechadeCreacion];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Mantenimiento!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [nuevaFila] },
  });

  return { codigomantenimiento };
};

const getMantenimientoByCodigo = async (codigomantenimiento) => {
  const mantenimientos = await getMantenimientos();
  return mantenimientos.find(mantenimiento => 
    mantenimiento.codigomantenimiento && mantenimiento.codigomantenimiento.toLowerCase() === codigomantenimiento.toLowerCase()
  );
};

const filtrarMantenimientoPorCampoTexto = (mantenimientos, campo, valor) => {
  return mantenimientos.filter(dron => 
    dron[campo] && dron[campo].toLowerCase() === valor.toLowerCase()
  );
};

const getMantenimientosBynumeroserie = async (numeroserie) => {
  const mantenimientos = await getMantenimientos();
  return filtrarMantenimientoPorCampoTexto(mantenimientos, "codigodron", numeroserie);
};

const getMantenimientosByPiloto = async (identificacion) => {
  const mantenimientos = await getMantenimientos();
  return filtrarMantenimientoPorCampoTexto(mantenimientos, "piloto responsable", identificacion);
};

const getMantenimientosByObservacion = async (observacion) => {
  const mantenimientos = await getMantenimientos();
  return filtrarMantenimientoPorCampoTexto(mantenimientos, "observaciones-mantenimiento", observacion);
};

const ordenarMantenimientosPorCampoNumerico = (mantenimientos, campo, orden = 'desc') => {
  return mantenimientos.sort((a, b) => {
    const valorA = parseFloat(a[campo]) || 0;
    const valorB = parseFloat(b[campo]) || 0;
    
    return orden.toLowerCase() === 'desc' ? valorB - valorA : valorA - valorB;
  });
};

const getMantenimientosPorFecha = async (orden = 'desc') => {
  const mantenimientos = await getMantenimientos();
  
  return mantenimientos.sort((a, b) => {
    const fechaA = new Date(a["fecha de mantenimiento"] || 0);
    const fechaB = new Date(b["fecha de mantenimiento"] || 0);
    
    return orden.toLowerCase() === 'desc' ? fechaB - fechaA : fechaA - fechaB;
  });
};

const getMantenimientosPorCosto = async (orden = 'desc') => {
  const mantenimientos = await getMantenimientos();
  return ordenarMantenimientosPorCampoNumerico(mantenimientos, "valor", orden);
};

const getValorTotal = async () => {
  const mantenimientos = await getMantenimientos();
  
  const total = mantenimientos.reduce((acumulador, mantenimiento) => {
    const valorNumerico = parseFloat(mantenimiento.valor) || 0;
    return acumulador + valorNumerico;
  }, 0);
  
  return parseFloat(total.toFixed(2));
};

const getMantenimientosOrdenadosPorValor = async (orden = 'desc') => {
  const mantenimientos = await getMantenimientos();
  
  return mantenimientos.sort((a, b) => {
    const valorA = parseFloat(a.valor) || 0;
    const valorB = parseFloat(b.valor) || 0;
    
    return orden.toLowerCase() === 'desc' ? valorB - valorA : valorA - valorB;
  });
};

const editarMantenimiento = async (codigomantenimiento, nuevosDatos) => {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Mantenimiento!A2:N', 
  });

  const filas = response.data.values;
  const filaIndex = filas.findIndex(fila => fila[0]?.toLowerCase() === codigomantenimiento.toLowerCase());

  if (filaIndex === -1) {
    return null; 
  }

  const filaActual = filas[filaIndex];  

    const filaEditada = [
      filaActual[0], 
  nuevosDatos.numeroserie || filaActual[1],
  nuevosDatos.fechaMantenimiento || filaActual[2],
  nuevosDatos.valor || filaActual[3],
  nuevosDatos.empresaresponsable || filaActual[4],
  nuevosDatos.idPiloto || filaActual[5],
  nuevosDatos.descripcion || filaActual[6],
  nuevosDatos.observaciones || filaActual[7],
  nuevosDatos.pruebas || filaActual[8],
  nuevosDatos.Link || filaActual[9],
  filaActual[10], 

  ];

  const filaEnHoja = filaIndex + 2;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Mantenimiento!A${filaEnHoja}:K${filaEnHoja}`,
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

const procesarArchivos = async (archivos, codigomantenimiento) => {
  if (!archivos || archivos.length === 0) {
    return null;
  }
  
  // ID de la carpeta padre que proporcionaste
  const carpetaPadreId = '18Gl71QpsFcpVN76qc549bTB8Qd0FTLBC';
  
  // Crear una carpeta con el nombre del codigomantenimiento
  let carpeta = await buscarCarpetaPorNombre(codigomantenimiento, carpetaPadreId);
  
  // Buscar si ya existe una carpeta con el nombre del codigomantenimiento
  if (!carpeta) {
    carpeta = await crearCarpeta(codigomantenimiento, carpetaPadreId);
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

export const mantenimientoHelper = {
  getMantenimientos,
  getSiguienteCodigo,
  guardarMantenimiento,
  getMantenimientosByPiloto,
  getMantenimientoByCodigo,
  getMantenimientosOrdenadosPorValor,
  getMantenimientosBynumeroserie,
  getMantenimientosPorFecha,
  getMantenimientosPorCosto,
  getMantenimientosByObservacion,
  getValorTotal,
  editarMantenimiento,
  procesarArchivos,
  subirArchivosACarpetaExistente
};