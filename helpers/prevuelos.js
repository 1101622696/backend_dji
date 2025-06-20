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

// const getPrevuelos = () => obtenerDatosPrevuelos('Prevuelo');

const getPrevuelos = async () => {
  const prevuelos = await obtenerDatosPrevuelos('Prevuelo');
  
  return prevuelos.sort((a, b) => {
    const numA = parseInt(a.solicitudesaprobadas.replace(/\D/g, ''), 10);
    const numB = parseInt(b.solicitudesaprobadas.replace(/\D/g, ''), 10);
    
    return numB - numA;
  });
};

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
  
  const obtenerDatosSolicitud = async (consecutivo) => {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'SolicitudVuelo!A:L',
    });
  
    const rows = response.data.values || [];
    if (rows.length <= 1) return null;
    
    const headers = rows[0];
    
    const consecutivoIndex = headers.findIndex(h => h === 'Consecutivo');
    const empresaIndex = headers.findIndex(h => h === 'empresa');
    const municipioIndex = headers.findIndex(h => h === 'municipio');
    const tipoOperacionIndex = headers.findIndex(h => h === 'tipodeoperacionaerea');
    const fechaIndex = headers.findIndex(h => h === 'fecha_inicio');
    
    const solicitudRow = rows.find(row => 
      row[consecutivoIndex] && row[consecutivoIndex].toString() === consecutivo.toString()
    );
    
    if (!solicitudRow) return null;
    
    return {
      consecutivo: solicitudRow[consecutivoIndex],
      empresa: solicitudRow[empresaIndex],
      ubicacion: solicitudRow[municipioIndex],
      proposito: solicitudRow[tipoOperacionIndex],
      fecha: solicitudRow[fechaIndex]
    };
  };
  
  // const obtenerPermiso = async (consecutivo) => {
  //   const sheets = await getSheetsClient();
  //   const response = await sheets.spreadsheets.values.get({
  //     spreadsheetId,
  //     range: '2.ValidacionPrevuelo!A:I',
  //   });
  
  //   const rows = response.data.values || [];
  //   if (rows.length <= 1) return null;
    
  //   const headers = rows[0];
  //   const permisoIndex = headers.findIndex(h => h === 'ID');
  //   const consecutivoIndex = headers.findIndex(h => h === 'Consecutivo SAV');
  //   const dronIndex = headers.findIndex(h => h === 'Dron');
    
  //   const validacionRow = rows.find(row => 
  //     row[consecutivoIndex] && row[consecutivoIndex].toString() === consecutivo.toString()
  //   );
    
  //   if (!validacionRow) return null;
  //   console.log('permiso', permisoIndex);
    
  //   return{
  //     permiso: validacionRow[permisoIndex],
  //     modelodron: validacionRow[dronIndex]
  //   };
  // };

    const obtenerPermiso = async (consecutivo) => {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: '2.ValidacionPrevuelo!A:I',
    });
  
    const rows = response.data.values || [];
    if (rows.length <= 1) return null;
    
    const headers = rows[0];
const permisoIndex = headers.findIndex(h => 
  h && h.toString().trim().toLowerCase() === 'id'
);
    const consecutivoIndex = headers.findIndex(h => h === 'Consecutivo SAV');
    const dronIndex = headers.findIndex(h => h === 'Dron');
    
    const validacionRow = rows.find(row => 
      row[consecutivoIndex] && row[consecutivoIndex].toString() === consecutivo.toString()
    );
    if (permisoIndex === -1) {
  console.error('Columna ID no encontrada. Headers disponibles:', headers);
  return null;
}
    if (!validacionRow) return null;
    // console.log('permiso', permisoIndex);
    
    return{
      permiso: validacionRow[permisoIndex],
      modelodron: validacionRow[dronIndex]
    };
  };

const guardarPrevuelo = async ({  useremail, consecutivo, username, autorizadopor, fechaautorizacion, item1, item2, item3, item4, item5, item6, item7, item8, item9, item10, item11, item12, item13, item14, item15, item16, item17, item18, item19, item20, item21, item22, notas, estado, fechadeCreacion }) => {
  const sheets = await getSheetsClient();
 
  const datosSolicitud = await obtenerDatosSolicitud(consecutivo);

  if (!datosSolicitud) {
    throw new Error(`No se encontró la solicitud con consecutivo ${consecutivo}`);
  }
  
  const datosValidacionprevuelo = await obtenerPermiso(consecutivo) || "";
  
  const consecutivoprevuelo = await getSiguienteConsecutivoPrevuelo();
  
  const fecha = datosSolicitud.fecha;
  const ubicacion = datosSolicitud.ubicacion;
  const proposito = datosSolicitud.proposito;
  const empresa = datosSolicitud.empresa;
  
  const permiso = datosValidacionprevuelo.permiso;
  const modelodron = datosValidacionprevuelo.modelodron;

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

const editarPrevueloPorConsecutivo = async (consecutivo, nuevosDatos) => {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Prevuelo!A2:N', 
  });

  const filas = response.data.values;
  const filaIndex = filas.findIndex(fila => fila[2]?.toLowerCase() === consecutivo.toLowerCase());

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
    nuevosDatos.item1 || filaActual[12],
    nuevosDatos.item2 || filaActual[13],
    nuevosDatos.item3 || filaActual[14],
    nuevosDatos.item4 || filaActual[15],
    nuevosDatos.item5 || filaActual[16],
    nuevosDatos.item6 || filaActual[17],
    nuevosDatos.item7 || filaActual[18],
    nuevosDatos.item8 || filaActual[19],
    nuevosDatos.item9 || filaActual[20],
    nuevosDatos.item10 || filaActual[21],
    nuevosDatos.item11 || filaActual[22],
    nuevosDatos.item12 || filaActual[23],
    nuevosDatos.item13 || filaActual[24],
    nuevosDatos.item14 || filaActual[25],
    nuevosDatos.item15 || filaActual[26],
    nuevosDatos.item16 || filaActual[27],
    nuevosDatos.item17 || filaActual[28],
    nuevosDatos.item18 || filaActual[29],
    nuevosDatos.item19 || filaActual[30],
    nuevosDatos.item20 || filaActual[31],
    nuevosDatos.item21 || filaActual[32],
    nuevosDatos.item22 || filaActual[33],
    nuevosDatos.notas || filaActual[34],
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

const generarValidarPrevuelo = async (consecutivo, piloto, permiso, notas = '') => {
  try {
    const sheets = await getSheetsClient();
    
    // Primero obtenemos la solicitud original para extraer información necesaria
    const prevueloResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Prevuelo',
    });
    
    const rowsPrevuelo = prevueloResponse.data.values;
    if (!rowsPrevuelo || rowsPrevuelo.length === 0) {
      throw new Error('No se encontraron datos en la hoja Prevuelo');
    }
    
    // Buscar el prevuelo por consecutivo
    const headersPrevuelo = rowsPrevuelo[0];
    const consecutivoIndex = headersPrevuelo.findIndex(header => 
      header.toLowerCase() === 'solicitudesaprobadas');
    const fechaIndex = headersPrevuelo.findIndex(header => 
      header.toLowerCase() === 'fecha');
    const permisoIndex = headersPrevuelo.findIndex(header => 
      header.toLowerCase() === 'permiso');
    const pilotoIndex = headersPrevuelo.findIndex(header => 
      header.toLowerCase() === 'piloto');

    if (consecutivoIndex === -1) {
      throw new Error('No se encontró la columna consecutivo');
    }
    
    let rowPrevuelo = null;
    for (let i = 1; i < rowsPrevuelo.length; i++) {
      if (rowsPrevuelo[i][consecutivoIndex] && 
          rowsPrevuelo[i][consecutivoIndex].toLowerCase() === consecutivo.toLowerCase()) {
        rowPrevuelo = rowsPrevuelo[i];
        break;
      }
    }
    
    if (!rowPrevuelo) {
      throw new Error(`No se encontró el consecutivo ${consecutivo}`);
    }
    
    // Obtener fecha de la solicitud
    const fechaPrevuelo = fechaIndex !== -1 ? rowPrevuelo[fechaIndex] : '';
    const pilotoseleccionado = pilotoIndex !== -1 ? rowPrevuelo[pilotoIndex] : '';
    const permisoseleccionado = permisoIndex !== -1 ? rowPrevuelo[permisoIndex] : '';
    
    // Calcular fecha un día despues (si existe fecha en el registro)
    let fechaPosterior = '';
    if (fechaPrevuelo) {
      try {
        const fecha = new Date(fechaPrevuelo);
        fecha.setDate(fecha.getDate() + 1);
        fechaPosterior = fecha.toLocaleDateString('es-ES');
      } catch (e) {
        console.error('Error al calcular fecha posterior:', e);
      }
    }
    
    // Obtener el último código consecutivo de la hoja 3.ValidarPrevuelo
    const validacionResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: '3.ValidarPrevuelo',
    });
    
    const rowsValidacion = validacionResponse.data.values || [];
    
    // Generar nuevo código consecutivo (VP-X)
    let ultimoNumero = 0;
    if (rowsValidacion.length > 1) {  
      const codigoColumna = 0; 
      
      // Buscar todos los códigos y obtener el número más alto
      for (let i = 1; i < rowsValidacion.length; i++) {
        if (rowsValidacion[i] && rowsValidacion[i][codigoColumna]) {
          const codigo = rowsValidacion[i][codigoColumna];
          const match = codigo.match(/VP-(\d+)/);
          if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (num > ultimoNumero) {
              ultimoNumero = num;
            }
          }
        }
      }
    }
    
    const nuevoCodigo = `VP-${ultimoNumero + 1}`;
    const fechaActual = new Date().toLocaleDateString('es-ES');
    
    const nuevoRegistro = [
      nuevoCodigo,              // Código 
      consecutivo,              // ID del registro de Prevuelo
      "Aprobado",               // Estado
      pilotoseleccionado,                   // Piloto
      permisoseleccionado,                   // permiso
      fechaActual,              // Fecha actual
      notas,                    // Notas
      fechaPosterior             // Fecha un día antes
    ];
    
    // Anexar el nuevo registro a la hoja 3.ValidarPrevuelo
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: '3.ValidarPrevuelo',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [nuevoRegistro]
      }
    });
    
    return {
      codigo: nuevoCodigo,
      fechaValidacion: fechaActual
    };
  } catch (error) {
    console.error('Error al generar validar de prevuelo:', error);
    throw error;
  }
};

export const prevueloHelper = {
  getPrevuelos,
  guardarPrevuelo,
  getPrevueloByConsecutivo,
  editarPrevueloPorConsecutivo,
  actualizarEstadoEnSheets,
  generarValidarPrevuelo,
  getSiguienteConsecutivoPrevuelo
};

