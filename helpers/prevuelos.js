import { google } from 'googleapis';

const spreadsheetId = '1sJwTVoeFelYt5QE2Pk8KSYFZ8_3wRQjWr5HlDkhhrso';

const auth = new google.auth.GoogleAuth({
    keyFile: './config/credenciales-sheets.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const getSheetsClient = async () => {
    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client });
  };
  

const obtenerDatosPrevuelos = async (nombreHoja, rango = 'A1:Z1000') => {
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
  

const guardarPrevuelo = async ({ useremail, solicitudesAprobadas, piloto, permiso, fecha, ubicacion, modelodron }) => {
  const sheets = await getSheetsClient();
  const consecutivoprevuelo = await getSiguienteConsecutivoPrevuelo();
  const nuevaFila = [consecutivoprevuelo, useremail, solicitudesAprobadas, piloto, permiso, fecha, ubicacion, modelodron];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Prevuelo!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [nuevaFila] },
  });

  return { consecutivoprevuelo };
};

export const prevueloHelper = {
  getPrevuelos,
  guardarPrevuelo
};

