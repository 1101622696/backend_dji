import { google } from 'googleapis';
import path from 'path';
import stream from 'stream';
import { prevueloHelper } from '../helpers/prevuelos.js';
import {postvueloHelper} from '../helpers/postvuelos.js';
import { firebaseHelper } from '../helpers/firebase.js';

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

// Cliente Sheets
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

const obtenerDatosSolicitud = async (nombreHoja, rango = 'A1:AY1000') => {
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

// const getSolicitudesVuelo = () => obtenerDatosSolicitud('SolicitudVuelo');

const getSolicitudesVuelo = async () => {
  const solicitudes = await obtenerDatosSolicitud('SolicitudVuelo');
  
  return solicitudes.sort((a, b) => {
    const numA = parseInt(a.consecutivo.replace(/\D/g, ''), 10);
    const numB = parseInt(b.consecutivo.replace(/\D/g, ''), 10);
    
    return numB - numA;
  });
};

const getSiguienteConsecutivo = async () => {
  const solicitudes = await getSolicitudesVuelo();
  
  const numeros = solicitudes
    .map(item => {
      const match = item.consecutivo?.match(/\d+/); // Extrae los números de SAV-0001
      return match ? parseInt(match[0], 10) : null;
    })
    .filter(n => n !== null);
  
  const max = numeros.length ? Math.max(...numeros) : 0;
  const siguiente = (max + 1).toString().padStart(4, '0');
  
  return `SAV-${siguiente}`;
};

const guardarSolicitud = async ({ useremail, username, tipodeoperacionaerea, empresa, fecha_inicio, hora_inicio, fecha_fin, hora_fin, detalles_cronograma, peso_maximo, municipio, departamento, tipodecontactovisualconlaua, vueloespecial, justificacionvueloespecial, poligononombre, altura_poligono, latitud_poligono_1, longitud_poligono_1, latitud_poligono_2, longitud_poligono_2, latitud_poligono_3, longitud_poligono_3, latitud_poligono_4, longitud_poligono_4, latitud_poligono_5, longitud_poligono_5, tramolinealnombre, altura_tramo, latitud_tramo_1, longitud_tramo_1, latitud_tramo_2, longitud_tramo_2, latitud_tramo_3, longitud_tramo_3, latitud_tramo_4, longitud_tramo_4, latitud_tramo_5, longitud_tramo_5, circuferenciaencoordenadayradionombre, altura_circunferencia, latitud_circunferencia_1, longitud_circunferencia_1, check_kmz, Link, estado, fechadeCreacion, realizado, username_final, useremail_final }) => {
  const sheets = await getSheetsClient();
  const consecutivo = await getSiguienteConsecutivo();
 
  const nuevaFila = [consecutivo, useremail === null ? '' : useremail, username === null ? '' : username, tipodeoperacionaerea, empresa, fecha_inicio, hora_inicio, fecha_fin, hora_fin, detalles_cronograma, peso_maximo, municipio, departamento, tipodecontactovisualconlaua, vueloespecial, justificacionvueloespecial, poligononombre, altura_poligono, latitud_poligono_1, longitud_poligono_1, latitud_poligono_2, longitud_poligono_2, latitud_poligono_3, longitud_poligono_3, latitud_poligono_4, longitud_poligono_4, latitud_poligono_5, longitud_poligono_5, tramolinealnombre, altura_tramo, latitud_tramo_1, longitud_tramo_1, latitud_tramo_2, longitud_tramo_2, latitud_tramo_3, longitud_tramo_3, latitud_tramo_4, longitud_tramo_4, latitud_tramo_5, longitud_tramo_5, circuferenciaencoordenadayradionombre, altura_circunferencia, latitud_circunferencia_1, longitud_circunferencia_1, check_kmz, Link, estado, fechadeCreacion, realizado, username_final, useremail_final];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'SolicitudVuelo!A1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [nuevaFila] },
  });

  return { consecutivo };
};

const getSolicitudesByConsecutivo = async (consecutivo) => {
  const solicitudes = await getSolicitudesVuelo();
  return solicitudes.find(solicitud => 
    solicitud.consecutivo && solicitud.consecutivo.toLowerCase() === consecutivo.toLowerCase()
  );
};
const getSolicitudesByStatus = async (status) => {
  const solicitudes = await getSolicitudesVuelo();
  return solicitudes.filter(solicitud => 
    solicitud.estado && solicitud.estado.toLowerCase() === status.toLowerCase()
  );
};

const getSolicitudesByCliente = async (cliente) => {
  const solicitudes = await getSolicitudesVuelo();
  return solicitudes.filter(solicitud => 
    solicitud.empresa && solicitud.empresa.toLowerCase() === cliente.toLowerCase()
  );
};

const getEssolicitudPendiente = async (consecutivo) => {
  const solicitud = await getSolicitudesByConsecutivo(consecutivo);
  return solicitud && solicitud.estado && solicitud.estado.toLowerCase() === 'pendiente';
};
const getConsecutivosPrevuelo = async () => {
  try {
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Prevuelo!C:C', 
    });
    
    if (!response.data.values || response.data.values.length === 0) {
      return [];
    }
    
    const consecutivos = response.data.values.slice(1).map(row => row[0]?.toLowerCase());
    return consecutivos.filter(Boolean); 
  } catch (error) {
    console.error('Error al obtener consecutivos de Prevuelo:', error);
    throw error;
  }
};

const getSolicitudesEnProceso = async () => {
  try {
    // Obtener todas las solicitudes
    const solicitudes = await getSolicitudesVuelo();
    
    // Obtener todos los consecutivos de Prevuelo
    const consecutivosPrevuelo = await getConsecutivosPrevuelo();
    
    // Filtrar las solicitudes que no están en Prevuelo
    return solicitudes.filter(solicitud => 
      solicitud.consecutivo && 
      !consecutivosPrevuelo.includes(solicitud.consecutivo.toLowerCase())
    );
  } catch (error) {
    console.error('Error al obtener solicitudes en proceso:', error);
    throw error;
  }
};

const getSolicitudesEnProcesoPorEmail = async (email) => {
  try {
    const solicitudesEnProceso = await getSolicitudesEnProceso();
    
    return solicitudesEnProceso.filter(solicitud => 
      solicitud.usuario && 
      solicitud.usuario.toLowerCase() === email.toLowerCase()
    );
  } catch (error) {
    console.error('Error al obtener solicitudes en proceso por email:', error);
    throw error;
  }
};

const getSolicitudesByEmail = async (email) => {
  const solicitudes = await getSolicitudesVuelo();
  return solicitudes.filter(solicitud => 
    solicitud.usuario && solicitud.usuario.toLowerCase() === email.toLowerCase()
  );
};

const getSolicitudesByLastEmail = async (email) => {
  const solicitudes = await getSolicitudesVuelo();
  return solicitudes.filter(solicitud => {
    const esCoordinador = solicitud.correodelcoordinador && 
                          solicitud.correodelcoordinador.toLowerCase() === email.toLowerCase();
    
    const esUsuario = solicitud.usuario && 
                      solicitud.usuario.toLowerCase() === email.toLowerCase();
    
    return esCoordinador && !esUsuario;
  });
};

const getSolicitudesByEmailAndStatus = async (email, status) => {
  const solicitudes = await getSolicitudesVuelo();
  return solicitudes.filter(solicitud => 
    solicitud.usuario && 
    solicitud.usuario.toLowerCase() === email.toLowerCase() &&
    solicitud.estado && 
    solicitud.estado.toLowerCase() === status.toLowerCase()
  );
};

const getSolicitudConEtapas = async (consecutivo) => {
  try {
    const solicitudes = await getSolicitudesVuelo();
    const solicitud = solicitudes.find(s => s.consecutivo === consecutivo);
    
    if (!solicitud) {
      return null;
    }
    
    // Comprobaciones dependientes en cascada
    const solicitudExiste = true;
    const solicitudAprobada = solicitud.estado === 'Aprobado';
    
    // Solo buscar prevuelo si la solicitud está aprobada
    let prevuelo = null;
    let prevueloExiste = false;
    let prevueloAprobado = false;
    
    if (solicitudAprobada) {
      const prevuelos = await prevueloHelper.getPrevuelos();
      prevuelo = prevuelos.find(p => p.solicitudesaprobadas === consecutivo);
      prevueloExiste = !!prevuelo;
      prevueloAprobado = prevuelo ? prevuelo["estado del prevuelo"] === "Aprobado" : false;
    }
    
    // Solo buscar postvuelo si el prevuelo existe y está aprobado
    let postvuelo = null;
    let postvueloExiste = false;
    let postvueloAprobado = false;
    
    if (prevueloExiste && prevueloAprobado) {
      const postvuelos = await postvueloHelper.getPostvuelos();
      postvuelo = postvuelos.find(p => p['consecutivo-solicitud'] === consecutivo);
      postvueloExiste = !!postvuelo;
      postvueloAprobado = postvuelo ? postvuelo["estado del postvuelo"] === "Aprobado" : false;
    }
    
    return {
      solicitud,
      solicitudExiste,
      solicitudAprobada,
      prevueloExiste,
      prevueloAprobado,
      postvueloExiste,
      postvueloAprobado,
      estadoProceso: determinarEstadoProceso(
        solicitudExiste, 
        solicitudAprobada, 
        prevueloExiste, 
        prevueloAprobado, 
        postvueloExiste, 
        postvueloAprobado
      )
    };
  } catch (error) {
    console.error('Error al obtener solicitud con etapas:', error);
    throw error;
  }
};

const determinarEstadoProceso = (
  solicitudExiste, 
  solicitudAprobada, 
  prevueloExiste, 
  prevueloAprobado, 
  postvueloExiste, 
  postvueloAprobado
) => {
  if (!solicitudExiste) return 'Desconocido';
  
  if (!solicitudAprobada) {
    return 'Pendiente de aprobación';
  }
  
  if (!prevueloExiste) {
    return 'Solicitud aprobada, pendiente de prevuelo';
  }
  
  if (!prevueloAprobado) {
    return 'Prevuelo pendiente de aprobación';
  }
  
  if (!postvueloExiste) {
    return 'Prevuelo aprobado, pendiente de postvuelo';
  }
  
  if (!postvueloAprobado) {
    return 'Postvuelo pendiente de aprobación';
  }
  
  return 'Proceso Completado';
};

const getAllSolicitudesConEtapas = async () => {
  try {
    const solicitudes = await getSolicitudesVuelo();
    const prevuelos = await prevueloHelper.getPrevuelos();
    const postvuelos = await postvueloHelper.getPostvuelos();
    
    return solicitudes.map(solicitud => {
      const solicitudExiste = true;
      const solicitudAprobada = solicitud.estado === 'Aprobado';
      
      let prevueloExiste = false;
      let prevueloAprobado = false;
      
      if (solicitudAprobada) {
        const prevuelo = prevuelos.find(p => p.solicitudesaprobadas === solicitud.consecutivo);
        prevueloExiste = !!prevuelo;
        prevueloAprobado = prevuelo ? prevuelo["estado del prevuelo"] === "Aprobado" : false;
      }
      
      let postvueloExiste = false;
      let postvueloAprobado = false;
      
      if (prevueloExiste && prevueloAprobado) {
        const postvuelo = postvuelos.find(p => p['consecutivo-solicitud'] === solicitud.consecutivo);
        postvueloExiste = !!postvuelo;
        postvueloAprobado = postvuelo ? postvuelo["estado del postvuelo"] === "Aprobado" : false;
      }
      
      return {
        ...solicitud,
        solicitudExiste,
        solicitudAprobada,
        prevueloExiste,
        prevueloAprobado,
        postvueloExiste,
        postvueloAprobado,
        estadoProceso: determinarEstadoProceso(
          solicitudExiste, 
          solicitudAprobada, 
          prevueloExiste, 
          prevueloAprobado, 
          postvueloExiste, 
          postvueloAprobado
        )
      };
    });
  } catch (error) {
    console.error('Error al obtener todas las solicitudes con etapas:', error);
    throw error;
  }
};

const getAllSolicitudesConEtapasEmail = async (email) => {
  try {
    const solicitudesconetapasemail = await getAllSolicitudesConEtapas();
 
        return solicitudesconetapasemail.filter(solicitud => 
          solicitud.usuario && solicitud.usuario.toLowerCase() === email.toLowerCase()
        );
      } catch (error) {
        console.error('Error al obtener solicitudes con etapas por email:', error);
        throw error;
      }

};



// fase mejorara para obtener los consecutivos con su estado en cada proceso 

const obtenerTodasLasHojas = async () => {
  const sheets = await getSheetsClient();
  
  // Una sola llamada a la API para obtener todas las hojas
  const batchRequest = {
    spreadsheetId,
    ranges: [
      'SolicitudVuelo!A1:AY1000',
      'Prevuelo!A1:AK1000', 
      'PostVuelo!A1:S1000'
    ],
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING'
  };

  const response = await sheets.spreadsheets.values.batchGet(batchRequest);
  
  return {
    solicitudVuelo: response.data.valueRanges[0].values || [],
    prevuelo: response.data.valueRanges[1].values || [],
    postVuelo: response.data.valueRanges[2].values || []
  };
};

// Función para determinar el estado general
const determinarEstadoGeneral = (estadoPrevuelo, estadoPostVuelo) => {
  if (estadoPrevuelo === "Aprobado" && estadoPostVuelo === "Aprobado") {
    return "Completado";
  }
  if (estadoPostVuelo === "Pendiente") {
    return "Postvuelo Pendiente";
  }
  if (estadoPrevuelo === "Pendiente") {
    return "Prevuelo Pendiente";
  }
  if (estadoPrevuelo === "No iniciado") {
    return "Prevuelo no iniciado";
  }
  if (estadoPrevuelo === "Cancelado") {
    return "Cancelado";
  }
  
  return "Sin Postvuelo";
};

// Función principal que obtiene todas las solicitudes con sus estados (equivalente a getSolicitudesConEstadosGenerales)
const getSolicitudesConEstadosGenerales = async () => {
  try {
    const { solicitudVuelo, prevuelo, postVuelo } = await obtenerTodasLasHojas();

    if (!solicitudVuelo.length || !prevuelo.length || !postVuelo.length) {
      throw new Error('No se pudieron obtener los datos de las hojas');
    }

    // Crear mapas para prevuelo y postvuelo para búsqueda rápida
    const mapaPrevuelo = {};
    const mapaPostVuelo = {};

    // Procesar datos de prevuelo (empezar desde índice 1 para saltar headers)
    for (let i = 1; i < prevuelo.length; i++) {
      if (prevuelo[i].length > 35) {
        const email = prevuelo[i][1];
        const consecutivo = prevuelo[i][2];
        const estado = prevuelo[i][35];
        
        if (email && consecutivo) {
          mapaPrevuelo[`${consecutivo}-${email}`] = estado || "No iniciado";
        }
      }
    }

    // Procesar datos de postvuelo
    for (let i = 1; i < postVuelo.length; i++) {
      if (postVuelo[i].length > 16) {
        const prevueloAsociado = postVuelo[i][1];
        const estado = postVuelo[i][16];
        
        if (prevueloAsociado) {
          mapaPostVuelo[prevueloAsociado] = estado || "No iniciado";
        }
      }
    }

    const resultados = [];

    // Procesar solicitudes
    for (let i = 1; i < solicitudVuelo.length; i++) {
      if (solicitudVuelo[i].length > 46) {
        const fila = solicitudVuelo[i];
        const consecutivo = fila[0];
        const email = fila[1];
        const piloto = fila[2];
        const cliente = fila[4];
        const fecha = fila[5];
        const estadoSolicitud = fila[46];

        if (consecutivo && email) {
          const clave = `${consecutivo}-${email}`;
          const estadoPrevuelo = mapaPrevuelo[clave] || "No iniciado";
          const estadoPostVuelo = mapaPostVuelo[consecutivo] || "No iniciado";

          // Formatear fecha si es necesario
          let fechaFormateada = fecha;
          if (fecha instanceof Date) {
            fechaFormateada = fecha.toISOString().split('T')[0];
          } else if (typeof fecha === 'string' && fecha.includes('T')) {
            fechaFormateada = fecha.split('T')[0];
          }

          resultados.push({
            consecutivo,
            email,
            cliente: cliente || '',
            fecha: fechaFormateada || '',
            piloto: piloto || '',
            estadoSolicitud: estadoSolicitud || 'Pendiente',
            estadoPrevuelo,
            estadoPostVuelo,
            estadoGeneral: determinarEstadoGeneral(estadoPrevuelo, estadoPostVuelo)
          });
        }
      }
    }

    // Ordenar por consecutivo (más reciente primero)
    return resultados.sort((a, b) => {
      const numA = parseInt(a.consecutivo.replace(/\D/g, ''), 10);
      const numB = parseInt(b.consecutivo.replace(/\D/g, ''), 10);
      return numB - numA;
    });

  } catch (error) {
    console.error('Error al obtener solicitudes con estados generales:', error);
    throw error;
  }
};

const getSolicitudesConEstadosGeneralesSolicitante = async () => {
  try {
    const { solicitudVuelo, prevuelo, postVuelo } = await obtenerTodasLasHojas();

    if (!solicitudVuelo.length || !prevuelo.length || !postVuelo.length) {
      throw new Error('No se pudieron obtener los datos de las hojas');
    }

    // Crear mapas para prevuelo y postvuelo para búsqueda rápida
    const mapaPrevuelo = {};
    const mapaPostVuelo = {};

    // Procesar datos de prevuelo (empezar desde índice 1 para saltar headers)
  for (let i = 1; i < prevuelo.length; i++) {
    const consecutivo = prevuelo[i][2]; 
    const estado = prevuelo[i][35];
    
    if (consecutivo && estado) {
      mapaPrevuelo[consecutivo] = estado;
    }
  }

    // Procesar datos de postvuelo
    for (let i = 1; i < postVuelo.length; i++) {
      if (postVuelo[i].length > 16) {
        const prevueloAsociado = postVuelo[i][1];
        const estado = postVuelo[i][16];
        
        if (prevueloAsociado) {
          mapaPostVuelo[prevueloAsociado] = estado || "No iniciado";
        }
      }
    }

    const resultados = [];

    // Procesar solicitudes
    for (let i = 1; i < solicitudVuelo.length; i++) {
      if (solicitudVuelo[i].length > 46) {
        const fila = solicitudVuelo[i];
        const consecutivo = fila[0];
        const email = fila[50];
        const piloto = fila[2];
        const cliente = fila[4];
        const fecha = fila[5];
        const estadoSolicitud = fila[46];

        if (consecutivo && email) {
          const clave = `${consecutivo}-${email}`;
          const estadoPrevuelo = mapaPrevuelo[clave] || "No iniciado";
          const estadoPostVuelo = mapaPostVuelo[consecutivo] || "No iniciado";

          // Formatear fecha si es necesario
          let fechaFormateada = fecha;
          if (fecha instanceof Date) {
            fechaFormateada = fecha.toISOString().split('T')[0];
          } else if (typeof fecha === 'string' && fecha.includes('T')) {
            fechaFormateada = fecha.split('T')[0];
          }

          resultados.push({
            consecutivo,
            email,
            cliente: cliente || '',
            fecha: fechaFormateada || '',
            piloto: piloto || '',
            estadoSolicitud: estadoSolicitud || 'Pendiente',
            estadoPrevuelo,
            estadoPostVuelo,
            estadoGeneral: determinarEstadoGeneral(estadoPrevuelo, estadoPostVuelo)
          });
        }
      }
    }

    // Ordenar por consecutivo (más reciente primero)
    return resultados.sort((a, b) => {
      const numA = parseInt(a.consecutivo.replace(/\D/g, ''), 10);
      const numB = parseInt(b.consecutivo.replace(/\D/g, ''), 10);
      return numB - numA;
    });

  } catch (error) {
    console.error('Error al obtener solicitudes con estados generales:', error);
    throw error;
  }
};

// Función para obtener resumen por email (equivalente a getResumenSolicitudes)
const getResumenSolicitudesPorEmail = async (email) => {
  try {
    const todasLasSolicitudes = await getSolicitudesConEstadosGenerales();
    const solicitudesFiltradas = todasLasSolicitudes.filter(s => s.email === email);

    const mapConDatos = (lista) => {
      return lista.map(r => ({
        consecutivo: r.consecutivo,
        cliente: r.cliente || '',
        piloto: r.piloto || '',
        fecha: r.fecha || '',
        estadoSolicitud: r.estadoSolicitud,
        estadoPrevuelo: r.estadoPrevuelo,
        estadoPostVuelo: r.estadoPostVuelo,
        estadoGeneral: r.estadoGeneral
      }));
    };

    return {
      total: {
        count: solicitudesFiltradas.length,
        consecutivos: mapConDatos(solicitudesFiltradas)
      },
      pendientes: {
        count: solicitudesFiltradas.filter(r => 
          r.estadoSolicitud === "Pendiente" || 
          r.estadoPrevuelo === "Pendiente" || 
          r.estadoPostVuelo === "Pendiente"
        ).length,
        consecutivos: mapConDatos(solicitudesFiltradas.filter(r => 
          r.estadoSolicitud === "Pendiente" || 
          r.estadoPrevuelo === "Pendiente" || 
          r.estadoPostVuelo === "Pendiente"
        ))
      },
      enespera: {
        count: solicitudesFiltradas.filter(r => r.estadoSolicitud === "Enespera").length,
        consecutivos: mapConDatos(solicitudesFiltradas.filter(r => r.estadoSolicitud === "Enespera"))
      },
      sinprevuelos: {
        count: solicitudesFiltradas.filter(r => r.estadoPrevuelo === "No iniciado").length,
        consecutivos: mapConDatos(solicitudesFiltradas.filter(r => r.estadoPrevuelo === "No iniciado"))
      },
      sinpostvuelos: {
        count: solicitudesFiltradas.filter(r => r.estadoPostVuelo === "No iniciado").length,
        consecutivos: mapConDatos(solicitudesFiltradas.filter(r => r.estadoPostVuelo === "No iniciado"))
      },
      aprobados: {
        count: solicitudesFiltradas.filter(r => 
          r.estadoSolicitud === "Aprobado" || 
          r.estadoPrevuelo === "Aprobado" || 
          r.estadoPostVuelo === "Aprobado"
        ).length,
        consecutivos: mapConDatos(solicitudesFiltradas.filter(r => 
          r.estadoSolicitud === "Aprobado" || 
          r.estadoPrevuelo === "Aprobado" || 
          r.estadoPostVuelo === "Aprobado"
        ))
      },
      completados: {
        count: solicitudesFiltradas.filter(r => 
          r.estadoSolicitud === "Aprobado" && 
          r.estadoPrevuelo === "Aprobado" && 
          r.estadoPostVuelo === "Aprobado"
        ).length,
        consecutivos: mapConDatos(solicitudesFiltradas.filter(r => 
          r.estadoSolicitud === "Aprobado" && 
          r.estadoPrevuelo === "Aprobado" && 
          r.estadoPostVuelo === "Aprobado"
        ))
      },
      cancelados: {
        count: solicitudesFiltradas.filter(r => r.estadoSolicitud === "Cancelado").length,
        consecutivos: mapConDatos(solicitudesFiltradas.filter(r => r.estadoSolicitud === "Cancelado"))
      }
    };
  } catch (error) {
    console.error('Error al obtener resumen de solicitudes por email:', error);
    throw error;
  }
};

const getResumenSolicitudesPorSolicitante = async (email) => {
  try {
    const todasLasSolicitudes = await getSolicitudesConEstadosGeneralesSolicitante();
    const solicitudesFiltradas = todasLasSolicitudes.filter(s => s.email === email);

    const mapConDatos = (lista) => {
      return lista.map(r => ({
        consecutivo: r.consecutivo,
        cliente: r.cliente || '',
        piloto: r.piloto || '',
        fecha: r.fecha || '',
        estadoSolicitud: r.estadoSolicitud,
        estadoPrevuelo: r.estadoPrevuelo,
        estadoPostVuelo: r.estadoPostVuelo,
        estadoGeneral: r.estadoGeneral
      }));
    };

    return {
      total: {
        count: solicitudesFiltradas.length,
        consecutivos: mapConDatos(solicitudesFiltradas)
      },
      pendientes: {
        count: solicitudesFiltradas.filter(r => 
          r.estadoSolicitud === "Pendiente" || 
          r.estadoPrevuelo === "Pendiente" || 
          r.estadoPostVuelo === "Pendiente"
        ).length,
        consecutivos: mapConDatos(solicitudesFiltradas.filter(r => 
          r.estadoSolicitud === "Pendiente" || 
          r.estadoPrevuelo === "Pendiente" || 
          r.estadoPostVuelo === "Pendiente"
        ))
      },
      enespera: {
        count: solicitudesFiltradas.filter(r => r.estadoSolicitud === "Enespera").length,
        consecutivos: mapConDatos(solicitudesFiltradas.filter(r => r.estadoSolicitud === "Enespera"))
      },
      sinprevuelos: {
        count: solicitudesFiltradas.filter(r => r.estadoPrevuelo === "No iniciado").length,
        consecutivos: mapConDatos(solicitudesFiltradas.filter(r => r.estadoPrevuelo === "No iniciado"))
      },
      sinpostvuelos: {
        count: solicitudesFiltradas.filter(r => r.estadoPostVuelo === "No iniciado").length,
        consecutivos: mapConDatos(solicitudesFiltradas.filter(r => r.estadoPostVuelo === "No iniciado"))
      },
      aprobados: {
        count: solicitudesFiltradas.filter(r => 
          r.estadoSolicitud === "Aprobado" || 
          r.estadoPrevuelo === "Aprobado" || 
          r.estadoPostVuelo === "Aprobado"
        ).length,
        consecutivos: mapConDatos(solicitudesFiltradas.filter(r => 
          r.estadoSolicitud === "Aprobado" || 
          r.estadoPrevuelo === "Aprobado" || 
          r.estadoPostVuelo === "Aprobado"
        ))
      },
      completados: {
        count: solicitudesFiltradas.filter(r => 
          r.estadoSolicitud === "Aprobado" && 
          r.estadoPrevuelo === "Aprobado" && 
          r.estadoPostVuelo === "Aprobado"
        ).length,
        consecutivos: mapConDatos(solicitudesFiltradas.filter(r => 
          r.estadoSolicitud === "Aprobado" && 
          r.estadoPrevuelo === "Aprobado" && 
          r.estadoPostVuelo === "Aprobado"
        ))
      },
      cancelados: {
        count: solicitudesFiltradas.filter(r => r.estadoSolicitud === "Cancelado").length,
        consecutivos: mapConDatos(solicitudesFiltradas.filter(r => r.estadoSolicitud === "Cancelado"))
      }
    };
  } catch (error) {
    console.error('Error al obtener resumen de solicitudes por email:', error);
    throw error;
  }
};

const getResumenSolicitudesGeneral = async () => {
  try {
    const todasLasSolicitudes = await getSolicitudesConEstadosGenerales();

    const mapConDatos = (lista) => {
      return lista.map(r => ({
        consecutivo: r.consecutivo,
        cliente: r.cliente || '',
        piloto: r.piloto || '',
        fecha: r.fecha || '',
        estadoSolicitud: r.estadoSolicitud,
        estadoPrevuelo: r.estadoPrevuelo,
        estadoPostVuelo: r.estadoPostVuelo,
        estadoGeneral: r.estadoGeneral
      }));
    };

    return {
      total: {
        count: todasLasSolicitudes.length,
        consecutivos: mapConDatos(todasLasSolicitudes)
      },
      pendientes: {
        count: todasLasSolicitudes.filter(r => 
          r.estadoSolicitud === "Pendiente" || 
          r.estadoPrevuelo === "Pendiente" || 
          r.estadoPostVuelo === "Pendiente"
        ).length,
        consecutivos: mapConDatos(todasLasSolicitudes.filter(r => 
          r.estadoSolicitud === "Pendiente" || 
          r.estadoPrevuelo === "Pendiente" || 
          r.estadoPostVuelo === "Pendiente"
        ))
      },
      enespera: {
        count: todasLasSolicitudes.filter(r => r.estadoSolicitud === "Enespera").length,
        consecutivos: mapConDatos(todasLasSolicitudes.filter(r => r.estadoSolicitud === "Enespera"))
      },
      sinprevuelos: {
        count: todasLasSolicitudes.filter(r => r.estadoPrevuelo === "No iniciado").length,
        consecutivos: mapConDatos(todasLasSolicitudes.filter(r => r.estadoPrevuelo === "No iniciado"))
      },
      sinpostvuelos: {
        count: todasLasSolicitudes.filter(r => r.estadoPostVuelo === "No iniciado").length,
        consecutivos: mapConDatos(todasLasSolicitudes.filter(r => r.estadoPostVuelo === "No iniciado"))
      },
      aprobados: {
        count: todasLasSolicitudes.filter(r => 
          r.estadoSolicitud === "Aprobado" || 
          r.estadoPrevuelo === "Aprobado" || 
          r.estadoPostVuelo === "Aprobado"
        ).length,
        consecutivos: mapConDatos(todasLasSolicitudes.filter(r => 
          r.estadoSolicitud === "Aprobado" || 
          r.estadoPrevuelo === "Aprobado" || 
          r.estadoPostVuelo === "Aprobado"
        ))
      },
      completados: {
        count: todasLasSolicitudes.filter(r => 
          r.estadoSolicitud === "Aprobado" && 
          r.estadoPrevuelo === "Aprobado" && 
          r.estadoPostVuelo === "Aprobado"
        ).length,
        consecutivos: mapConDatos(todasLasSolicitudes.filter(r => 
          r.estadoSolicitud === "Aprobado" && 
          r.estadoPrevuelo === "Aprobado" && 
          r.estadoPostVuelo === "Aprobado"
        ))
      },
      cancelados: {
        count: todasLasSolicitudes.filter(r => r.estadoSolicitud === "Cancelado").length,
        consecutivos: mapConDatos(todasLasSolicitudes.filter(r => r.estadoSolicitud === "Cancelado"))
      }
    };
  } catch (error) {
    console.error('Error al obtener resumen de solicitudes por email:', error);
    throw error;
  }
};


// Función para obtener solicitud específica por consecutivo y email
const getSolicitudPorConsecutivo = async (consecutivo, email = null) => {
  try {
    const todasLasSolicitudes = await getSolicitudesConEstadosGenerales();
    
    if (email) {
      return todasLasSolicitudes.find(s => s.consecutivo === consecutivo && s.email === email);
    } else {
      return todasLasSolicitudes.find(s => s.consecutivo === consecutivo);
    }
  } catch (error) {
    console.error('Error al obtener solicitud por consecutivo:', error);
    throw error;
  }
};

// Función para obtener solicitudes por estado general
const getSolicitudesPorEstadoGeneral = async (estadoGeneral, email = null) => {
  try {
    const todasLasSolicitudes = await getSolicitudesConEstadosGenerales();
    let solicitudesFiltradas = todasLasSolicitudes.filter(s => s.estadoGeneral === estadoGeneral);
    
    if (email) {
      solicitudesFiltradas = solicitudesFiltradas.filter(s => s.email === email);
    }
    
    return solicitudesFiltradas;
  } catch (error) {
    console.error('Error al obtener solicitudes por estado general:', error);
    throw error;
  }
};

// Función de utilidad para obtener todos los estados únicos
const getEstadosDisponibles = async () => {
  try {
    const todasLasSolicitudes = await getSolicitudesConEstadosGenerales();
    
    const estadosGenerales = [...new Set(todasLasSolicitudes.map(s => s.estadoGeneral))];
    const estadosSolicitud = [...new Set(todasLasSolicitudes.map(s => s.estadoSolicitud))];
    const estadosPrevuelo = [...new Set(todasLasSolicitudes.map(s => s.estadoPrevuelo))];
    const estadosPostVuelo = [...new Set(todasLasSolicitudes.map(s => s.estadoPostVuelo))];
    
    return {
      estadosGenerales,
      estadosSolicitud,
      estadosPrevuelo,
      estadosPostVuelo
    };
  } catch (error) {
    console.error('Error al obtener estados disponibles:', error);
    throw error;
  }
};



const editarSolicitudPorConsecutivo = async (consecutivo, nuevosDatos) => {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'SolicitudVuelo!A2:N', 
  });

  const filas = response.data.values;
  const filaIndex = filas.findIndex(fila => fila[0]?.toLowerCase() === consecutivo.toLowerCase());

  if (filaIndex === -1) {
    return null; 
  }

  const filaActual = filas[filaIndex];
  
  const filaEditada = [
    filaActual[0], 
    nuevosDatos.useremail || filaActual[1],
    nuevosDatos.username || filaActual[2], 
    nuevosDatos.tipodeoperacionaerea || filaActual[3], 
    nuevosDatos.empresa || filaActual[4],
    nuevosDatos.fecha_inicio || filaActual[5], 
    nuevosDatos.hora_inicio || filaActual[6], 
    nuevosDatos.fecha_fin || filaActual[7], 
    nuevosDatos.hora_fin || filaActual[8], 
    nuevosDatos.detalles_cronograma || filaActual[9], 
    nuevosDatos.peso_maximo || filaActual[10], 
    nuevosDatos.municipio || filaActual[11], 
    nuevosDatos.departamento || filaActual[12], 
    nuevosDatos.tipodecontactovisualconlaua || filaActual[13], 
    nuevosDatos.vueloespecial || filaActual[14], 
    nuevosDatos.justificacionvueloespecial || filaActual[15], 
    nuevosDatos.poligononombre || filaActual[16], 
    nuevosDatos.altura_poligono || filaActual[17], 
    nuevosDatos.latitud_poligono_1 || filaActual[18], 
    nuevosDatos.longitud_poligono_1 || filaActual[19], 
    nuevosDatos.latitud_poligono_2 || filaActual[20], 
    nuevosDatos.longitud_poligono_2 || filaActual[21], 
    nuevosDatos.latitud_poligono_3 || filaActual[22], 
    nuevosDatos.longitud_poligono_3 || filaActual[23], 
    nuevosDatos.latitud_poligono_4 || filaActual[24], 
    nuevosDatos.longitud_poligono_4 || filaActual[25], 
    nuevosDatos.latitud_poligono_5 || filaActual[26], 
    nuevosDatos.longitud_poligono_5 || filaActual[27], 
    nuevosDatos.tramolinealnombre || filaActual[28], 
    nuevosDatos.altura_tramo || filaActual[29], 
    nuevosDatos.latitud_tramo_1 || filaActual[30], 
    nuevosDatos.longitud_tramo_1 || filaActual[31], 
    nuevosDatos.latitud_tramo_2 || filaActual[32], 
    nuevosDatos.longitud_tramo_2 || filaActual[33], 
    nuevosDatos.latitud_tramo_3 || filaActual[34], 
    nuevosDatos.longitud_tramo_3 || filaActual[35], 
    nuevosDatos.latitud_tramo_4 || filaActual[36], 
    nuevosDatos.longitud_tramo_4 || filaActual[37], 
    nuevosDatos.latitud_tramo_5 || filaActual[38], 
    nuevosDatos.longitud_tramo_5 || filaActual[39], 
    nuevosDatos.circuferenciaencoordenadayradionombre || filaActual[40], 
    nuevosDatos.altura_circunferencia || filaActual[41], 
    nuevosDatos.latitud_circunferencia_1 || filaActual[42], 
    nuevosDatos.longitud_circunferencia_1 || filaActual[43], 
    filaActual[44], 
    nuevosDatos.Link || filaActual[45], 
    filaActual[46], 
    filaActual[47], 
    nuevosDatos.realizado || filaActual[48], 
    nuevosDatos.username || filaActual[49], 
    nuevosDatos.useremail || filaActual[50], 
  ];

  const filaEnHoja = filaIndex + 2; 

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `SolicitudVuelo!A${filaEnHoja}:AY${filaEnHoja}`,
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
  
  const carpetaPadreId = '1iaCvCuKoK-uMelKCg2OREkFBQj8bq5fW';
  
  let carpeta = await buscarCarpetaPorNombre(consecutivo, carpetaPadreId);
  
  if (!carpeta) {
    carpeta = await crearCarpeta(consecutivo, carpetaPadreId);
  }
  
  const enlaces = [];
  for (const archivo of archivos) {
    const enlace = await subirArchivo(archivo, carpeta.id);
    enlaces.push(enlace);
  }
  
  return carpeta.webViewLink;
};

const actualizarEstadoEnSheets = async (consecutivo, nuevoEstado = "aprobado") => {
  try {
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'SolicitudVuelo',
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No se encontraron datos en la hoja');
    }
    
    const headers = rows[0];
    const consecutivoIndex = headers.findIndex(header => 
      header.toLowerCase() === 'consecutivo');
    const estadoIndex = headers.findIndex(header => 
      header.toLowerCase() === 'estado');
    
    if (consecutivoIndex === -1 || estadoIndex === -1) {
      throw new Error('No se encontraron las columnas necesarias');
    }
    
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
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `SolicitudVuelo!${getColumnLetter(estadoIndex + 1)}${rowIndex + 1}`,
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

const putSolicitudByStatus = async (consecutivo, nuevoEstado = "aprobado") => {
  return await actualizarEstadoEnSheets(consecutivo, nuevoEstado);
};

const subirArchivosACarpetaExistente = async (archivos, carpetaId) => {
  if (!archivos || archivos.length === 0) {
    return null;
  }
  
  const enlaces = [];
  for (const archivo of archivos) {
    const enlace = await subirArchivo(archivo, carpetaId);
    enlaces.push(enlace);
  }
  
  const drive = await getDriveClient();
  const carpeta = await drive.files.get({
    fileId: carpetaId,
    fields: 'webViewLink'
  });
  
  return carpeta.data.webViewLink;
};

const buscarCarpetaPorNombre = async (nombreCarpeta, parentFolderId) => {
  const drive = await getDriveClient();
  
  let query = `name = '${nombreCarpeta}' and mimeType = 'application/vnd.google-apps.folder'`;
  if (parentFolderId) {
    query += ` and '${parentFolderId}' in parents`;
  }
  
  const response = await drive.files.list({
    q: query,
    fields: 'files(id, name, webViewLink)',
    spaces: 'drive'
  });
  
  return response.data.files.length > 0 ? response.data.files[0] : null;
};

const generarValidacionPrevuelo = async (consecutivo, numeroserie, piloto, notas = '') => {
  try {
    const sheets = await getSheetsClient();
    
    const solicitudResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'SolicitudVuelo',
    });
    
    const rowsSolicitud = solicitudResponse.data.values;
    if (!rowsSolicitud || rowsSolicitud.length === 0) {
      throw new Error('No se encontraron datos en la hoja SolicitudVuelo');
    }
    
    const headersSolicitud = rowsSolicitud[0];
    const consecutivoIndex = headersSolicitud.findIndex(header => 
      header.toLowerCase() === 'consecutivo');
    const empresaIndex = headersSolicitud.findIndex(header => 
      header.toLowerCase() === 'empresa');
    const fechaIndex = headersSolicitud.findIndex(header => 
      header.toLowerCase() === 'fecha_inicio');
    const nombreCompletoIndex = headersSolicitud.findIndex(header => 
      header.toLowerCase() === 'nombre_completo');
    const usuarioIndex = headersSolicitud.findIndex(header => 
      header.toLowerCase() === 'usuario');
      
    if (consecutivoIndex === -1) {
      throw new Error('No se encontró la columna consecutivo');
    }
    
    let rowSolicitud = null;
    let rowIndex = -1;
    for (let i = 1; i < rowsSolicitud.length; i++) {
      if (rowsSolicitud[i][consecutivoIndex] && 
          rowsSolicitud[i][consecutivoIndex].toLowerCase() === consecutivo.toLowerCase()) {
        rowSolicitud = rowsSolicitud[i];
        rowIndex = i;
        break;
      }
    }
    
    if (!rowSolicitud) {
      throw new Error(`No se encontró el consecutivo ${consecutivo}`);
    }
    
    // Obtener empresa y fecha de la solicitud
    const empresa = empresaIndex !== -1 ? rowSolicitud[empresaIndex] : '';
    const fechaSolicitud = fechaIndex !== -1 ? rowSolicitud[fechaIndex] : '';
    
    // Verificar si ya existe un piloto asignado (nombre_completo) cuando no se recibe piloto
    const nombreCompletoPiloto = nombreCompletoIndex !== -1 ? rowSolicitud[nombreCompletoIndex] || '' : '';
    const usuarioAsignado = usuarioIndex !== -1 ? rowSolicitud[usuarioIndex] || '' : '';
    
    // Si no se recibió piloto y existe un usuario asignado, usamos el nombre_completo
    let pilotoValor;
    let usarNombreCompleto = false;
    
    if (!piloto && usuarioAsignado.trim() !== '') {
      pilotoValor = nombreCompletoPiloto.trim();
      usarNombreCompleto = true;
      // console.log(`Usando nombre_completo como piloto: ${pilotoValor}`);
    } else {
      // Extraer valor del piloto si es un objeto
      pilotoValor = typeof piloto === 'object' && piloto !== null
        ? piloto.valor || piloto.label || JSON.stringify(piloto)
        : (piloto || '');  // Si piloto es null/undefined, usar cadena vacía
    }
    
    // Calcular fecha un día antes (si existe fecha en el registro)
    let fechaAnterior = '';
    if (fechaSolicitud) {
      try {
        const fecha = new Date(fechaSolicitud);
        fecha.setDate(fecha.getDate() - 1);
        fechaAnterior = fecha.toLocaleDateString('es-ES');
      } catch (e) {
        console.error('Error al calcular fecha anterior:', e);
      }
    }
    
    // Obtener el último código consecutivo de la hoja 2.ValidacionPrevuelo
    const validacionResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: '2.ValidacionPrevuelo',
    });
    
    const rowsValidacion = validacionResponse.data.values || [];
    
    // Generar nuevo código consecutivo (AV-X)
    let ultimoNumero = 0;
    if (rowsValidacion.length > 1) {  // Si hay al menos un registro (además de la cabecera)
      const codigoColumna = 0; // Asumimos que el código está en la primera columna
      
      // Buscar todos los códigos y obtener el número más alto
      for (let i = 1; i < rowsValidacion.length; i++) {
        if (rowsValidacion[i] && rowsValidacion[i][codigoColumna]) {
          const codigo = rowsValidacion[i][codigoColumna];
          const match = codigo.match(/AV-(\d+)/);
          if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (num > ultimoNumero) {
              ultimoNumero = num;
            }
          }
        }
      }
    }
    
    const nuevoCodigo = `AV-${ultimoNumero + 1}`;
    const fechaActual = new Date().toLocaleDateString('es-ES');
    
    // Extraer valores simples de los objetos si son objetos
    const numeroSerieValor = typeof numeroserie === 'object' && numeroserie !== null 
      ? numeroserie.valor || numeroserie.label || JSON.stringify(numeroserie) 
      : numeroserie;
    
    let emailPiloto = '';
    let nombrePiloto = '';
    
    // Solo buscar en la hoja de pilotos si no estamos usando el nombre_completo
    if (!usarNombreCompleto && pilotoValor) {
      // Obtener datos de la hoja de pilotos
      const pilotosResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: '3.Pilotos',
      });
      
      const pilotosRows = pilotosResponse.data.values || [];
      if (pilotosRows.length <= 1) {
        console.warn('No hay datos de pilotos disponibles');
      } else {
        // Encontrar los índices de las columnas que necesitamos
        const identidadIndex = 5; // Columna F (índice 5 - basado en 0)
        const nombresIndex = 1;   // Columna B (índice 1)
        const apellidosIndex = 2; // Columna C (índice 2)
        const emailIndex = 20;    // Columna U (índice 20)
        
        // Buscar el piloto por identificación
        let pilotoEncontrado = null;
        
        for (let i = 1; i < pilotosRows.length; i++) {
          const row = pilotosRows[i];
          if (row[identidadIndex] && 
              row[identidadIndex].toString().toLowerCase() === pilotoValor.toString().toLowerCase()) {
            pilotoEncontrado = row;
            break;
          }
        }
        
        if (pilotoEncontrado) {
          // Obtener el email del piloto (columna U)
          emailPiloto = pilotoEncontrado[emailIndex] || '';
          
          // Combinar nombres y apellidos (columnas B y C)
          const nombres = pilotoEncontrado[nombresIndex] || '';
          const apellidos = pilotoEncontrado[apellidosIndex] || '';
          nombrePiloto = `${nombres} ${apellidos}`.trim();
          
          // ACTUALIZAR la solicitud en la hoja SolicitudVuelo
          if (rowIndex !== -1) {
            // Actualizar email en la columna 2 (B)
            await sheets.spreadsheets.values.update({
              spreadsheetId,
              range: `SolicitudVuelo!B${rowIndex + 1}`,
              valueInputOption: 'RAW',
              resource: {
                values: [[emailPiloto]]
              }
            });
            
            // Actualizar nombre en la columna 3 (C)
            await sheets.spreadsheets.values.update({
              spreadsheetId,
              range: `SolicitudVuelo!C${rowIndex + 1}`,
              valueInputOption: 'RAW',
              resource: {
                values: [[nombrePiloto]]
              }
            });
          }
        } else {
          console.warn(`No se encontró un piloto con la identificación: ${pilotoValor}`);
        }
      }
    }
    
    // Actualizar estado del dron
    const dronesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: '3.Drones',
    });
    
    const droneRows = dronesResponse.data.values || [];
    if (droneRows.length > 1) {
      // Buscar el dron por número de serie en la columna 2 (B - índice 1)
      const numeroSerieIndex = 1; // Columna B (índice 1)
      const disponibilidadCol = 'V'; // Columna V para disponibilidad
      
      let droneRowIndex = -1;
      for (let i = 1; i < droneRows.length; i++) {
        if (droneRows[i][numeroSerieIndex] && 
            droneRows[i][numeroSerieIndex].toString().toLowerCase() === numeroSerieValor.toString().toLowerCase()) {
          droneRowIndex = i;
          break;
        }
      }
      
      // Si encontramos el dron, actualizamos la columna V a "si"
      if (droneRowIndex !== -1) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `3.Drones!${disponibilidadCol}${droneRowIndex + 1}`,
          valueInputOption: 'RAW',
          resource: {
            values: [["si"]]
          }
        });
      } else {
        console.warn(`No se encontró un dron con el número de serie: ${numeroSerieValor}`);
      }
    } else {
      console.warn('No hay datos de drones disponibles');
    }
    
    const nuevoRegistro = [
      nuevoCodigo,              // Código consecutivo
      consecutivo,              // ID del registro de SolicitudVuelo
      "Aprobado",               // Estado
      numeroSerieValor,         // Valor extraído del objeto número serie del dron
      pilotoValor,              // Valor del piloto (puede ser el ID o el nombre_completo)
      empresa,                  // Empresa
      fechaActual,              // Fecha actual
      notas,                    // Notas
      fechaAnterior             // Fecha un día antes
    ];
    
    // Anexar el nuevo registro a la hoja 2.ValidacionPrevuelo
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: '2.ValidacionPrevuelo',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [nuevoRegistro]
      }
    });
    
    const emailUsuarioSolicitante = 'apinto@sevicol.com.co';
    const emailUsuarioquerecibe = emailPiloto;
    
await firebaseHelper.enviarNotificacion(
  emailUsuarioSolicitante,
  'Solicitud de vuelo aprobada',
  `La solicitud #${consecutivo} ha sido aprobada`,
  { 
    tipo: "aprobacion_solicitud", 
    consecutivo: consecutivo 
  }
);

if (emailUsuarioquerecibe) {
  await firebaseHelper.enviarNotificacion(
    emailUsuarioquerecibe,
    'Tienes una nueva asignación de vuelo',
    `Has sido asignado al vuelo #${consecutivo}`,
    { 
      tipo: "asignacion_piloto", 
      consecutivo: consecutivo 
    }
  );
}

    return {
      codigo: nuevoCodigo,
      fechaValidacion: fechaActual,
    };
  } catch (error) {
    console.error('Error al generar validación de prevuelo:', error);
    throw error;
  }
};

const generarCancelacionPrevuelo = async (consecutivo, notas = '') => {
  try {
    const sheets = await getSheetsClient();
    
    const solicitudes = await getSolicitudesVuelo();
    
    if (!solicitudes || solicitudes.length === 0) {
      throw new Error('No se encontraron solicitudes');
    }
    
    const solicitud = solicitudes.find(s => 
      s.consecutivo && s.consecutivo.toLowerCase() === consecutivo.toLowerCase()
    );
    
    if (!solicitud) {
      throw new Error(`No se encontró el consecutivo ${consecutivo}`);
    }
    
    const tipoOperacion = solicitud.tipodeoperacionaerea || '';
    const empresa = solicitud.empresa || '';
    const fecha = solicitud.fecha_inicio || '';
    const useremail = solicitud.usuario || '';
    const username = solicitud.nombre_completo || '';
    
    const validacionResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: '2.ValidacionPrevuelo',
    });
    
    const rowsValidacion = validacionResponse.data.values || [];
    
    let ultimoNumero = 0;
    if (rowsValidacion.length > 1) {
      const codigoColumna = 0; 
      
      for (let i = 1; i < rowsValidacion.length; i++) {
        if (rowsValidacion[i] && rowsValidacion[i][codigoColumna]) {
          const codigo = rowsValidacion[i][codigoColumna];
          const match = codigo.match(/AV-(\d+)/);
          if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (num > ultimoNumero) {
              ultimoNumero = num;
            }
          }
        }
      }
    }
    
    const nuevoCodigo = `AV-${ultimoNumero + 1}`;
    const fechaActual = new Date().toLocaleDateString('es-ES');
    
    const nuevoRegistro = [
      nuevoCodigo,              
      consecutivo,              
      "Cancelado",                            
      "Cancelado",                            
      username,
      empresa,
      fechaActual,              
      notas,                              
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: '2.ValidacionPrevuelo',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [nuevoRegistro]
      }
    });
    
    const prevuelosResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Prevuelo!A:AK',
    });
    
    const prevuelosRows = prevuelosResponse.data.values || [];
    const prevuelosHeaders = prevuelosRows[0].map(h => h.trim().toLowerCase());
    
    const solicitudesAprobadasIndex = prevuelosHeaders.findIndex(h => 
      h === 'solicitudesaprobadas');
    const estadoPrevueloIndex = prevuelosHeaders.findIndex(h => 
      h === 'estado del prevuelo');
    
    if (solicitudesAprobadasIndex === -1) {
      throw new Error('No se encontró la columna solicitudesaprobadas en la hoja Prevuelo');
    }
    
    if (estadoPrevueloIndex === -1) {
      throw new Error('No se encontró la columna estado del prevuelo en la hoja Prevuelo');
    }
    
    let prevueloExiste = false;
    let prevueloRowIndex = -1;
    
    for (let i = 1; i < prevuelosRows.length; i++) {
      if (prevuelosRows[i][solicitudesAprobadasIndex] && 
          prevuelosRows[i][solicitudesAprobadasIndex].toLowerCase() === consecutivo.toLowerCase()) {
        prevueloExiste = true;
        prevueloRowIndex = i;
        break;
      }
    }
    
    if (prevueloExiste) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Prevuelo!${getColumnLetter(estadoPrevueloIndex + 1)}${prevueloRowIndex + 1}`,
        valueInputOption: 'RAW',
        resource: {
          values: [['Cancelado']]
        }
      });
    } else {
      const consecutivoPrevuelo = await prevueloHelper.getSiguienteConsecutivoPrevuelo();
      
      const nuevaFilaPrevuelo = [
        consecutivoPrevuelo,
        useremail,
        consecutivo, 
        username,
        nuevoCodigo,
        fecha,
        '',
        '',
        tipoOperacion,
        empresa,
        '', 
        '', 
        '',
        '', 
        '', 
        '', 
        '', 
        '', 
        '', 
        '', 
        '', 
        '', 
        '', 
        '', 
        '', 
        '', 
        '', 
        '', 
        '', 
        '', 
        '', 
        '', 
        '', 
        '', 
        notas, 
        'Cancelado', 
        fechaActual 
      ];
      
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Prevuelo!A1',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { 
          values: [nuevaFilaPrevuelo]
        },
      });
    }
    
    const postvuelosResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Postvuelo!A:S',
    });
    
    const postvuelosRows = postvuelosResponse.data.values || [];
    const postvuelosHeaders = postvuelosRows[0].map(h => h.trim().toLowerCase());
    
    const consecutivoSolicitudIndex = postvuelosHeaders.findIndex(h => 
      h === 'consecutivo-solicitud');
    const estadoPostvueloIndex = postvuelosHeaders.findIndex(h => 
      h === 'estado del postvuelo');
    
    if (consecutivoSolicitudIndex === -1) {
      throw new Error('No se encontró la columna consecutivo-solicitud en la hoja Postvuelo');
    }
    
    if (estadoPostvueloIndex === -1) {
      throw new Error('No se encontró la columna estado del postvuelo en la hoja Postvuelo');
    }
    
    let postvueloExiste = false;
    let postvueloRowIndex = -1;
    
    for (let i = 1; i < postvuelosRows.length; i++) {
      if (postvuelosRows[i][consecutivoSolicitudIndex] && 
          postvuelosRows[i][consecutivoSolicitudIndex].toLowerCase() === consecutivo.toLowerCase()) {
        postvueloExiste = true;
        postvueloRowIndex = i;
        break;
      }
    }
    
    if (postvueloExiste) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Postvuelo!${getColumnLetter(estadoPostvueloIndex + 1)}${postvueloRowIndex + 1}`,
        valueInputOption: 'RAW',
        resource: {
          values: [['Cancelado']]
        }
      });
    } else {
      const idPostvuelo = await postvueloHelper.getSiguienteConsecutivo();
      
      const nuevaFilaPostvuelo = [
        idPostvuelo,
        consecutivo, 
        username,
        'Cancelado', 
        fecha,
        'Cancelado',
        'Cancelado',
        'Cancelado', 
        'Cancelado',
        'Cancelado',
        'Cancelado',
        'Cancelado',
        'Cancelado',
        fechaActual, 
        'Cancelado',
        useremail,
        'Cancelado',
        tipoOperacion,
        empresa,
      ];
      
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Postvuelo!A1',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { 
          values: [nuevaFilaPostvuelo]
        },
      });
    }
    
    return {
      codigo: nuevoCodigo,
      fechaValidacion: fechaActual
    };
  } catch (error) {
    console.error('Error al generar cancelación de prevuelo/postvuelo:', error);
    throw error;
  }
};

export const solicitudHelper = {
  getSolicitudesVuelo,
  guardarSolicitud,

  getSolicitudesByStatus,
  getSolicitudesByCliente,
  getEssolicitudPendiente,
  getSolicitudesByEmail,
  getSolicitudesByLastEmail,
  getSolicitudesByEmailAndStatus,
  getSolicitudesByConsecutivo,
  getSolicitudesEnProceso,
  getSolicitudesEnProcesoPorEmail,
  getAllSolicitudesConEtapas,
  getAllSolicitudesConEtapasEmail,
  determinarEstadoProceso,
  getSolicitudConEtapas,
  getSiguienteConsecutivo,

  obtenerTodasLasHojas,
  getSolicitudesConEstadosGenerales,
  getResumenSolicitudesPorEmail,
  getResumenSolicitudesGeneral,
  getResumenSolicitudesPorSolicitante,
  getSolicitudPorConsecutivo,
  getSolicitudesPorEstadoGeneral,
  getEstadosDisponibles,

  editarSolicitudPorConsecutivo,
  procesarArchivos,
  putSolicitudByStatus,
  subirArchivosACarpetaExistente,
  buscarCarpetaPorNombre,
  generarValidacionPrevuelo,
  generarCancelacionPrevuelo
};