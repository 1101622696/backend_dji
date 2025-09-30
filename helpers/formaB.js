import { google } from 'googleapis';
import fs from 'fs';

const getAuth = () => {
  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ],
    });
  } else {
    return new google.auth.GoogleAuth({
      keyFile: './config/credenciales-sheets.json',
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ],
    });
  }
};

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


const listarPDFsEnDrive = async (folderId) => {
  try {
    const drive = await getDriveClient();
    
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/pdf' and trashed=false`,
      fields: 'files(id, name, size, createdTime, modifiedTime)',
      orderBy: 'createdTime desc'
    });

    return response.data.files || [];
  } catch (error) {
    console.error('Error listando PDFs:', error);
    throw error;
  }
};

const descargarPDFDesdeDrive = async (fileId, rutaDestino) => {
  try {
    const drive = await getDriveClient();
    
    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media'
    }, {
      responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
      const dest = fs.createWriteStream(rutaDestino);
      response.data.pipe(dest);
      
      dest.on('finish', () => {
        console.log(`PDF descargado: ${rutaDestino}`);
        resolve(rutaDestino);
      });
      
      dest.on('error', reject);
    });
  } catch (error) {
    console.error('Error descargando PDF:', error);
    throw error;
  }
};

const validarCedulaExisteEnSheets = async (cedula) => {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = '1CpXiKKQqb8FzaVDmWIzbJ5Dz8UlGGncC2cPPkbFGe1I';
    const sheetName = 'Forma B';
    
    const rangeCheck = `${sheetName}!B:B`;
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: rangeCheck
    });
    
    if (existingData.data.values) {
      return existingData.data.values.some(row => row[0] === cedula);
    }
    
    return false;
  } catch (error) {
    console.error('Error validando cédula:', error);
    throw error;
  }
};

const subirResultadosFormularioASheets = async (resultados, nombreArchivo) => {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = '1CpXiKKQqb8FzaVDmWIzbJ5Dz8UlGGncC2cPPkbFGe1I';
    const sheetName = 'Forma B';
    
    const filaDatos = prepararFilaParaSheets(resultados);
    
    const rangeCheck = `${sheetName}!B:B`;
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: rangeCheck
    });

    const cedula = nombreArchivo.replace('.pdf', '');
    
    let filaDestino = null;
    if (existingData.data.values) {
      const filaExistente = existingData.data.values.findIndex(row => row[0] === nombreArchivo);
      if (filaExistente !== -1) {
        filaDestino = filaExistente + 1;
      }
    }
    
    if (filaDestino) {
      const range = `${sheetName}!A${filaDestino}:GA${filaDestino}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [filaDatos]
        }
      });
    } else {
      const range = `${sheetName}!A:GA`;
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [filaDatos]
        }
      });
    }
    
    return { success: true, mensaje: 'Datos subidos correctamente a Sheets' };
  } catch (error) {
    console.error('Error subiendo a Sheets:', error);
    throw error;
  }
};

const prepararFilaParaSheets = (resultados) => {
  const fila = new Array(200).fill(''); 
  
  if (resultados.pagina_1) {
    const pagina1 = resultados.pagina_1;
    fila[1] = pagina1.numero_cedula || '';
    fila[2] = pagina1.nombre || '';
    fila[16] = pagina1.cargo || '';
    fila[19] = pagina1.area || '';
  }
  
  if (resultados.pagina_4) {
    const pagina4 = resultados.pagina_4;
    fila[0] = pagina4.fecha || '';
    fila[3] = pagina4.pregunta_2_sexo || '';
    fila[4] = pagina4.pregunta_3_año_nacimiento || '';
    fila[5] = pagina4.pregunta_4_estado_civil || '';
    fila[6] = pagina4.pregunta_5_nivel_estudios || '';
    fila[7] = pagina4.pregunta_6_ocupacion || '';
    fila[8] = pagina4.pregunta_7_municipio || '';
    fila[9] = pagina4.pregunta_7_departamento || '';
    fila[10] = pagina4.pregunta_8_respuesta || '';
    fila[11] = pagina4.pregunta_9_tipo_vivienda || '';
  }

  if (resultados.pagina_5) {
    const pagina5 = resultados.pagina_5;
    fila[12] = pagina5.pregunta_10_numero || '';
    fila[13] = pagina5.pregunta_11_municipio || '';
    fila[14] = pagina5.pregunta_11_departamento || '';
    fila[15] = pagina5.pregunta_12_tiempoempresa || '';
    fila[17] = pagina5.pregunta_14_cargo || '';
    fila[18] = pagina5.pregunta_15_tiempocargo || '';
    fila[20] = pagina5.pregunta_17_contrato || '';
    fila[21] = pagina5.pregunta_18_numero || '';
    fila[22] = pagina5.pregunta_19_salario || '';
  }
  
  let posicionActual = 23;
  
  for (let pregunta = 1; pregunta <= 80; pregunta++) {
    const key = encontrarKeyPreguntaFormaB(resultados, pregunta);
    if (key && resultados[key] && resultados[key].respuesta) {
      fila[posicionActual] = resultados[key].respuesta;
    }
    posicionActual++;
  }
  
  for (let pregunta = 81; pregunta <= 88; pregunta++) {
    const key = encontrarKeyPreguntaFormaB(resultados, pregunta);
    if (key && resultados[key] && resultados[key].respuesta) {
      fila[posicionActual] = resultados[key].respuesta;
    }
    posicionActual++;
  }
  
  const preguntaCondicional11 = resultados['p11_qcondicional'];
  if (preguntaCondicional11 && preguntaCondicional11.respuesta.toUpperCase() === 'SI') {
    for (let pregunta = 89; pregunta <= 97; pregunta++) {
      const key = encontrarKeyPreguntaFormaB(resultados, pregunta);
      if (key && resultados[key] && resultados[key].respuesta) {
        fila[posicionActual] = resultados[key].respuesta;
      }
      posicionActual++;
    }
  } else {
    posicionActual += 9;
  }
  
  for (let pregunta = 1; pregunta <= 31; pregunta++) {
    const key12 = `p12_q${pregunta}`;
    const key13 = `p13_q${pregunta}`;
    
    if (resultados[key12] && resultados[key12].respuesta) {
      fila[posicionActual] = resultados[key12].respuesta;
    } else if (resultados[key13] && resultados[key13].respuesta) {
      fila[posicionActual] = resultados[key13].respuesta;
    }
    posicionActual++;
  }
  
  for (let pregunta = 1; pregunta <= 31; pregunta++) {
    const key14 = `p14_q${pregunta}`;
    const key15 = `p15_q${pregunta}`;
    
    if (resultados[key14] && resultados[key14].respuesta) {
      fila[posicionActual] = resultados[key14].respuesta;
    } else if (resultados[key15] && resultados[key15].respuesta) {
      fila[posicionActual] = resultados[key15].respuesta;
    }
    posicionActual++;
  }
  
  const preguntaMultiple = resultados['p15_qmultiple'];
  if (preguntaMultiple && preguntaMultiple.respuesta) {
    fila[posicionActual] = preguntaMultiple.respuesta;
  }
  
  return fila;
};

const encontrarKeyPreguntaFormaB = (resultados, numeroPregunta) => {
  for (let pagina = 6; pagina <= 15; pagina++) {
    const key = `p${pagina}_q${numeroPregunta}`;
    if (resultados[key]) {
      return key;
    }
  }
  return null;
};

export {
  getSheetsClient,
  getDriveClient,
  listarPDFsEnDrive,
  descargarPDFDesdeDrive,
  subirResultadosFormularioASheets,
  validarCedulaExisteEnSheets
};
