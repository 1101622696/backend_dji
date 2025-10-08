import { google } from 'googleapis';

const spreadsheetId = '19Dhwyql2AEhHPg14_mBuNQJZlq-ItdAr_QTFOEvkE7Q';

const getAuth = () => {
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets'
      ],
    });
  } else {
    return new google.auth.GoogleAuth({
      keyFile: './config/credenciales-sheets.json',
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets'
      ],
    });
  }
};

const getSheetsClient = async () => {
  const authClient = getAuth();
  const client = await authClient.getClient();
  return google.sheets({ version: 'v4', auth: client });
};

const obtenerRegistrosPC = async (nombreHoja, rango = 'A1:I1000') => {
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

const getRegistros = async () => {
  const registros = await obtenerRegistrosPC('Registro');
  
  return registros.sort((a, b) => {
    const numA = parseInt(a.equipo.replace(/\D/g, ''), 10);
    const numB = parseInt(b.equipo.replace(/\D/g, ''), 10);
    
    return numB - numA;
  });
};

const getRegistroByEquipo = async (equipo) => {
  const registros = await getRegistros();
  return registros.find(registro => 
    registro.equipo && registro.equipo.toLowerCase() === equipo.toLowerCase()
  );
};

const guardarRegistro = async ({equipo, cedula, nombre, marca, piso, observaciones, estado }) => {
  const sheets = await getSheetsClient();
 
  const nuevaFila = [equipo, cedula, nombre, marca, piso, observaciones, estado];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Registro!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [nuevaFila] },
  });

  return { equipo };
};

const editarPorEquipo = async (equipo, nuevosDatos) => {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Registro!A2:N', 
  });

  const filas = response.data.values;
  const filaIndex = filas.findIndex(fila => fila[0]?.toLowerCase() === equipo.toLowerCase());

  if (filaIndex === -1) {
    return null; 
  }

  const filaActual = filas[filaIndex];
  
  const filaEditada = [
    filaActual[0], 
    nuevosDatos.cedula || filaActual[1], 
    nuevosDatos.nombre || filaActual[2], 
    nuevosDatos.piso || filaActual[3], 
    nuevosDatos.observaciones || filaActual[4], 
    filaActual[5], 
  ];

  const filaEnHoja = filaIndex + 2; 

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Registro!A${filaEnHoja}:I${filaEnHoja}`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [filaEditada],
    },
  });

  return true;
};

const actualizarEstadoEnSheets = async (equipo, nuevoEstado = "1") => {
  try {
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Registro',
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No se encontraron datos en la hoja');
    }
    
    const headers = rows[0];
    const equipoIndex = headers.findIndex(header => 
      header.toLowerCase() === 'equipo');
    const estadoIndex = headers.findIndex(header => 
      header.toLowerCase() === 'estado');
    
    if (equipoIndex === -1 || estadoIndex === -1) {
      throw new Error('No se encontraron las columnas necesarias');
    }
    
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][equipoIndex] && 
          rows[i][equipoIndex].toLowerCase() === equipo.toLowerCase()) {
        rowIndex = i;
        break;
      }
    }
    
    if (rowIndex === -1) {
      throw new Error(`No se encontró el equipo ${equipo}`);
    }
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Registro!${getColumnLetter(estadoIndex + 1)}${rowIndex + 1}`,
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

export const registroHelper = {
  obtenerRegistrosPC,
  guardarRegistro,
  editarPorEquipo,
  actualizarEstadoEnSheets,
  getRegistroByEquipo
};
