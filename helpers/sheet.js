import { google } from 'googleapis';
// import fs from 'fs';

const auth = new google.auth.GoogleAuth({
  keyFile: './config/credenciales-sheets.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const leerUsuariosDesdeSheets = async () => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const spreadsheetId = '1fTu_oEvbL5RG0TSL5rIs2YKFtX8BXTymVkXVhBM0_ts'; 
  const range = 'Usuarios!A1:F1200'; 

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = res.data.values;
  if (rows.length === 0) {
    return [];
  }

  // Opcional: transformar filas en objetos con nombre de columnas
  const headers = rows[0];
  const data = rows.slice(1).map((fila) =>
    Object.fromEntries(fila.map((valor, i) => [headers[i], valor]))
  );

  return data;
};

export default leerUsuariosDesdeSheets;
