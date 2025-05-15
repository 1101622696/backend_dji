import Usuario from '../models/usuarios.js'; // Asegúrate que exista el modelo
import { generarJWT } from './generar-jwt.js'; // Ajusta el path si lo moviste

import { google } from 'googleapis';

const spreadsheetId = '1fTu_oEvbL5RG0TSL5rIs2YKFtX8BXTymVkXVhBM0_ts';

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
// Client Sheets
const getSheetsClient = async () => {
  const auth = getAuth();
  // No need to get the client separately
  return google.sheets({ version: 'v4', auth });
};

const leerUsuariosDesdeSheets = async () => {
  const sheets = await getSheetsClient();
  
  const spreadsheetId = '1fTu_oEvbL5RG0TSL5rIs2YKFtX8BXTymVkXVhBM0_ts'; 
  const range = 'Usuarios!A1:G1200'; 

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = res.data.values;
  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map(h => h.trim().toLowerCase());
  const data = rows.slice(1).map((fila) => {
    const userData = Object.fromEntries(fila.map((valor, i) => [headers[i], valor]));
    return {
      id: userData.id || '',
      email: userData.email || '',
      nombre: userData.nombre || '',
      password: userData.password || '',
      perfil: userData.perfil || '',
      estado: (userData.estado || '').toLowerCase()
    };
  });  

  return data;
};

const getUsuarios = () => leerUsuariosDesdeSheets();

const loginUsuario = async ({ email, password }) => {
    const usuarios = await leerUsuariosDesdeSheets();
    
    const usuario = usuarios.find(u => u.email === email);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    
    if (usuario.estado === 'inactivo') {
      throw new Error('Usuario o contraseña incorrecta');
    }
    
    if (usuario.password !== password) {
      throw new Error('Usuario o contraseña incorrecta');
    }
    
    const token = await generarJWT(
      usuario.id || usuario.email, 
      usuario.perfil,
      usuario.email,
      usuario.nombre
    );
      
    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        perfil: usuario.perfil,
      }
    };
  };

  const getUsuarioByStatus = async (status) => {
    const usuarios = await getUsuarios();
    return usuarios.filter(usuario => 
      usuario.estado && usuario.estado.toLowerCase() === status.toLowerCase()
    );
  };

  const getUsuarioByEmail = async (email) => {
    const usuarios = await getUsuarios();
    return usuarios.find(usuario => 
      usuario.email && usuario.email.toLowerCase() === email.toLowerCase()
    );
  };
  
  
  const getUsuarioByPerfil = async (perfile) => {
    const usuarios = await getUsuarios();
    return usuarios.filter(usuario => 
      usuario.perfil && usuario.perfil.toLowerCase() === perfile.toLowerCase()
    );
  };

  const filtrarUsuarioPorCampoTexto = (usuarios, campo, valor) => {
  return usuarios.filter(dron => 
    dron[campo] && dron[campo].toLowerCase() === valor.toLowerCase()
  );
};

const getUsuarioPorPerfil = async (valor) => {
  const usuarios = await getUsuarios();
  return filtrarUsuarioPorCampoTexto(usuarios, "perfil", valor);
};

const getUsuarioPorEstado = async (valor) => {
  const usuarios = await getUsuarios();
  return filtrarUsuarioPorCampoTexto(usuarios, "estado", valor);
};

  const guardarUsuario = async ({ nombre, email, password, perfil, codigopassword, fechacodigo, estado }) => {
    const sheets = await getSheetsClient();
    const nuevaFila = [nombre, email, password, perfil, codigopassword, fechacodigo, estado];
  
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Usuarios!A1:G1200',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [nuevaFila] },
    });
  
    return { nombre };
  };

  const editarUsuario= async (email, nuevosDatos) => {
    const sheets = await getSheetsClient();
  
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A2:N', 
    });
  
    const filas = response.data.values;
    const filaIndex = filas.findIndex(fila => fila[1]?.toLowerCase() === email.toLowerCase());
  
    if (filaIndex === -1) {
      return null; 
    }
  
    // teer los datos actuales
    const filaActual = filas[filaIndex];
    
    const filaEditada = [
      nuevosDatos.nombre || filaActual[0],
      nuevosDatos.email || filaActual[1],
      filaActual[2], 
      nuevosDatos.perfil || filaActual[3],
      filaActual[4], 
      filaActual[5], 
      filaActual[6], 
    ];
  
    const filaEnHoja = filaIndex + 2; 
  
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Usuarios!A${filaEnHoja}:G${filaEnHoja}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [filaEditada],
      },
    });
  
    return true;
  };

  const editarPasswordUsuario= async (email, password) => {
    const sheets = await getSheetsClient();
  
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A2:N', 
    });
  
    const filas = response.data.values;
    const filaIndex = filas.findIndex(fila => fila[1]?.toLowerCase() === email.toLowerCase());
  
    if (filaIndex === -1) {
      return null; 
    }
  
    // teer los datos actuales
    const filaActual = filas[filaIndex];
    
    const filaEditada = [
      filaActual[0], 
      filaActual[1], 
      password.password || filaActual[2],
      filaActual[3], 
      filaActual[4], 
      filaActual[5], 
      filaActual[6], 
    ];
  
    const filaEnHoja = filaIndex + 2; 
  
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Usuarios!A${filaEnHoja}:G${filaEnHoja}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [filaEditada],
      },
    });
  
    return true;
  };
  
  const actualizarEstadoEnSheets = async (email, nuevoEstado = "activo") => {
    try {
      const sheets = await getSheetsClient();
      
      // Primero, obtener todos los datos para encontrar la fila del email
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Usuarios',
      });
      
      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        throw new Error('No se encontraron datos en la hoja');
      }
      
      // Determinar qué columna contiene el email y el estado
      const headers = rows[0];
      const emailIndex = headers.findIndex(header => 
        header.toLowerCase() === 'email');
      const estadoIndex = headers.findIndex(header => 
        header.toLowerCase() === 'estado');
      
      if (emailIndex === -1 || estadoIndex === -1) {
        throw new Error('No se encontraron las columnas necesarias');
      }
      
      // Encontrar la fila que corresponde al email
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][emailIndex] && 
            rows[i][emailIndex].toLowerCase() === email.toLowerCase()) {
          rowIndex = i;
          break;
        }
      }
      
      if (rowIndex === -1) {
        throw new Error(`No se encontró el email ${email}`);
      }
      
      // Actualizar el estado en Google Sheets
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Usuarios!${getColumnLetter(estadoIndex + 1)}${rowIndex + 1}`,
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
  
  // Función auxiliar para convertir número de columna a letra
  function getColumnLetter(columnNumber) {
    let columnLetter = '';
    while (columnNumber > 0) {
      const remainder = (columnNumber - 1) % 26;
      columnLetter = String.fromCharCode(65 + remainder) + columnLetter;
      columnNumber = Math.floor((columnNumber - 1) / 26);
    }
    return columnLetter;
  }

export const usuarioHelper = {
  getUsuarios,
  loginUsuario,
  guardarUsuario,
  editarUsuario,
  editarPasswordUsuario,
  actualizarEstadoEnSheets,
  getUsuarioByStatus,
  getUsuarioByPerfil,
  getUsuarioByEmail,
  getUsuarioPorPerfil,
  getUsuarioPorEstado
};
