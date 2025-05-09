import { google } from 'googleapis';
import {postvueloHelper} from '../helpers/postvuelos.js';
import {solicitudHelper} from '../helpers/solicitudes.js';

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

const obtenerDatosPrevuelos = async (nombreHoja, rango = 'A1:AK1000') => {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${nombreHoja}!${rango}`,
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    return [];
  }

  const headers = rows[0].map(h => h.trim().toLowerCase());
  return rows.slice(1).map(row =>
    Object.fromEntries(row.map((val, i) => [headers[i], val]))
  );
};

const getPrevuelos = () => obtenerDatosPrevuelos('Prevuelo');

const getSiguienteConsecutivoPrevuelo = async () => {
    const prevuelos = await getPrevuelos();
  
    const numeros = prevuelos
      .map(item => {
        const match = item.consecutivoprevuelo?.match(/\d+/); // Extrae los números de PVL-0001
        return match ? parseInt(match[0], 10) : null;
      })
      .filter(n => n !== null);
  
    const max = numeros.length ? Math.max(...numeros) : 0;
    const siguiente = (max + 1).toString().padStart(4, '0');
  
    return `PVL-${siguiente}`;
  };
  

const guardarPrevuelo = async ({  useremail, consecutivo, username, permiso, fecha, ubicacion, modelodron, proposito, empresa, autorizadopor, fechaautorizacion, item1, item2, item3, item4, item5, item6, item7, item8, item9, item10, item11, item12, item13, item14, item15, item16, item17, item18, item19, item20, item21, item22, notas, estado, fechadeCreacion }) => {
  const sheets = await getSheetsClient();
  const consecutivoprevuelo = await getSiguienteConsecutivoPrevuelo();
  const nuevaFila = [consecutivoprevuelo, useremail, consecutivo, username, permiso, fecha, ubicacion, modelodron, proposito, empresa, autorizadopor, fechaautorizacion, item1, item2, item3, item4, item5, item6, item7, item8, item9, item10, item11, item12, item13, item14, item15, item16, item17, item18, item19, item20, item21, item22, notas, estado, fechadeCreacion];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Prevuelo!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [nuevaFila] },
  });

  return { consecutivoprevuelo };
};
const getPrevueloByConsecutivo = async (consecutivo) => {
  const prevuelos = await getPrevuelos();
  return prevuelos.find(prevuelo => 
    prevuelo.solicitudesaprobadas && prevuelo.solicitudesaprobadas.toLowerCase() === consecutivo.toLowerCase()
  );
};
const getPrevuelosByStatus = async (status) => {
  const prevuelos = await getPrevuelos();
  return prevuelos.filter(prevuelo => 
    prevuelo["estado del prevuelo"] && prevuelo["estado del prevuelo"].toLowerCase() === status.toLowerCase()
  );
};
const getEsPrevueloPendiente = async (consecutivo) => {
  const prevuelo = await getPrevueloByConsecutivo(consecutivo);
  return prevuelo && prevuelo["estado del prevuelo"] && prevuelo["estado del prevuelo"].toLowerCase() === 'pendiente';
};
const getConsecutivosPostvuelo = async () => {
  try {
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'PostVuelo!B:B',
    });
    
    if (!response.data.values || response.data.values.length === 0) {
      return [];
    }
    
    // Usamos row[0] porque al pedir solo la columna B, esta viene como el primer elemento
    const consecutivos = response.data.values.slice(1).map(row => row[0]?.toLowerCase());
    return consecutivos.filter(Boolean);
  } catch (error) {
    console.error('Error al obtener consecutivos de PostVuelo:', error);
    throw error;
  }
};

const getPrevuelosEnProceso = async () => {
  try {
    // Obtener todas las prevuelos
    const prevuelos = await getPrevuelos();
    
    // Obtener todos los consecutivos de PostVuelo (columna B)
    const consecutivosPostvuelo = await getConsecutivosPostvuelo();
    
    // Filtrar las prevuelos cuyo consecutivo (columna C en Prevuelo) no esté en PostVuelo
    return prevuelos.filter(prevuelo => 
      prevuelo.solicitudesaprobadas && 
      !consecutivosPostvuelo.includes(prevuelo.solicitudesaprobadas.toLowerCase())
    );
  } catch (error) {
    console.error('Error al obtener prevuelos en proceso:', error);
    throw error;
  }
};
// Función para obtener prevuelos en proceso filtradas por email
const getprevuelosEnProcesoPorEmail = async (email) => {
  try {
    // Obtener todas los prevuelos en proceso
    const prevuelosEnProceso = await getPrevuelosEnProceso();
    
    // Filtrar por el email del usuario
    return prevuelosEnProceso.filter(prevuelo => 
      prevuelo.useremail && 
      prevuelo.useremail.toLowerCase() === email.toLowerCase()
    );
  } catch (error) {
    console.error('Error al obtener prevuelos en proceso por email:', error);
    throw error;
  }
};

const getPrevuelosByEmail = async (email) => {
  const prevuelos = await getPrevuelos();
  return prevuelos.filter(prevuelo => 
    prevuelo.useremail && prevuelo.useremail.toLowerCase() === email.toLowerCase()
  );
};
const getPrevuelosByEmailAndStatus = async (email, status) => {
  const prevuelos = await getPrevuelos();
  return prevuelos.filter(prevuelo => 
    prevuelo.useremail && 
    prevuelo.useremail.toLowerCase() === email.toLowerCase() &&
    prevuelo["estado del prevuelo"] && 
    prevuelo["estado del prevuelo"].toLowerCase() === status.toLowerCase()
  );
};

const getPrevuelosConEtapas = async () => {
  try {
    const prevuelos = await getPrevuelos();
    const postvuelos = await postvueloHelper.getPostvuelos();
    
    return prevuelos.map(prevuelo => {
      const consecutivoSolicitud = prevuelo.solicitudesaprobadas;
      const postvuelo = postvuelos.find(p => p['consecutivo-solicitud'] === consecutivoSolicitud);
      
      const prevueloAprobado = prevuelo["estado del prevuelo"] === "Aprobado";
      const postvueloExiste = !!postvuelo;
      const postvueloAprobado = postvuelo ? postvuelo["estado del postvuelo"] === "Aprobado" : false;
      
      return {
        ...prevuelo,
        solicitudExiste: true,
        solicitudAprobada: true,
        prevueloExiste: true,
        prevueloAprobado,
        postvueloExiste,
        postvueloAprobado,
        estadoProceso: solicitudHelper.determinarEstadoProceso(
          true, // solicitudExiste
          true, // solicitudAprobada
          true, // prevueloExiste
          prevueloAprobado,
          postvueloExiste,
          postvueloAprobado
        )
      };
    });
  } catch (error) {
    console.error('Error al obtener prevuelos con etapas:', error);
    throw error;
  }
};
const getPrevueloConEtapas = async (consecutivo) => {
  try {
    const prevuelos = await getPrevuelos();
    const prevuelo = prevuelos.find(p => p.solicitudesaprobadas === consecutivo);
    
    if (!prevuelo) {
      return null;
    }
    
    const postvuelos = await postvueloHelper.getPostvuelos();
    const postvuelo = postvuelos.find(p => p['consecutivo-solicitud'] === consecutivo);
    
    const prevueloAprobado = prevuelo["estado del prevuelo"] === "Aprobado";
    const postvueloExiste = !!postvuelo;
    const postvueloAprobado = postvuelo ? postvuelo["estado del postvuelo"] === "Aprobado" : false;
    
    return {
      ...prevuelo,
      solicitudExiste: true,
      solicitudAprobada: true,
      prevueloExiste: true,
      prevueloAprobado,
      postvueloExiste,
      postvueloAprobado,
      estadoProceso: solicitudHelper.determinarEstadoProceso(
        true, // solicitudExiste
        true, // solicitudAprobada
        true, // prevueloExiste
        prevueloAprobado,
        postvueloExiste,
        postvueloAprobado
      )
    };
  } catch (error) {
    console.error('Error al obtener prevuelo con etapas:', error);
    throw error;
  }
};

const editarPrevueloPorConsecutivo = async (consecutivo, nuevosDatos) => {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Prevuelo!A2:N', 
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
    filaActual[5], 
    filaActual[6], 
    filaActual[7], 
    filaActual[8], 
    filaActual[9], 
    filaActual[10], 
    filaActual[11], 
    nuevosDatos.useremail || filaActual[12],
    nuevosDatos.useremail || filaActual[13],
    nuevosDatos.useremail || filaActual[14],
    nuevosDatos.useremail || filaActual[15],
    nuevosDatos.useremail || filaActual[16],
    nuevosDatos.useremail || filaActual[17],
    nuevosDatos.useremail || filaActual[18],
    nuevosDatos.useremail || filaActual[19],
    nuevosDatos.useremail || filaActual[20],
    nuevosDatos.useremail || filaActual[21],
    nuevosDatos.useremail || filaActual[22],
    nuevosDatos.useremail || filaActual[23],
    nuevosDatos.useremail || filaActual[24],
    nuevosDatos.useremail || filaActual[25],
    nuevosDatos.useremail || filaActual[26],
    nuevosDatos.useremail || filaActual[27],
    nuevosDatos.useremail || filaActual[28],
    nuevosDatos.useremail || filaActual[29],
    nuevosDatos.useremail || filaActual[30],
    nuevosDatos.useremail || filaActual[31],
    nuevosDatos.useremail || filaActual[32],
    nuevosDatos.useremail || filaActual[33],
    nuevosDatos.useremail || filaActual[34],
    filaActual[35], 
    filaActual[36], 
  ];

  const filaEnHoja = filaIndex + 2;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Prevuelo!A${filaEnHoja}:AK${filaEnHoja}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [filaEditada],
    },
  });

  return true;
};

const actualizarEstadoEnSheets = async (consecutivo, nuevoEstado = "aprobado") => {
  try {
    const sheets = await getSheetsClient();
    
    // Primero, obtener todos los datos para encontrar la fila del consecutivo
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Prevuelo',
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No se encontraron datos en la hoja');
    }
    
    // Determinar qué columna contiene el consecutivo y el estado
    const headers = rows[0];
    const consecutivoIndex = headers.findIndex(header => 
      header.toLowerCase() === 'solicitudesaprobadas');
    const estadoIndex = headers.findIndex(header => 
      header.toLowerCase() === 'estado del prevuelo');
    
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
      range: `Prevuelo!${getColumnLetter(estadoIndex + 1)}${rowIndex + 1}`,
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

export const prevueloHelper = {
  getPrevuelos,
  guardarPrevuelo,
  getPrevuelosByStatus,
  getEsPrevueloPendiente,
  getPrevuelosByEmail,
  getPrevuelosByEmailAndStatus,
  getPrevuelosEnProceso,
  getprevuelosEnProcesoPorEmail,
  getPrevueloByConsecutivo,
  getPrevueloConEtapas,
  getPrevuelosConEtapas,
  editarPrevueloPorConsecutivo,
  actualizarEstadoEnSheets
};

