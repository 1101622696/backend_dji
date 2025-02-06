import axios from "axios";
import Telemetria from "../models/telemetria.js";

const httptelemetria = {
    getelemetria: async (req, res) => {
        try {
            console.log('1. Iniciando obtención de token...');
            
            // Correct DJI API endpoints
            const tokenResponse = await axios.post("https://api.dji.com/oauth/api/v1/token", {
                client_id: process.env.APP_KEY,
                client_secret: process.env.APP_SECRET,
                grant_type: 'client_credentials'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('2. Respuesta del token:', {
                status: tokenResponse.status,
                statusText: tokenResponse.statusText
            });

            const token = tokenResponse.data.access_token;
            console.log('3. Token obtenido:', token);

            // Correct telemetry endpoint and parameters
            const telemetryResponse = await axios.get("https://api.dji.com/api/v1/telemetry/devices", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    // Add any required query parameters here
                    workspace_id: process.env.CNX_MONGO
                }
            });

            console.log('4. Respuesta de telemetría recibida:', telemetryResponse.data);

            // Assuming the response contains an array of devices
            const devices = telemetryResponse.data.data || [];
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

            console.log('5. Datos guardados en MongoDB');
            
            res.json({
                success: true,
                count: telemetriaArray.length,
                data: telemetriaArray
            });

        } catch (error) {
            console.error('Error detallado:', {
                message: error.message,
                response: error.response ? {
                    status: error.response.status,
                    data: error.response.data
                } : 'No response data',
                config: error.config ? {
                    url: error.config.url,
                    method: error.config.method,
                    headers: error.config.headers
                } : 'No config data'
            });

            res.status(error.response?.status || 500).json({ 
                error: "Error al obtener datos del dron",
                details: error.message,
                errorResponse: error.response ? error.response.data : null
            });
        }
    },

    receiveTelemetry: async (req, res) => {
        try {
            console.log('Datos recibidos del webhook:', req.body);
            
            const telemetriaData = req.body;
            
            // Validate incoming webhook data
            if (!telemetriaData || !telemetriaData.sn) {
                throw new Error('Datos de telemetría inválidos o incompletos');
            }

            const nuevaTelemetria = new Telemetria({
                droneId: telemetriaData.sn,
                timestamp: Date.now(),
                latitud: telemetriaData.latitude,
                longitud: telemetriaData.longitude,
                altitud: telemetriaData.altitude,
                velocidad: telemetriaData.speed,
                nivelbateria: telemetriaData.battery,
                posicion_vuelo: telemetriaData.flightStatus
            });

            await nuevaTelemetria.save();
            res.status(200).json({ 
                success: true, 
                message: 'Datos recibidos y guardados correctamente',
                data: nuevaTelemetria
            });
        } catch (error) {
            console.error("Error al procesar telemetría:", error);
            res.status(400).json({ 
                error: "Error procesando datos de telemetría",
                details: error.message
            });
        }
    }
};

export default httptelemetria;