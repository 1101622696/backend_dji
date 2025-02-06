// import axios from "axios";
// import Telemetria from "../models/telemetria.js";

// // const BASE_URL = "https://api.dji.com";
// // const BASE_URL = "https://developer.api.dji.com";
// // const BASE_URL = "https://api-cloud.dji.com";
// // const BASE_URL = "https://cloud-api.dji.com";
// // const BASE_URL = "https://cloud.dji.com/api";
// // con esta arrojó algo diferente:
// //  const BASE_URL = "https://developer.dji.com/api/cloud";
//  const BASE_URL = "https://api.dji.com/cloud-api";
// // const BASE_URL = "https://api.dji.cloud/api/v1";
// // const BASE_URL = "https://dev.dji.com/api/v1";
// // const BASE_URL = "https://api.dji.com/cloud/api/v1";
// // const BASE_URL = "https://api.dji.com/iot-gateway/api/v1";
// // const BASE_URL = "https://api.dji.com/iot/api/v1";



// const httptelemetria = {
// //     // getelemetria: async (req, res) => {
// //     //     try {
// //     //         // Simulate response for testing
// //     //         res.json({
// //     //             success: true,
// //     //             message: 'Simulated DJI API response',
// //     //             data: {
// //     //                 devices: [
// //     //                     {
// //     //                         sn: 'DEMO_DRONE_001',
// //     //                         latitude: 0,
// //     //                         longitude: 0,
// //     //                         altitude: 0,
// //     //                         speed: 0,
// //     //                         battery: 100
// //     //                     }
// //     //                 ]
// //     //             }
// //     //         });
// //     //     } catch (error) {
// //     //         res.status(500).json({ 
// //     //             error: "Error al obtener datos del dron",
// //     //             details: error.message
// //     //         });
// //     //     }
// //     // },
// getelemetria: async (req, res) => {
//     try {
//         console.log('1. Verificando conectividad con DJI API...');
        
//         // Authenticate with DJI Cloud API
//         const tokenUrl = `${BASE_URL}/auth/v1/tokens`;
//         const tokenResponse = await axios.post(tokenUrl, {
//             grant_type: 'client_credentials',
//             client_id: process.env.APP_KEY,
//             client_secret: process.env.APP_SECRET
//         }, {
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });

//         if (!tokenResponse.data || !tokenResponse.data.access_token) {
//             throw new Error('Token de acceso no recibido en la respuesta');
//         }

//         const token = tokenResponse.data.access_token;
//         console.log('3. Token obtenido correctamente');

//         // Get telemetry data - using the correct endpoint
//         const telemetryUrl = `${BASE_URL}/device/v1/telemetry`;
//         console.log(`4. Obteniendo telemetría desde: ${telemetryUrl}`);

//         const telemetryResponse = await axios.get(telemetryUrl, {
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             },
//             params: {
//                 workspace_id: process.env.WORKSPACE_ID // Add this if you have a workspace ID
//             }
//         });

//         if (!telemetryResponse.data) {
//             throw new Error('No se recibieron datos de telemetría');
//         }

//         console.log('5. Datos de telemetría recibidos:', 
//             JSON.stringify(telemetryResponse.data, null, 2));

//         // Process the response
//         const devices = Array.isArray(telemetryResponse.data.data) 
//             ? telemetryResponse.data.data 
//             : [];

//         if (devices.length === 0) {
//             return res.json({
//                 success: true,
//                 message: 'No se encontraron dispositivos activos',
//                 count: 0,
//                 data: []
//             });
//         }

//         const telemetriaArray = [];
//         for (const device of devices) {
//             const nuevaTelemetria = new Telemetria({
//                 droneId: device.sn || 'unknown',
//                 timestamp: Date.now(),
//                 latitud: device.latitude,
//                 longitud: device.longitude,
//                 altitud: device.altitude,
//                 velocidad: device.speed,
//                 nivelbateria: device.battery,
//                 posicion_vuelo: device.flightStatus
//             });

//             await nuevaTelemetria.save();
//             telemetriaArray.push(nuevaTelemetria);
//         }

//         console.log('6. Datos guardados en MongoDB');
        
//         res.json({
//             success: true,
//             count: telemetriaArray.length,
//             data: telemetriaArray
//         });

//     } catch (error) {
//         console.error('Error detallado:', {
//             message: error.message,
//             code: error.code,
//             errno: error.errno,
//             response: error.response ? {
//                 status: error.response.status,
//                 data: error.response.data
//             } : 'No response data'
//         });

//         res.status(error.response?.status || 500).json({ 
//             error: "Error al obtener datos del dron",
//             details: error.message,
//             code: error.code,
//             errorResponse: error.response ? error.response.data : null
//         });
//     }
// },

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
import dns from 'dns';
import { promisify } from 'util';

// Usar la URL oficial del Cloud API de DJI
const BASE_URL = "https://api.dji.cloud";

const dnsResolve = promisify(dns.resolve);

const httptelemetria = {
    getelemetria: async (req, res) => {
        try {
            console.log('1. Verificando conectividad con DJI API...');
            
            // Verificar resolución DNS antes de hacer la petición
            try {
                const domain = new URL(BASE_URL).hostname;
                console.log(`Verificando DNS para ${domain}...`);
                await dnsResolve(domain);
                console.log('Resolución DNS exitosa');
            } catch (dnsError) {
                console.error('Error de resolución DNS:', dnsError);
                throw new Error(`Error de conectividad: No se puede resolver ${BASE_URL}. Verifique su conexión a internet y que el dominio sea correcto.`);
            }

            // Autenticación con DJI Cloud API
            const tokenUrl = `${BASE_URL}/api/v1/auth/tokens`;
            console.log(`2. Intentando autenticación en: ${tokenUrl}`);
            
            const tokenResponse = await axios.post(tokenUrl, {
                grant_type: 'client_credentials',
                client_id: process.env.APP_KEY,
                client_secret: process.env.APP_SECRET
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000 // Aumentar el timeout a 10 segundos
            });

            if (!tokenResponse.data || !tokenResponse.data.access_token) {
                throw new Error('Token de acceso no recibido en la respuesta');
            }

            const token = tokenResponse.data.access_token;
            console.log('3. Token obtenido correctamente');

            // Obtener datos de telemetría
            const telemetryUrl = `${BASE_URL}/api/v1/devices/telemetry`;
            console.log(`4. Obteniendo telemetría desde: ${telemetryUrl}`);

            const telemetryResponse = await axios.get(telemetryUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000
            });

            if (!telemetryResponse.data) {
                throw new Error('No se recibieron datos de telemetría');
            }

            console.log('5. Datos de telemetría recibidos:', 
                JSON.stringify(telemetryResponse.data, null, 2));

            // Procesar la respuesta
            const devices = Array.isArray(telemetryResponse.data.data) 
                ? telemetryResponse.data.data 
                : [];

            if (devices.length === 0) {
                return res.json({
                    success: true,
                    message: 'No se encontraron dispositivos activos',
                    count: 0,
                    data: []
                });
            }

            const telemetriaArray = [];
            for (const device of devices) {
                const nuevaTelemetria = new Telemetria({
                    droneId: device.sn || 'unknown',
                    timestamp: Date.now(),
                    latitud: device.latitude,
                    longitud: device.longitude,
                    altitud: device.altitude,
                    velocidad: device.speed,
                    nivelbateria: device.battery,
                    posicion_vuelo: device.flightStatus
                });

                await nuevaTelemetria.save();
                telemetriaArray.push(nuevaTelemetria);
            }

            console.log('6. Datos guardados en MongoDB');
            
            res.json({
                success: true,
                count: telemetriaArray.length,
                data: telemetriaArray
            });

        } catch (error) {
            console.error('Error detallado:', {
                message: error.message,
                code: error.code,
                errno: error.errno,
                response: error.response ? {
                    status: error.response.status,
                    data: error.response.data
                } : 'No response data',
                stack: error.stack
            });

            // Mejorar el mensaje de error para el cliente
            const errorMessage = error.code === 'ENOTFOUND' 
                ? 'No se puede conectar con el servidor de DJI. Verifique su conexión a internet y la URL del servicio.'
                : error.message;

            res.status(error.response?.status || 500).json({ 
                error: "Error al obtener datos del dron",
                details: errorMessage,
                code: error.code,
                errorResponse: error.response ? error.response.data : null
            });
        }
    }
};

export default httptelemetria;