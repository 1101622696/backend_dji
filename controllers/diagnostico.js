// // controllers/diagnostico.js
// import axios from "axios";

// const diagnostico = {
//     testConexion: async (req, res) => {
//         const resultados = {
//             tests: []
//         };

//         try {
//             // Test 1: Verificar conexión a internet
//             try {
//                 await axios.get('https://google.com');
//                 resultados.tests.push({
//                     nombre: 'Conexión a Internet',
//                     estado: 'OK',
//                     mensaje: 'La conexión a internet funciona correctamente'
//                 });
//             } catch (error) {
//                 resultados.tests.push({
//                     nombre: 'Conexión a Internet',
//                     estado: 'ERROR',
//                     mensaje: 'No hay conexión a internet'
//                 });
//             }

//             // Test 2: Intento de conexión a DJI API
//             try {
//                 await axios.get('https://api.dji.com', { 
//                     timeout: 5000,
//                     validateStatus: false
//                 });
//                 resultados.tests.push({
//                     nombre: 'Conexión a DJI API',
//                     estado: 'OK',
//                     mensaje: 'Se puede alcanzar el servidor de DJI'
//                 });
//             } catch (error) {
//                 resultados.tests.push({
//                     nombre: 'Conexión a DJI API',
//                     estado: 'ERROR',
//                     mensaje: `Error al conectar con DJI: ${error.message}`
//                 });
//             }

//             // Test 3: Verificar credenciales
//             try {
//                 const tokenResponse = await axios.post('https://api.dji.com/oauth/api/v1/token', {
//                     client_id: process.env.APP_KEY,
//                     client_secret: process.env.APP_SECRET,
//                     grant_type: 'client_credentials'
//                 }, {
//                     timeout: 5000,
//                     validateStatus: false
//                 });
                
//                 resultados.tests.push({
//                     nombre: 'Autenticación DJI',
//                     estado: tokenResponse.status === 200 ? 'OK' : 'ERROR',
//                     mensaje: `Respuesta del servidor: ${tokenResponse.status} ${tokenResponse.statusText}`,
//                     datos: tokenResponse.data
//                 });
//             } catch (error) {
//                 resultados.tests.push({
//                     nombre: 'Autenticación DJI',
//                     estado: 'ERROR',
//                     mensaje: `Error en autenticación: ${error.message}`
//                 });
//             }

//             res.json(resultados);
//         } catch (error) {
//             res.status(500).json({
//                 error: 'Error en diagnóstico',
//                 mensaje: error.message
//             });
//         }
//     }
// };

// export default diagnostico;


import axios from "axios";

const diagnostico = {
    testConexion: async (req, res) => {
        try {
            // Test simple inicial
            res.json({
                mensaje: "Ruta de diagnóstico funcionando",
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                error: 'Error en diagnóstico',
                mensaje: error.message
            });
        }
    }
};

export default diagnostico;