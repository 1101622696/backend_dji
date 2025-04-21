import { google } from 'googleapis';


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

const guardarPostvuelo = async ({ horaInicio, horaFin, distanciaRecorrida, alturaMaxima, incidentes, propositoAlcanzado, observacionesVuelo }) => {
  const sheets = await getSheetsClient();
  const idPostvuelo = await getSiguienteConsecutivo();
  const nuevaFila = [idPostvuelo, horaInicio, horaFin, distanciaRecorrida, alturaMaxima, incidentes, propositoAlcanzado, observacionesVuelo];

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
  const getPostvuelosByEmail = async (email) => {
    const postvuelos = await getPostvuelos();
    return postvuelos.filter(postvuelo => 
      postvuelo.usuario && postvuelo.usuario.toLowerCase() === email.toLowerCase()
    );
  };
  const getPostvuelosByEmailAndStatus = async (email, status) => {
    const postvuelos = await getPostvuelos();
    return postvuelos.filter(postvuelo => 
      postvuelo.usuario && 
      postvuelo.usuario.toLowerCase() === email.toLowerCase() &&
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

  const editarPostvueloPorConsecutivo = async (consecutivo, nuevosDatos) => {
    const sheets = await getSheetsClient();
  
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'PostVuelo!A2:N', 
    });
  
    const filas = response.data.values;
    const encabezado = [
      "idPostvuelo",
      "consecutivo-solicitud",
      "horaInicio", 
      "horaFin", 
      "distanciaRecorrida", 
      "alturaMaxima", 
      "incidentes", 
      "propositoAlcanzado", 
      "observacionesVuelo"
    ];
  
    const filaIndex = filas.findIndex(fila => fila[1]?.toLowerCase() === consecutivo.toLowerCase());
  
    if (filaIndex === -1) {
      return null; 
    }
  
    const filaEditada = encabezado.map((campo) => nuevosDatos[campo] ?? filas[filaIndex][encabezado.indexOf(campo)]);
  
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
  
export const postvueloHelper = {
  getPostvuelos,
  guardarPostvuelo,
  getPostvuelosByStatus,
  getPostvuelosByEmail,
  getPostvuelosByEmailAndStatus,
  getPostvueloByConsecutivo,
  editarPostvueloPorConsecutivo

};