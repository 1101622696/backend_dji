import { google } from 'googleapis';

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

const getSheetsClient = async () => {
  const authClient = getAuth();
  const client = await authClient.getClient();
  return google.sheets({ version: 'v4', auth: client });
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

const guardarDron = async ({ numeroSerie, marca, modelo, peso, dimensiones, alturaMaxima, velocidadMaxima, fechaCompra, capacidadBateria, ubicaciondron, contratodron, tipoCamarasSensores, fechapoliza }) => {
  const sheets = await getSheetsClient();
  const codigo = await getSiguienteCodigo();
  const nuevaFila = [codigo, numeroSerie, marca, modelo, peso, dimensiones, alturaMaxima, velocidadMaxima, fechaCompra, capacidadBateria, ubicaciondron, contratodron, tipoCamarasSensores, fechapoliza];

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
  return drones.filter(prevuelo => 
    prevuelo["estado-dron"] && prevuelo["estado-dron"].toLowerCase() === status.toLowerCase()
  );
};
const getDronByNumeroserie = async (numeroserie) => {
  const drones = await getDrones();
  return drones.find(dron => 
    dron.numeroserie && dron.numeroserie.toLowerCase() === numeroserie.toLowerCase()
  );
};

const editarDronporNumeroserie = async (numeroserie, nuevosDatos) => {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: '3.Drones!A2:N', 
  });

  const filas = response.data.values;
  const encabezado = [
    "codigo", 
    "numeroSerie", 
    "marca", 
    "modelo", 
    "peso", 
    "dimensiones", 
    "alturaMaxima", 
    "velocidadMaxima", 
    "fechaCompra", 
    "capacidadBateria", 
    "ubicaciondron", 
    "contratodron", 
    "tipoCamarasSensores", 
    "fechapoliza"
  ];

  const filaIndex = filas.findIndex(fila => fila[1]?.toLowerCase() === numeroserie.toLowerCase());

  if (filaIndex === -1) {
    return null; 
  }

  const filaEditada = encabezado.map((campo) => nuevosDatos[campo] ?? filas[filaIndex][encabezado.indexOf(campo)]);

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

export const dronHelper = {
  getDrones,
  guardarDron,
  getDronesByStatus,
  getDronByNumeroserie,
  editarDronporNumeroserie
};