// import { google } from 'googleapis';
// import { BrowserPDF417Reader } from '@zxing/library';
// // import Jimp from 'jimp';
// import * as Jimp from 'jimp';
// import fs from 'fs';
// import path from 'path';

// const spreadsheetId = '19Dhwyql2AEhHPg14_mBuNQJZlq-ItdAr_QTFOEvkE7Q';

// const FOLDER_ID_DRIVE = '1sDxnuV-DBTkUzd8gDZRULthZ4ZJUO1WQ';

// const getAuth = () => {
//   if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
//     return new google.auth.GoogleAuth({
//       credentials: {
//         client_email: process.env.GOOGLE_CLIENT_EMAIL,
//         private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//       },
//       scopes: [
//         'https://www.googleapis.com/auth/spreadsheets',
//         'https://www.googleapis.com/auth/drive'
//       ],
//     });
//   } else {
//     return new google.auth.GoogleAuth({
//       keyFile: './config/credenciales-sheets.json',
//       scopes: [
//         'https://www.googleapis.com/auth/spreadsheets',
//         'https://www.googleapis.com/auth/drive'
//       ],
//     });
//   }
// };

// const getDriveClient = async () => {
//   const authClient = getAuth();
//   const client = await authClient.getClient();
//   return google.drive({ version: 'v3', auth: client });
// };
// const getSheetsClient = async () => {
//   const authClient = getAuth();
//   const client = await authClient.getClient();
//   return google.sheets({ version: 'v4', auth: client });
// };

// async function subirImagenADrive(tempFilePath, nombreArchivo) {
//   const folderId = '1sDxnuV-DBTkUzd8gDZRULthZ4ZJUO1WQ';
//   const fileMetadata = {
//     name: nombreArchivo,
//     parents: [folderId],
//   };

//   const media = {
//     mimeType: 'image/png', // o 'image/jpeg'
//     body: fs.createReadStream(tempFilePath),
//   };

//   const response = await drive.files.create({
//     resource: fileMetadata,
//     media: media,
//     fields: 'id, webViewLink, webContentLink',
//   });

//   return response.data;
// }

// export async function actualizarCedulaEnFila(fila, cedula) {
//   const hoja = SpreadsheetApp.openById('19Dhwyql2AEhHPg14_mBuNQJZlq-ItdAr_QTFOEvkE7Q').getSheetByName('Registro');
//   hoja.getRange(fila, 2).setValue(cedula);
// }


// // const subirImagenADrive = async (filePath, nombreArchivo) => {
// //   try {
// //     const drive = await getDriveClient();
    
// //     const fileMetadata = {
// //       name: nombreArchivo,
// //       parents: [FOLDER_ID_DRIVE]
// //     };
    
// //     const media = {
// //       mimeType: 'image/jpeg',
// //       body: fs.createReadStream(filePath)
// //     };
    
// //     const file = await drive.files.create({
// //       requestBody: fileMetadata,
// //       media: media,
// //       fields: 'id, webViewLink, webContentLink'
// //     });
    
// //     console.log('Imagen subida a Drive:', file.data.id);
    
// //     return {
// //       fileId: file.data.id,
// //       webViewLink: file.data.webViewLink,
// //       webContentLink: file.data.webContentLink
// //     };
// //   } catch (error) {
// //     console.error('Error subiendo a Drive:', error);
// //     throw error;
// //   }
// // };

// // Decodificar PDF417 de una imagen
// const decodificarPDF417 = async (imagePath) => {
//   try {
//     console.log('Cargando imagen:', imagePath);
    
//     // Cargar imagen con Jimp
//     const image = await Jimp.read(imagePath);
    
//     console.log('Dimensiones originales:', image.bitmap.width, 'x', image.bitmap.height);
    
//     // Optimizar imagen: convertir a escala de grises y ajustar contraste
//     image
//       .greyscale()
//       .contrast(0.3)
//       .normalize();
    
//     // Redimensionar si es muy grande (máximo 1200px de ancho)
//     if (image.bitmap.width > 1200) {
//       image.resize(1200, Jimp.AUTO);
//       console.log('Redimensionada a:', image.bitmap.width, 'x', image.bitmap.height);
//     }
    
//     // Crear objeto compatible con ZXing
//     const luminanceSource = {
//       getRow: (y) => {
//         const row = [];
//         for (let x = 0; x < image.bitmap.width; x++) {
//           const idx = (image.bitmap.width * y + x) << 2;
//           row.push(image.bitmap.data[idx]); // Canal rojo (en escala de grises es igual)
//         }
//         return new Uint8ClampedArray(row);
//       },
//       getMatrix: () => {
//         const matrix = [];
//         for (let y = 0; y < image.bitmap.height; y++) {
//           for (let x = 0; x < image.bitmap.width; x++) {
//             const idx = (image.bitmap.width * y + x) << 2;
//             matrix.push(image.bitmap.data[idx]);
//           }
//         }
//         return new Uint8ClampedArray(matrix);
//       },
//       getWidth: () => image.bitmap.width,
//       getHeight: () => image.bitmap.height
//     };
    
//     console.log('Intentando decodificar PDF417...');
    
//     const reader = new BrowserPDF417Reader();
//     const result = await reader.decode(luminanceSource);
    
//     console.log('PDF417 decodificado exitosamente');
//     console.log('Texto completo:', result.text);
//     console.log('Longitud:', result.text.length);
    
//     return result.text;
    
//   } catch (error) {
//     console.error('Error decodificando PDF417:', error.message);
//     throw new Error('No se pudo leer el código de barras de la cédula');
//   }
// };

// const extraerCedulaDelTexto = (textoCompleto) => {
//   console.log('🔍 Extrayendo cédula del texto...');
  
//   if (!textoCompleto) {
//     throw new Error('Texto vacío');
//   }
  
//   // Patrones para cédulas colombianas
//   const patrones = [
//     /(\d{6,10})(?=[A-Z]{3,})/,  // Antes de 3+ letras mayúsculas (nombres)
//     /DSK\??(\d{6,10})/i,        // Después de DSK
//     /\b(\d{7,10})\b/            // Cualquier secuencia de 7-10 dígitos
//   ];
  
//   for (const patron of patrones) {
//     const match = textoCompleto.match(patron);
//     if (match && match[1]) {
//       console.log('Cédula encontrada:', match[1]);
//       return match[1];
//     }
//   }
  
//   throw new Error('No se pudo extraer el número de cédula del código');
// };

// const obtenerRegistrosPC = async (nombreHoja, rango = 'A1:I1000') => {
//   const sheets = await getSheetsClient();
//   const res = await sheets.spreadsheets.values.get({
//     spreadsheetId,
//     range: `${nombreHoja}!${rango}`,
//   });

//   const rows = res.data.values;
//   if (!rows || rows.length === 0) return [];

//   const headers = rows[0].map(h => h.trim().toLowerCase());
//   return rows.slice(1).map(row =>
//     Object.fromEntries(row.map((val, i) => [headers[i], val]))
//   );
// };

// const getRegistros = async () => {
//   const registros = await obtenerRegistrosPC('Registro');
  
//   return registros.sort((a, b) => {
//     const numA = parseInt(a.equipo.replace(/\D/g, ''), 10);
//     const numB = parseInt(b.equipo.replace(/\D/g, ''), 10);
    
//     return numB - numA;
//   });
// };

// const getRegistroByEquipo = async (equipo) => {
//   const registros = await getRegistros();
//   return registros.find(registro => 
//     registro.equipo && registro.equipo.toLowerCase() === equipo.toLowerCase()
//   );
// };

// const guardarRegistro = async ({equipo, cedula, nombre, marca, piso, observaciones, estado }) => {
//   const sheets = await getSheetsClient();
 
//   const nuevaFila = [equipo, cedula, nombre, marca, piso, observaciones, estado];

//   await sheets.spreadsheets.values.append({
//     spreadsheetId,
//     range: 'Registro!A1',
//     valueInputOption: 'RAW',
//     insertDataOption: 'INSERT_ROWS',
//     requestBody: { values: [nuevaFila] },
//   });

//   return { equipo };
// };

// const editarPorEquipo = async (equipo, nuevosDatos) => {
//   const sheets = await getSheetsClient();

//   const response = await sheets.spreadsheets.values.get({
//     spreadsheetId,
//     range: 'Registro!A2:N', 
//   });

//   const filas = response.data.values;
//   const filaIndex = filas.findIndex(fila => fila[0]?.toLowerCase() === equipo.toLowerCase());

//   if (filaIndex === -1) {
//     return null; 
//   }

//   const filaActual = filas[filaIndex];
  
//   const filaEditada = [
//     filaActual[0], 
//     nuevosDatos.cedula || filaActual[1], 
//     nuevosDatos.nombre || filaActual[2], 
//     nuevosDatos.piso || filaActual[3], 
//     nuevosDatos.observaciones || filaActual[4], 
//     filaActual[5], 
//   ];

//   const filaEnHoja = filaIndex + 2; 

//   await sheets.spreadsheets.values.update({
//     spreadsheetId,
//     range: `Registro!A${filaEnHoja}:I${filaEnHoja}`,
//     valueInputOption: 'RAW',
//     requestBody: {
//       values: [filaEditada],
//     },
//   });

//   return true;
// };

// const actualizarEstadoEnSheets = async (equipo, nuevoEstado = "1") => {
//   try {
//     const sheets = await getSheetsClient();
    
//     const response = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: 'Registro',
//     });
    
//     const rows = response.data.values;
//     if (!rows || rows.length === 0) {
//       throw new Error('No se encontraron datos en la hoja');
//     }
    
//     const headers = rows[0];
//     const equipoIndex = headers.findIndex(header => 
//       header.toLowerCase() === 'equipo');
//     const estadoIndex = headers.findIndex(header => 
//       header.toLowerCase() === 'estado');
    
//     if (equipoIndex === -1 || estadoIndex === -1) {
//       throw new Error('No se encontraron las columnas necesarias');
//     }
    
//     let rowIndex = -1;
//     for (let i = 1; i < rows.length; i++) {
//       if (rows[i][equipoIndex] && 
//           rows[i][equipoIndex].toLowerCase() === equipo.toLowerCase()) {
//         rowIndex = i;
//         break;
//       }
//     }
    
//     if (rowIndex === -1) {
//       throw new Error(`No se encontró el equipo ${equipo}`);
//     }
    
//     await sheets.spreadsheets.values.update({
//       spreadsheetId,
//       range: `Registro!${getColumnLetter(estadoIndex + 1)}${rowIndex + 1}`,
//       valueInputOption: 'RAW',
//       resource: {
//         values: [[nuevoEstado]]
//       }
//     });
    
//     return true;
//   } catch (error) {
//     console.error('Error al actualizar el estado en Google Sheets:', error);
//     throw error;
//   }
// };

// function getColumnLetter(columnNumber) {
//   let columnLetter = '';
//   while (columnNumber > 0) {
//     const remainder = (columnNumber - 1) % 26;
//     columnLetter = String.fromCharCode(65 + remainder) + columnLetter;
//     columnNumber = Math.floor((columnNumber - 1) / 26);
//   }
//   return columnLetter;
// }

// export const registroHelper = {
//   obtenerRegistrosPC,
//   guardarRegistro,
//   editarPorEquipo,
//   actualizarEstadoEnSheets,
//   getRegistroByEquipo,
//   subirImagenADrive,
//   decodificarPDF417,
//   extraerCedulaDelTexto
// };

import { google } from 'googleapis';
import { readBarcodes } from 'zxing-wasm/reader';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const JimpPkg = require("jimp");
const Jimp = JimpPkg.Jimp || JimpPkg;
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

const spreadsheetId = '19Dhwyql2AEhHPg14_mBuNQJZlq-ItdAr_QTFOEvkE7Q';
const FOLDER_ID_DRIVE = '1sDxnuV-DBTkUzd8gDZRULthZ4ZJUO1WQ';

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

const getDriveClient = async () => {
  const authClient = getAuth();
  const client = await authClient.getClient();
  return google.drive({ version: 'v3', auth: client });
};

const getSheetsClient = async () => {
  const authClient = getAuth();
  const client = await authClient.getClient();
  return google.sheets({ version: 'v4', auth: client });
};

const subirImagenADrive = async (buffer, nombreArchivo) => {
  try {
    const drive = await getDriveClient();
    
    const fileMetadata = {
      name: nombreArchivo,
      parents: [FOLDER_ID_DRIVE]
    };
    
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);
    
    const media = {
      mimeType: 'image/jpeg',
      body: bufferStream
    };
    
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink'
    });
    
    console.log('✅ Imagen subida a Drive:', file.data.id);
    
    return {
      fileId: file.data.id,
      webViewLink: file.data.webViewLink,
      webContentLink: file.data.webContentLink
    };
  } catch (error) {
    console.error('❌ Error subiendo a Drive:', error);
    throw error;
  }
};

const decodificarPDF417 = async (buffer) => {
  try {
    console.log("🔍 Procesando imagen desde buffer...");
    console.log("📊 Buffer size:", buffer.length, "bytes");

    // Procesar con Jimp
    const image = await Jimp.read(buffer);
    
    console.log("📐 Dimensiones originales:", image.bitmap.width, "x", image.bitmap.height);
    
    // Optimizar
    image
      .greyscale()
      .contrast(0.3)
      .normalize();
    
    if (image.bitmap.width > 1200) {
      image.resize(1200, Jimp.AUTO);
      console.log("📐 Redimensionada a:", image.bitmap.width, "x", image.bitmap.height);
    }

    // Convertir a buffer optimizado
    const optimizedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    console.log("📖 Decodificando PDF417 con zxing-wasm...");

    // Decodificar con zxing-wasm
    const results = await readBarcodes(optimizedBuffer, {
      formats: ['PDF417'],
      tryHarder: true,
      maxNumberOfSymbols: 1
    });

    if (!results || results.length === 0) {
      throw new Error("No se detectó código PDF417 en la imagen");
    }

    console.log("✅ PDF417 decodificado exitosamente");
    console.log("📄 Texto (preview):", results[0].text.substring(0, 150));
    console.log("📏 Longitud total:", results[0].text.length);

    return results[0].text;

  } catch (error) {
    console.error("❌ Error decodificando PDF417:", error.message);
    throw new Error(`No se pudo leer el código de barras: ${error.message}`);
  }
};

const extraerCedulaDelTexto = (textoCompleto) => {
  console.log('🔍 Extrayendo cédula del texto...');
  console.log('📝 Texto (preview):', textoCompleto.substring(0, 200));
  
  if (!textoCompleto) {
    throw new Error('Texto vacío');
  }
  
  const patrones = [
    /(\d{6,10})(?=[A-Z]{3,})/,  // Antes de letras mayúsculas
    /DSK\??(\d{6,10})/i,        // Después de DSK
    /\b(\d{7,10})\b/            // Cualquier secuencia de 7-10 dígitos
  ];
  
  for (let i = 0; i < patrones.length; i++) {
    const match = textoCompleto.match(patrones[i]);
    if (match && match[1]) {
      console.log(`✅ Cédula encontrada con patrón #${i+1}:`, match[1]);
      return match[1];
    }
  }
  
  console.warn('⚠️ No se encontró cédula con ningún patrón');
  throw new Error('No se pudo extraer el número de cédula');
};

const guardarRegistro = async ({ equipo, cedula, nombre, marca, piso, observaciones, estado }) => {
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

// Resto de funciones...
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
    nuevosDatos.marca || filaActual[3],
    nuevosDatos.piso || filaActual[4],
    nuevosDatos.observaciones || filaActual[5],
    filaActual[6],
  ];

  const filaEnHoja = filaIndex + 2;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Registro!A${filaEnHoja}:G${filaEnHoja}`,
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
      throw new Error('No se encontraron datos');
    }
    
    const headers = rows[0];
    const equipoIndex = headers.findIndex(header => 
      header.toLowerCase() === 'equipo');
    const estadoIndex = headers.findIndex(header => 
      header.toLowerCase() === 'estado');
    
    if (equipoIndex === -1 || estadoIndex === -1) {
      throw new Error('No se encontraron columnas');
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
    console.error('Error:', error);
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
  getRegistroByEquipo,
  subirImagenADrive,
  decodificarPDF417,
  extraerCedulaDelTexto
};
