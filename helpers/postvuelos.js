import { google } from 'googleapis';
import stream from 'stream';
import nodemailer from 'nodemailer';
import { domainToUnicode } from 'url';

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
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ],
    });
  } else {
    // Para desarrollo local, usar el archivo
    return new google.auth.GoogleAuth({
      keyFile: './config/credenciales-sheets.json',
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ],
    });
  }
};

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER,       
      pass: process.env.EMAIL_APP_PASSWORD 
    }
  });
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

// const getPostvuelos = () => obtenerDatosPostvuelo('PostVuelo');

const getPostvuelos = async () => {
  const postvuelos = await obtenerDatosPostvuelo('PostVuelo');
  
  return postvuelos.sort((a, b) => {
    const numA = parseInt(a["consecutivo-solicitud"].replace(/\D/g, ''), 10);
    const numB = parseInt(b["consecutivo-solicitud"].replace(/\D/g, ''), 10);
    
    return numB - numA;
  });
};

const getPostvuelosAprobados = async () => {
  const postvuelos = await obtenerDatosPostvuelo('PostVuelo');

  const aprobados = postvuelos.filter(pv => pv["estado del postvuelo"] === "Aprobado");

  return aprobados.sort((a, b) => {
    const numA = parseInt(a["consecutivo-solicitud"].replace(/\D/g, ''), 10);
    const numB = parseInt(b["consecutivo-solicitud"].replace(/\D/g, ''), 10);
    return numB - numA;
  });
};

const ordenarPostvuelosPorCampoNumerico = (postvuelos, campo, orden = 'desc') => {
  return postvuelos.sort((a, b) => {
    const valorA = parseFloat(a[campo]) || 0;
    const valorB = parseFloat(b[campo]) || 0;
    
    return orden.toLowerCase() === 'desc' ? valorB - valorA : valorA - valorB;
  });
};

const getPostvueloOrdenadosPorFechaVuelo = async (orden = 'desc') => {
  const postvuelos = await getPostvuelosAprobados();
  
  return postvuelos.sort((a, b) => {
    const fechaA = new Date(a["id- fecha"] || 0);
    const fechaB = new Date(b["id- fecha"] || 0);
    
    return orden.toLowerCase() === 'desc' ? fechaB - fechaA : fechaA - fechaB;
  });
};

const getPostvueloOrdenadosPorTiempo = async (orden = 'desc') => {
  const postvuelos = await getPostvuelosAprobados();
  return ordenarPostvuelosPorCampoNumerico(postvuelos, "duración", orden);
};

const getPostvueloOrdenadosPorDistancia = async (orden = 'desc') => {
  const postvuelos = await getPostvuelosAprobados();
  return ordenarPostvuelosPorCampoNumerico(postvuelos, "distancia recorrida", orden);
};

const getPostvueloOrdenadosPorAltura = async (orden = 'desc') => {
  const postvuelos = await getPostvuelosAprobados();
  return ordenarPostvuelosPorCampoNumerico(postvuelos, "altura máxima alcanzada", orden);
};

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

const obtenerDatosPrevuelo = async (consecutivo) => {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Prevuelo!A:L',
  });

  const rows = response.data.values || [];
  if (rows.length <= 1) return null;
  
  const headers = rows[0];
  
  const consecutivoIndex = headers.findIndex(h => h === 'solicitudesAprobadas');
  const empresaIndex = headers.findIndex(h => h === 'autorizacion');
  const tipoOperacionIndex = headers.findIndex(h => h === 'proposito');
  const fechaIndex = headers.findIndex(h => h === 'fecha');
  const dronIndex = headers.findIndex(h => h === 'modelo-dron');
  
  const PrevueloRow = rows.find(row => 
    row[consecutivoIndex] && row[consecutivoIndex].toString() === consecutivo.toString()
  );
  
  if (!PrevueloRow) return null;
  
  return {
    consecutivo: PrevueloRow[consecutivoIndex],
    empresa: PrevueloRow[empresaIndex],
    proposito: PrevueloRow[tipoOperacionIndex],
    fecha: PrevueloRow[fechaIndex],
    dron: PrevueloRow[dronIndex]
  };
};

const calcularDuracion = (horaInicio, horaFin) => {
  if (!horaInicio || !horaFin || horaInicio.trim() === '' || horaFin.trim() === '') {
    console.warn('calcularDuracion: horaInicio o horaFin están vacíos o undefined');
    return 0;
  }

  try {
    const [horaInicioHoras, horaInicioMinutos] = horaInicio.split(':').map(Number);
    const [horaFinHoras, horaFinMinutos] = horaFin.split(':').map(Number);
    
    let minutosInicio = horaInicioHoras * 60 + horaInicioMinutos;
    let minutosFin = horaFinHoras * 60 + horaFinMinutos;
    
    if (minutosFin < minutosInicio) {
      minutosFin += 24 * 60; 
    }
    
    return minutosFin - minutosInicio;
  } catch (error) {
    console.error('Error al calcular duración:', error);
    return 0;
  }
};

const guardarPostvuelo = async ({ consecutivo, username, horaInicio, horaFin, duracion , distanciaRecorrida, alturaMaxima, incidentes, propositoAlcanzado, observacionesVuelo, fechadeCreacion, Link, useremail, estado }) => {
  const sheets = await getSheetsClient();
  
  const datosPrevuelo = await obtenerDatosPrevuelo(consecutivo);

  if (!datosPrevuelo) {
    throw new Error(`No se encontró la solicitud con consecutivo ${consecutivo}`);
  }
  
  const idPostvuelo = await getSiguienteConsecutivo();
  
  const fecha = datosPrevuelo.fecha;
  const proposito = datosPrevuelo.proposito;
  const empresa = datosPrevuelo.empresa;
  const dronusado = datosPrevuelo.dron;
  
  const duracionFinal = duracion || calcularDuracion(horaInicio, horaFin);

  const nuevaFila = [idPostvuelo, consecutivo, username, dronusado, fecha, horaInicio, horaFin, duracionFinal, distanciaRecorrida, alturaMaxima, incidentes, propositoAlcanzado, observacionesVuelo, fechadeCreacion, Link, useremail, estado, proposito, empresa];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Postvuelo!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [nuevaFila] },
  });

    try {
    const destinatario = "apinto@sevicol.com.co";
    // const destinatario = "cardenasdiegom6@gmail.com";
    
    await enviarNotificacionPostvuelo({
      destinatario,
      consecutivo: consecutivo,
      piloto: username,
      fecha,
      empresa,
    });
    
    console.log(`Notificación enviada para el postvuelo ${consecutivo}`);
  } catch (error) {
    console.error('Error al enviar notificación:', error);
  }

  return { idPostvuelo };
};

const enviarNotificacionPostvuelo = async (datos) => {
  try {
    const transporter = createTransporter();

    const urlBase = "https://script.google.com/macros/s/AKfycbzoGLCKAxvDny6qhIMze-cGaaitGPt9yIhByUKYY1aI41gwysmisEIvn0UEP6qg7SH6/exec";
    const linkFormulario = `${urlBase}?postvuelo=${datos.consecutivo}`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ffffff; color: white; padding: 10px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center;">
            <img src="https://docs.google.com/drawings/d/e/2PACX-1vQw98R1ZTlOAY_mVURreLAh0eGVKAodHN9VVuOk8wBHQ_WZmveIAn6e9588ix1u-NqmnH6rrYjPEzes/pub?w=480&h=360" 
                 alt="Logo SVA" 
                 style="width: 150px; height: auto; margin-right: 10px;">
            <div>
              <h2 style="color: black; font-size: 24px; font-weight: bold; margin: 0;">Nuevo Postvuelo Registrado</h2>
              <p style="margin: 5px 0;">SVA SEVICOL LTDA</p>
            </div>
          </div>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p>Se ha registrado un nuevo postvuelo con la siguiente información:</p>
          
          <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Consecutivo:</strong> ${datos.consecutivo}</p>
            <p style="margin: 5px 0;"><strong>Piloto:</strong> ${datos.piloto}</p>
            <p style="margin: 5px 0;"><strong>Fecha:</strong> ${datos.fecha}</p>
            <p style="margin: 5px 0;"><strong>Empresa:</strong> ${datos.empresa}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${linkFormulario}"
                style="background-color: #28a745;
                       color: white;
                       padding: 12px 25px;
                       text-decoration: none;
                       border-radius: 5px;
                       display: inline-block;
                       font-weight: bold;">
              Aprobar Postvuelo
            </a>
          </div>
          
          <p style="color: #666; font-size: 0.9em;">Si el botón no funciona, copie y pegue el siguiente enlace en su navegador:</p>
          <p style="color: #666; font-size: 0.9em;">${linkFormulario}</p>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #666;">
          <p>Saludos cordiales,<br>
          Sistema de Gestión de Vuelos<br>
          SVA SEVICOL LTDA</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"Sistema de Vuelos" <dcardenas@sevicol.com.co>',
      to: datos.destinatario,
      subject: `Nuevo Postvuelo Registrado - Consecutivo: ${datos.consecutivo}`,
      html: htmlBody
    });

    console.log('Correo enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar correo de notificación:', error);
    throw error;
  }
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
    const filaIndex = filas.findIndex(fila => fila[1]?.toLowerCase() === consecutivo.toLowerCase());
  
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
    nuevosDatos.horaInicio || filaActual[5],
    nuevosDatos.horaFin || filaActual[6],
    nuevosDatos.duracion || filaActual[7],
    nuevosDatos.distanciaRecorrida || filaActual[8],
    nuevosDatos.alturaMaxima || filaActual[9],
    nuevosDatos.incidentes || filaActual[10],
    nuevosDatos.propositoAlcanzado || filaActual[11],
    nuevosDatos.observacionesVuelo || filaActual[12],
    filaActual[13], 
    nuevosDatos.Link || filaActual[14],
    filaActual[15], 
    filaActual[16], 
    filaActual[17], 
    filaActual[18], 
    ];
  
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
  

const crearCarpeta = async (nombreCarpeta, parentFolderId) => {
  const drive = await getDriveClient();
  
  const fileMetadata = {
    name: nombreCarpeta,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parentFolderId ? [parentFolderId] : []
  };
  
  const respuesta = await drive.files.create({
    resource: fileMetadata,
    fields: 'id, webViewLink'
  });
  
  return respuesta.data;
};

const subirArchivo = async (archivo, carpetaId) => {
  const drive = await getDriveClient();
  
  // Si estamos trabajando con buffer desde multer
  const fileMetadata = {
    name: archivo.originalname,
    parents: [carpetaId]
  };
  
  const bufferStream = new stream.PassThrough();
  bufferStream.end(archivo.buffer);
  
  const media = {
    mimeType: archivo.mimetype,
    body: bufferStream
  };
  
  const respuesta = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, webViewLink'
  });
  
  return respuesta.data.webViewLink;
};

const procesarArchivos = async (archivos, consecutivo) => {
  if (!archivos || archivos.length === 0) {
    return null;
  }
  
  // ID de la carpeta padre que proporcionaste
  const carpetaPadreId = '1-P0Y8rdlvgZaEsnPVN4hzf42pWhH1WY1';
  
  // Crear una carpeta con el nombre del consecutivo
  let carpeta = await buscarCarpetaPorNombre(consecutivo, carpetaPadreId);
  
  // Buscar si ya existe una carpeta con el nombre del consecutivo
  if (!carpeta) {
    carpeta = await crearCarpeta(consecutivo, carpetaPadreId);
  }
  
  // Si no existe, crearla
  const enlaces = [];
  for (const archivo of archivos) {
    const enlace = await subirArchivo(archivo, carpeta.id);
    enlaces.push(enlace);
  }
  
  // Devolver el enlace a la carpeta
  return carpeta.webViewLink;
};

const actualizarEstadoEnSheets = async (consecutivo, nuevoEstado = "aprobado") => {
  try {
    const sheets = await getSheetsClient();
    
    // Primero, obtener todos los datos para encontrar la fila del consecutivo
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'PostVuelo',
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No se encontraron datos en la hoja');
    }
    
    // Determinar qué columna contiene el consecutivo y el estado
    const headers = rows[0];
    const consecutivoIndex = headers.findIndex(header => 
      header.toLowerCase() === 'consecutivo-solicitud');
    const estadoIndex = headers.findIndex(header => 
      header.toLowerCase() === 'estado del postvuelo');
    
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
      range: `PostVuelo!${getColumnLetter(estadoIndex + 1)}${rowIndex + 1}`,
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

const subirArchivosACarpetaExistente = async (archivos, carpetaId) => {
  if (!archivos || archivos.length === 0) {
    return null;
  }
  
  // Subir cada archivo a la carpeta existente
  const enlaces = [];
  for (const archivo of archivos) {
    const enlace = await subirArchivo(archivo, carpetaId);
    enlaces.push(enlace);
  }
  
  // Devolver el enlace a la carpeta (necesitamos obtenerlo)
  const drive = await getDriveClient();
  const carpeta = await drive.files.get({
    fileId: carpetaId,
    fields: 'webViewLink'
  });
  
  return carpeta.data.webViewLink;
};

const buscarCarpetaPorNombre = async (nombreCarpeta, parentFolderId) => {
  const drive = await getDriveClient();
  
  // Crear consulta para buscar por nombre exacto dentro de la carpeta padre
  let query = `name = '${nombreCarpeta}' and mimeType = 'application/vnd.google-apps.folder'`;
  if (parentFolderId) {
    query += ` and '${parentFolderId}' in parents`;
  }
  
  try {
    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, webViewLink)',
      spaces: 'drive'
    });
    
    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0]; // Retorna la primera carpeta encontrada
    }
    
    return null; // No se encontró la carpeta
  } catch (error) {
    console.error('Error al buscar carpeta:', error);
    return null;
  }
};

const generarValidacionPostvuelo = async (consecutivo, piloto, numeroserie, notas = '', estado = 'Aprobado') => {
  try {
    const sheets = await getSheetsClient();
    
    // Obtener datos de la hoja PostVuelo
    const postvueloResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'PostVuelo',
    });
    
    const rowsPostvuelo = postvueloResponse.data.values;
    if (!rowsPostvuelo || rowsPostvuelo.length === 0) {
      throw new Error('No se encontraron datos en la hoja Postvuelo');
    }
    
    // Buscar la solicitud por consecutivo
    const headersPostvuelo = rowsPostvuelo[0];
    const consecutivoIndex = headersPostvuelo.findIndex(header => 
      header.toLowerCase() === 'consecutivo-solicitud');
    
    const pilotoIndex = headersPostvuelo.findIndex(header => 
      header.toLowerCase() === 'piloto-postvuelo');
    const duracionIndex = headersPostvuelo.findIndex(header => 
      header.toLowerCase() === 'duración') || 7;  // Columna H (índice 7)
    const distanciaIndex = headersPostvuelo.findIndex(header => 
      header.toLowerCase() === 'distancia recorrida') || 8; // Columna I (índice 8)
    const correoPilotoIndex = headersPostvuelo.findIndex(header => 
      header.toLowerCase() === 'correo de usuario');
    const dronUsadoIndex = headersPostvuelo.findIndex(header => 
      header.toLowerCase() === 'dron-usado');
    const fechaPostIndex = headersPostvuelo.findIndex(header => 
      header.toLowerCase() === 'id-fecha'); 
    const empresaPostIndex = headersPostvuelo.findIndex(header => 
      header.toLowerCase() === 'empresa_post');
    if (consecutivoIndex === -1) {
      throw new Error('No se encontró la columna consecutivo');
    }
    
    // Buscar el registro de postvuelo por consecutivo
    let rowPostvuelo = null;
    for (let i = 1; i < rowsPostvuelo.length; i++) {
      if (rowsPostvuelo[i][consecutivoIndex] && 
          rowsPostvuelo[i][consecutivoIndex].toLowerCase() === consecutivo.toLowerCase()) {
        rowPostvuelo = rowsPostvuelo[i];
        break;
      }
    }
    
    if (!rowPostvuelo) {
      throw new Error(`No se encontró el consecutivo ${consecutivo}`);
    }
    
    // Obtener valores de duración, distancia, correo del piloto y dron usado
    const duracion = rowPostvuelo[duracionIndex] ? parseFloat(rowPostvuelo[duracionIndex]) || 0 : 0;
    const distancia = rowPostvuelo[distanciaIndex] ? parseFloat(rowPostvuelo[distanciaIndex]) || 0 : 0;
    const emailPiloto = correoPilotoIndex !== -1 ? rowPostvuelo[correoPilotoIndex] : '';
    const dronUsado = dronUsadoIndex !== -1 ? rowPostvuelo[dronUsadoIndex] : '';
    const pilotoseleccionado = pilotoIndex !== -1 ? rowPostvuelo[pilotoIndex] : '';
    
    // Verificar que se obtuvieron correctamente los valores necesarios
    if (!emailPiloto) {
      console.warn('No se encontró el correo del piloto en el registro de PostVuelo');
    }
    
    if (!dronUsado) {
      console.warn('No se encontró el dron usado en el registro de PostVuelo');
    }
   
    // Actualizar estadísticas del piloto
    const pilotosResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: '3.Pilotos',
    });
    
    const pilotosRows = pilotosResponse.data.values || [];
    if (pilotosRows.length > 1) {
      // Buscar piloto por email en la columna U (índice 20)
      const emailIndex = 20; // Columna U (índice 20)
      const tiempoAcumuladoCol = 'Y'; // Columna Y
      const distanciaAcumuladaCol = 'Z'; // Columna Z
      const vuelosRealizadosCol = 'AA'; // Columna AA
      
      let pilotoRowIndex = -1;
      for (let i = 1; i < pilotosRows.length; i++) {
        if (pilotosRows[i][emailIndex] && 
            pilotosRows[i][emailIndex].toLowerCase() === emailPiloto.toLowerCase()) {
          pilotoRowIndex = i;
          break;
        }
      }
      
      if (pilotoRowIndex !== -1) {
        // Obtener valores actuales
        const tiempoActualResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `3.Pilotos!${tiempoAcumuladoCol}${pilotoRowIndex + 1}`,
        });
        
        const distanciaActualResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `3.Pilotos!${distanciaAcumuladaCol}${pilotoRowIndex + 1}`,
        });
        
        const vuelosActualResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `3.Pilotos!${vuelosRealizadosCol}${pilotoRowIndex + 1}`,
        });
        
        // Extraer valores numéricos actuales
        const tiempoActual = tiempoActualResponse.data.values?.[0]?.[0] 
          ? parseFloat(tiempoActualResponse.data.values[0][0]) || 0 
          : 0;
          
        const distanciaActual = distanciaActualResponse.data.values?.[0]?.[0] 
          ? parseFloat(distanciaActualResponse.data.values[0][0]) || 0 
          : 0;
          
        const vuelosActual = vuelosActualResponse.data.values?.[0]?.[0] 
          ? parseInt(vuelosActualResponse.data.values[0][0], 10) || 0 
          : 0;
        
        // Calcular nuevos valores
        const nuevoTiempo = tiempoActual + duracion;
        const nuevaDistancia = distanciaActual + distancia;
        const nuevosVuelos = vuelosActual + 1;
        
        // Actualizar tiempo acumulado
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `3.Pilotos!${tiempoAcumuladoCol}${pilotoRowIndex + 1}`,
          valueInputOption: 'RAW',
          resource: {
            values: [[nuevoTiempo]]
          }
        });
        
        // Actualizar distancia acumulada
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `3.Pilotos!${distanciaAcumuladaCol}${pilotoRowIndex + 1}`,
          valueInputOption: 'RAW',
          resource: {
            values: [[nuevaDistancia]]
          }
        });
        
        // Actualizar vuelos realizados
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `3.Pilotos!${vuelosRealizadosCol}${pilotoRowIndex + 1}`,
          valueInputOption: 'RAW',
          resource: {
            values: [[nuevosVuelos]]
          }
        });
        
        // console.log(`Estadísticas del piloto con email ${emailPiloto} actualizadas correctamente`);
      } else {
        console.warn(`No se encontró un piloto con el email: ${emailPiloto}`);
      }
    } else {
      console.warn('No hay datos de pilotos disponibles');
    }
    
    // Actualizar estadísticas del dron
    const dronesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: '3.Drones',
    });
    
    const droneRows = dronesResponse.data.values || [];
    if (droneRows.length > 1) {
      // Buscar el dron por número de serie en la columna B (índice 1)
      const numeroSerieIndex = 1; // Columna B (índice 1)
      const tiempoAcumuladoCol = 'Q'; // Columna Q
      const distanciaAcumuladaCol = 'R'; // Columna R
      const vuelosRealizadosCol = 'S'; // Columna S
      const disponibilidadCol = 'V'; // Columna V para disponibilidad
      
      let droneRowIndex = -1;
      for (let i = 1; i < droneRows.length; i++) {
        if (droneRows[i][numeroSerieIndex] && 
            droneRows[i][numeroSerieIndex].toLowerCase() === dronUsado.toLowerCase()) {
          droneRowIndex = i;
          break;
        }
      }
      
      if (droneRowIndex !== -1) {
        // Obtener valores actuales
        const tiempoActualResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `3.Drones!${tiempoAcumuladoCol}${droneRowIndex + 1}`,
        });
        
        const distanciaActualResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `3.Drones!${distanciaAcumuladaCol}${droneRowIndex + 1}`,
        });
        
        const vuelosActualResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `3.Drones!${vuelosRealizadosCol}${droneRowIndex + 1}`,
        });
        
        // Extraer valores numéricos actuales
        const tiempoActual = tiempoActualResponse.data.values?.[0]?.[0] 
          ? parseFloat(tiempoActualResponse.data.values[0][0]) || 0 
          : 0;
          
        const distanciaActual = distanciaActualResponse.data.values?.[0]?.[0] 
          ? parseFloat(distanciaActualResponse.data.values[0][0]) || 0 
          : 0;
          
        const vuelosActual = vuelosActualResponse.data.values?.[0]?.[0] 
          ? parseInt(vuelosActualResponse.data.values[0][0], 10) || 0 
          : 0;
        
        // Calcular nuevos valores
        const nuevoTiempo = tiempoActual + duracion;
        const nuevaDistancia = distanciaActual + distancia;
        const nuevosVuelos = vuelosActual + 1;
        
        // Actualizar tiempo acumulado
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `3.Drones!${tiempoAcumuladoCol}${droneRowIndex + 1}`,
          valueInputOption: 'RAW',
          resource: {
            values: [[nuevoTiempo]]
          }
        });
        
        // Actualizar distancia acumulada
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `3.Drones!${distanciaAcumuladaCol}${droneRowIndex + 1}`,
          valueInputOption: 'RAW',
          resource: {
            values: [[nuevaDistancia]]
          }
        });
        
        // Actualizar vuelos realizados
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `3.Drones!${vuelosRealizadosCol}${droneRowIndex + 1}`,
          valueInputOption: 'RAW',
          resource: {
            values: [[nuevosVuelos]]
          }
        });
        
        // Actualizar disponibilidad a "No"
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `3.Drones!${disponibilidadCol}${droneRowIndex + 1}`,
          valueInputOption: 'RAW',
          resource: {
            values: [["No"]]
          }
        });
        
        // console.log(`Estadísticas del dron ${dronUsado} actualizadas correctamente`);
      } else {
        console.warn(`No se encontró un dron con el número de serie: ${dronUsado}`);
      }
    } else {
      console.warn('No hay datos de drones disponibles');
    }
    
    // Obtener el último código consecutivo de la hoja 4.ValidarPostvuelo
    const validacionResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: '4.ValidarPostvuelo',
    });
    
    const rowsValidacion = validacionResponse.data.values || [];
    
    // Generar nuevo código consecutivo (APO-X)
    let ultimoNumero = 0;
    if (rowsValidacion.length > 1) {  
      const codigoColumna = 0;
      
      for (let i = 1; i < rowsValidacion.length; i++) {
        if (rowsValidacion[i] && rowsValidacion[i][codigoColumna]) {
          const codigo = rowsValidacion[i][codigoColumna];
          const match = codigo.match(/APO-(\d+)/);
          if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (num > ultimoNumero) {
              ultimoNumero = num;
            }
          }
        }
      }
    }
    
    const nuevoCodigo = `APO-${ultimoNumero + 1}`;
    const fechaActual = new Date().toLocaleDateString('es-ES');

    // Utilizamos los valores obtenidos de la hoja PostVuelo para el registro
    const nuevoRegistro = [
      nuevoCodigo,              // Código consecutivo
      consecutivo,              // ID del registro de SolicitudVuelo
      estado,               // Estado
      pilotoseleccionado,              // Email del piloto 
      dronUsado,                // Dron usado
      fechaActual,              // Fecha actual
      notas,                    // Notas
    ];
    
    // Anexar el nuevo registro a la hoja 4.ValidarPostvuelo
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: '4.ValidarPostvuelo',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [nuevoRegistro]
      }
    });
    
    try {
      // const destinatario = "cardenasdiegom6@gmail.com";
      const destinatario = emailPiloto;

      if (estado === 'Aprobado') {
        await enviarAprobacionPostvuelo({ destinatario, consecutivo, fecha: fechaActual });
      } else {
        await enviarDenegoPostvuelo({ destinatario, consecutivo, fecha: fechaActual });
      }
      console.log(`Notificación enviada para el prevuelo ${consecutivo}`);
    } catch (error) {
      console.error('Error al enviar notificación:', error);
    }
    return {
      codigo: nuevoCodigo,
      fechaValidacion: fechaActual
    };
  } catch (error) {
    console.error('Error al generar validar postvuelo:', error);
    throw error;
  }
};

const enviarAprobacionPostvuelo = async (datos) => {
try {
    const transporter = createTransporter();

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ffffff; color: white; padding: 10px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center;">
            <img src="https://docs.google.com/drawings/d/e/2PACX-1vQw98R1ZTlOAY_mVURreLAh0eGVKAodHN9VVuOk8wBHQ_WZmveIAn6e9588ix1u-NqmnH6rrYjPEzes/pub?w=480&h=360" 
                 alt="Logo SVA" 
                 style="width: 150px; height: auto; margin-right: 10px;">
            <div>
              <h2 style="color: black; font-size: 24px; font-weight: bold; margin: 0;">Postvuelo Aprobado</h2>
              <p style="margin: 5px 0;">SVA SEVICOL LTDA</p>
            </div>
          </div>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p>Su postvuelo ha sido aprobado por parte del jefe de pilotos</p>
          
          <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Consecutivo:</strong> ${datos.consecutivo}</p>
            <p style="margin: 5px 0;"><strong>Fecha:</strong> ${datos.fecha}</p>
          </div>
          
        </div>
        
        <div style="padding: 20px; text-align: center; color: #666;">
          <p>Saludos cordiales,<br>
          Sistema de Gestión de Vuelos<br>
          SVA SEVICOL LTDA</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"Sistema de Vuelos" <dcardenas@sevicol.com.co>',
      to: datos.destinatario,
      subject: `Postvuelo Aprobado - Consecutivo: ${datos.consecutivo}`,
      html: htmlBody
    });

    console.log('Correo enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar correo de notificación:', error);
    throw error;
  }
};

const enviarDenegoPostvuelo = async (datos) => {
try {
    const transporter = createTransporter();

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ffffff; color: white; padding: 10px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center;">
            <img src="https://docs.google.com/drawings/d/e/2PACX-1vQw98R1ZTlOAY_mVURreLAh0eGVKAodHN9VVuOk8wBHQ_WZmveIAn6e9588ix1u-NqmnH6rrYjPEzes/pub?w=480&h=360" 
                 alt="Logo SVA" 
                 style="width: 150px; height: auto; margin-right: 10px;">
            <div>
              <h2 style="color: black; font-size: 24px; font-weight: bold; margin: 0;">Postvuelo Denegado</h2>
              <p style="margin: 5px 0;">SVA SEVICOL LTDA</p>
            </div>
          </div>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p>Su postvuelo ha sido denegado por parte del jefe de pilotos</p>
          
          <div style="background-color: #fff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Consecutivo:</strong> ${datos.consecutivo}</p>
            <p style="margin: 5px 0;"><strong>Fecha:</strong> ${datos.fecha}</p>
          </div>
          
        </div>
        
        <div style="padding: 20px; text-align: center; color: #666;">
          <p>Saludos cordiales,<br>
          Sistema de Gestión de Vuelos<br>
          SVA SEVICOL LTDA</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"Sistema de Vuelos" <dcardenas@sevicol.com.co>',
      to: datos.destinatario,
      subject: `Postvuelo Denegado - Consecutivo: ${datos.consecutivo}`,
      html: htmlBody
    });

    console.log('Correo enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar correo de notificación:', error);
    throw error;
  }
};

export const postvueloHelper = {
  getPostvuelos,
  getSiguienteConsecutivo,
  getPostvueloByConsecutivo,
  getPostvueloOrdenadosPorFechaVuelo,
  getPostvueloOrdenadosPorAltura,
  getPostvueloOrdenadosPorDistancia,
  getPostvueloOrdenadosPorFechaVuelo,
  getPostvueloOrdenadosPorTiempo,
  getPostvuelosAprobados,
  calcularDuracion,
  guardarPostvuelo,
  editarPostvueloPorConsecutivo,
  procesarArchivos,
  actualizarEstadoEnSheets,
  buscarCarpetaPorNombre,
  subirArchivosACarpetaExistente,
  generarValidacionPostvuelo,

};