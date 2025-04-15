import Usuario from '../models/usuarios.js'; // Asegúrate que exista el modelo
import { generarJWT } from './generar-jwt.js'; // Ajusta el path si lo moviste

import { google } from 'googleapis';

// const spreadsheetId = '1fTu_oEvbL5RG0TSL5rIs2YKFtX8BXTymVkXVhBM0_ts';

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
  const range = 'Usuarios!A1:F1200'; 

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
    
    const token = await generarJWT(usuario.id || usuario.email, usuario.perfil);
  
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

export const usuarioHelper = {
  getUsuarios,
  loginUsuario
};
