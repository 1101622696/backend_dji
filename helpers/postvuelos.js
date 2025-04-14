import { google } from 'googleapis';

const spreadsheetId = '1sJwTVoeFelYt5QE2Pk8KSYFZ8_3wRQjWr5HlDkhhrso';

const auth = new google.auth.GoogleAuth({
    keyFile: './config/credenciales-sheets.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

const obtenerDatosPostvuelos = async (nombreHoja, rango = 'A1:Z1000') => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${nombreHoja}!${rango}`,
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    return [];
  }

  const headers = rows[0];
  const data = rows.slice(1).map(fila =>
    Object.fromEntries(fila.map((valor, i) => [headers[i], valor]))
  );

  return data;
};

export const getPostvuelos = () => obtenerDatosPostvuelos('PostVuelo');
