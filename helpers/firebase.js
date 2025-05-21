import admin from 'firebase-admin';
import { google } from 'googleapis';
import {usuarioHelper} from '../helpers/usuarios.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const initializeFirebaseAdmin = () => {
  if (admin.apps.length === 0) {
    try {
      // Verificar si estamos en producción (Render)
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        console.log("Inicializando Firebase con variables de entorno");
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          })
        });
      } else {
        // Para desarrollo local, leer el archivo manualmente
        console.log("Inicializando Firebase con archivo de credenciales");
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const filePath = path.join(__dirname, '../config/firebase-credentials.json');
        
        const serviceAccountRaw = fs.readFileSync(filePath, 'utf8');
        const serviceAccount = JSON.parse(serviceAccountRaw);
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }
      console.log("Firebase inicializado correctamente");
    } catch (error) {
      console.error("Error al inicializar Firebase:", error);
      throw error;
    }
  }
  return admin;
};
// Guardar token FCM en Google Sheets
const guardarTokenFCM = async (email, token) => {
  try {
    // Inicializar cliente de Google Sheets
    const sheets = await usuarioHelper.getSheetsClient();
    const spreadsheetId = '1fTu_oEvbL5RG0TSL5rIs2YKFtX8BXTymVkXVhBM0_ts';
    
    // Verificar si existe una hoja para tokens FCM
    const sheetInfo = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    
    const sheetExists = sheetInfo.data.sheets.some(
      sheet => sheet.properties.title === 'TokensFCM'
    );
    
    // Si no existe la hoja, crearla
    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'TokensFCM',
                }
              }
            }
          ]
        }
      });
      
      // Añadir encabezados
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'TokensFCM!A1:C1',
        valueInputOption: 'RAW',
        resource: {
          values: [['email', 'token', 'fecha_actualizacion']]
        }
      });
    }
    
    // Leer tokens actuales
    const tokensResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'TokensFCM!A2:C1000',
    });
    
    const tokenRows = tokensResponse.data.values || [];
    const existingRowIndex = tokenRows.findIndex(row => row[0] === email);
    
    const fechaActual = new Date().toISOString();
    
    if (existingRowIndex !== -1) {
      // Actualizar token existente
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `TokensFCM!A${existingRowIndex + 2}:C${existingRowIndex + 2}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[email, token, fechaActual]]
        }
      });
    } else {
      // Añadir nuevo token
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'TokensFCM!A2:C2',
        valueInputOption: 'RAW',
        resource: {
          values: [[email, token, fechaActual]]
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error al guardar token FCM:', error);
    return false;
  }
};

// Obtener token FCM por email
const obtenerTokenFCM = async (email) => {
  try {
    const sheets = await usuarioHelper.getSheetsClient();
    const spreadsheetId = '1fTu_oEvbL5RG0TSL5rIs2YKFtX8BXTymVkXVhBM0_ts';
    
    // Leer tokens
    const tokensResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'TokensFCM!A2:C1000',
    });
    
    const tokenRows = tokensResponse.data.values || [];
    const userRow = tokenRows.find(row => row[0] === email);
    
    if (userRow) {
      return userRow[1]; // El token está en la segunda columna
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener token FCM:', error);
    return null;
  }
};

// Enviar notificación push
const enviarNotificacion = async (email, titulo, mensaje, datos = {}) => {
  try {
    const firebaseAdmin = initializeFirebaseAdmin();
    
    // Obtener token FCM del usuario
    const tokenFCM = await obtenerTokenFCM(email);
    
    if (!tokenFCM) {
      console.log(`No se encontró token FCM para el usuario: ${email}`);
      return false;
    }
    
    // Construir mensaje de notificación
    const mensaje_notificacion = {
      token: tokenFCM,
      notification: {
        title: titulo,
        body: mensaje
      },
      data: {
        ...datos,
        click_action: 'FLUTTER_NOTIFICATION_CLICK' // Acción estándar para abrir la app
      }
    };
    
    // Enviar mensaje
    const respuesta = await firebaseAdmin.messaging().send(mensaje_notificacion);
    console.log('Notificación enviada con éxito:', respuesta);
    return true;
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    return false;
  }
};

export {
  initializeFirebaseAdmin,
  guardarTokenFCM,
  obtenerTokenFCM,
  enviarNotificacion
};