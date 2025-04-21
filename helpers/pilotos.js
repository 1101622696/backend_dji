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
const obtenerDatosPiloto = async (nombreHoja, rango = 'A1:Z1000') => {
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

const guardarPiloto = async ({ nombreCompleto, primerApellido, SegundoApellido, tipoDocumento, identificacion, paisExpedicion, ciudadExpedicion, fechaExpedicion, paisNacimiento, ciudadNacimiento, fechaNacimiento, grupoSanguineo, factorRH, genero, contratopiloto, estadoCivil, ciudadOrigen, direccion, telefonoMovil, fechaExamen, email }) => {
  const sheets = await getSheetsClient();
  const idPiloto = await getSiguienteCodigo();
  const nuevaFila = [idPiloto, nombreCompleto, primerApellido, SegundoApellido, tipoDocumento, identificacion, paisExpedicion, ciudadExpedicion, fechaExpedicion, paisNacimiento, ciudadNacimiento, fechaNacimiento, grupoSanguineo, factorRH, genero, contratopiloto, estadoCivil, ciudadOrigen, direccion, telefonoMovil, fechaExamen, email];

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
  return pilotos.filter(prevuelo => 
    prevuelo["estado piloto"] && prevuelo["estado piloto"].toLowerCase() === status.toLowerCase()
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

export const pilotoHelper = {
  getPilotos,
  guardarPiloto,
  getPilotoByStatus,
  getPilotoById,
  editarPilotoporIdentificacion
};