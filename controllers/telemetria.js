// import axios from "axios";
// import Telemetria from "../models/telemetria.js";

// // const BASE_URL = "https://api.dji.com";
// // const BASE_URL = "https://developer.api.dji.com";
// // const BASE_URL = "https://api-cloud.dji.com";
// // const BASE_URL = "https://cloud-api.dji.com";
// // const BASE_URL = "https://cloud.dji.com/api";
// // con esta arrojó algo diferente:
//  const BASE_URL = "https://developer.dji.com/api/cloud";
// // const BASE_URL = "https://api.dji.cloud/api/v1";
// // const BASE_URL = "https://dev.dji.com/api/v1";
// // const BASE_URL = "https://api.dji.com/cloud/api/v1";
// // const BASE_URL = "https://api.dji.com/iot-gateway/api/v1";
// // const BASE_URL = "https://api.dji.com/iot/api/v1";



// const httptelemetria = {
//     // getelemetria: async (req, res) => {
//     //     try {
//     //         // Simulate response for testing
//     //         res.json({
//     //             success: true,
//     //             message: 'Simulated DJI API response',
//     //             data: {
//     //                 devices: [
//     //                     {
//     //                         sn: 'DEMO_DRONE_001',
//     //                         latitude: 0,
//     //                         longitude: 0,
//     //                         altitude: 0,
//     //                         speed: 0,
//     //                         battery: 100
//     //                     }
//     //                 ]
//     //             }
//     //         });
//     //     } catch (error) {
//     //         res.status(500).json({ 
//     //             error: "Error al obtener datos del dron",
//     //             details: error.message
//     //         });
//     //     }
//     // },
//     getelemetria: async (req, res) => {
//         try {
//             console.log('1. Verificando conectividad con DJI API...');
            
//             // First, try a DNS lookup to verify the endpoint is reachable
//             try {
//                 await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
//               } catch (error) {
//                 console.error('Detailed Connection Error:', {
//                   message: error.message,
//                   code: error.code,
//                   stack: error.stack
//                 });
//               }

//             console.log('2. Iniciando obtención de token...');
            
//             const tokenUrl = `${BASE_URL}/oauth/token`;
//             // const tokenResponse = await axios.get(tokenUrl, {
//             //     headers: {
//             //         'Authorization': `Basic ${Buffer.from(`${process.env.APP_KEY}:${process.env.APP_SECRET}`).toString('base64')}`,
//             //         'Content-Type': 'application/json',
//             //         'Accept': 'application/json'
//             //     },
//             //     timeout: 5000
//             // });
//             const tokenResponse = await axios.post(tokenUrl, {
//                 grant_type: 'client_credentials',
//                 client_id: process.env.APP_KEY,
//                 client_secret: process.env.APP_SECRET
//             });

//             if (!tokenResponse.data || !tokenResponse.data.access_token) {
//                 throw new Error('Token de acceso no recibido en la respuesta');
//             }

//             const token = tokenResponse.data.access_token;
//             console.log('3. Token obtenido correctamente');

//             // Get telemetry data
//             const telemetryUrl = `${BASE_URL}/api/v1/telemetry/devices`;
//             console.log(`4. Obteniendo telemetría desde: ${telemetryUrl}`);

//             const telemetryResponse = await axios.get(telemetryUrl, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                     'Accept': 'application/json'
//                 },
//                 // Remove workspace_id for now until you have the correct one
//                 timeout: 5000
//             });
//             // const telemetryResponse = await axios.get(`${BASE_URL}/telemetry`, {
//             //     headers: {
//             //         'Authorization': `Bearer ${token}`,
//             //         'Content-Type': 'application/json'
//             //     }
//             // });

//             if (!telemetryResponse.data) {
//                 throw new Error('No se recibieron datos de telemetría');
//             }

//             console.log('5. Datos de telemetría recibidos:', 
//                 JSON.stringify(telemetryResponse.data, null, 2));

//             // Process the response
//             const devices = Array.isArray(telemetryResponse.data.data) 
//                 ? telemetryResponse.data.data 
//                 : [];

//             if (devices.length === 0) {
//                 return res.json({
//                     success: true,
//                     message: 'No se encontraron dispositivos activos',
//                     count: 0,
//                     data: []
//                 });
//             }

//             const telemetriaArray = [];
//             for (const device of devices) {
//                 const nuevaTelemetria = new Telemetria({
//                     droneId: device.sn || 'unknown',
//                     timestamp: Date.now(),
//                     latitud: device.latitude,
//                     longitud: device.longitude,
//                     altitud: device.altitude,
//                     velocidad: device.speed,
//                     nivelbateria: device.battery,
//                     posicion_vuelo: device.flightStatus
//                 });

//                 await nuevaTelemetria.save();
//                 telemetriaArray.push(nuevaTelemetria);
//             }

//             console.log('6. Datos guardados en MongoDB');
            
//             res.json({
//                 success: true,
//                 count: telemetriaArray.length,
//                 data: telemetriaArray
//             });

//         } catch (error) {
//             console.error('Error detallado:', {
//                 message: error.message,
//                 code: error.code,
//                 errno: error.errno,
//                 response: error.response ? {
//                     status: error.response.status,
//                     data: error.response.data
//                 } : 'No response data',
//                 config: error.config ? {
//                     url: error.config.url,
//                     method: error.config.method,
//                     headers: error.config.headers
//                 } : 'No config data'
//             });

//             res.status(error.response?.status || 500).json({ 
//                 error: "Error al obtener datos del dron",
//                 details: error.message,
//                 code: error.code,
//                 errorResponse: error.response ? error.response.data : null
//             });
//         }
//     },

//     receiveTelemetry: async (req, res) => {
//         try {
//             console.log('Datos recibidos del webhook:', req.body);
            
//             const telemetriaData = req.body;
            
//             // Validate incoming webhook data
//             if (!telemetriaData || !telemetriaData.sn) {
//                 throw new Error('Datos de telemetría inválidos o incompletos');
//             }

//             const nuevaTelemetria = new Telemetria({
//                 droneId: telemetriaData.sn,
//                 timestamp: Date.now(),
//                 latitud: telemetriaData.latitude,
//                 longitud: telemetriaData.longitude,
//                 altitud: telemetriaData.altitude,
//                 velocidad: telemetriaData.speed,
//                 nivelbateria: telemetriaData.battery,
//                 posicion_vuelo: telemetriaData.flightStatus
//             });

//             await nuevaTelemetria.save();
//             res.status(200).json({ 
//                 success: true, 
//                 message: 'Datos recibidos y guardados correctamente',
//                 data: nuevaTelemetria
//             });
//         } catch (error) {
//             console.error("Error al procesar telemetría:", error);
//             res.status(400).json({ 
//                 error: "Error procesando datos de telemetría",
//                 details: error.message
//             });
//         }
//     },
//     testDJIConnection: async (req, res) => {
//         try {
//           console.log('Iniciando prueba de conexión con credenciales');
//           res.json({
//             success: true,
//             message: 'Credenciales recibidas',
//             appKey: process.env.APP_KEY ? 'Presente' : 'Ausente',
//             appSecret: process.env.APP_SECRET ? 'Presente' : 'Ausente'
//           });
//         } catch (error) {
//           res.status(500).json({
//             error: 'Error en prueba de conexión',
//             details: error.message
//           });
//         }
//       }
// };

// export default httptelemetria;



import axios from "axios";
import Telemetria from "../models/telemetria.js";
import djiAuth from "../services/djiAuth.js";

class TelemetriaController {
    constructor() {
        this.baseURL = 'https://api.dji.com/api/v1';
    }

    async getTelemetria(req, res) {
        try {
            // Obtener token de acceso
            const accessToken = await djiAuth.getAccessToken();

            // Obtener datos de telemetría
            const response = await axios.get(`${this.baseURL}/drone/telemetry`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            // Guardar en MongoDB si es necesario
            const telemetria = new Telemetria(response.data);
            await telemetria.save();

            res.json(response.data);
        } catch (error) {
            console.error('Error getting drone data:', error);
            res.status(error.response?.status || 500).json({ 
                error: 'Error obtaining drone data',
                details: error.message 
            });
        }
    }
}

export default new TelemetriaController();