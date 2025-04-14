import Usuario from '../models/usuarios.js'; // Asegúrate que exista el modelo
import { generarJWT } from './generar-jwt.js'; // Ajusta el path si lo moviste

import { google } from 'googleapis';

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

  const headers = rows[0];
  const data = rows.slice(1).map((fila) => {
    const userData = Object.fromEntries(fila.map((valor, i) => [headers[i], valor]));
    // Normaliza las propiedades para usar un formato consistente
    return {
      id: userData.ID || userData.id || '',
      email: userData.EMAIL || userData.Email || '',
      nombre: userData.NOMBRE || userData.Nombre || '',
      password: userData.PASSWORD || userData.Password || '',
      perfil: userData.PERFIL || userData.Perfil || '',
      estado: (userData.ESTADO || userData.Estado || '').toLowerCase()
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
        rol: usuario.perfil,
      }
    };
  };

export const usuarioHelper = {
  getUsuarios,
  loginUsuario
};
