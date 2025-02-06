import axios from "axios";
import Telemetria from "../models/telemetria.js";

const httptelemetria = {
    getelemetria: async (req, res) => {
        try {
            console.log('1. Iniciando obtención de token...');
            
            const tokenUrl = "https://api.dji.com/oauth/api/v1/token";
            console.log('URL del token:', tokenUrl);
            console.log('Credenciales:', {
                client_id: process.env.APP_KEY,
                client_secret: '***' // Ocultado por seguridad
            });

            const tokenResponse = await axios.post(tokenUrl, {
                client_id: process.env.APP_KEY,
                client_secret: process.env.APP_SECRET,
                grant_type: 'client_credentials'
            });

            console.log('2. Respuesta del token:', {
                status: tokenResponse.status,
                statusText: tokenResponse.statusText,
                data: tokenResponse.data
            });

            const token = tokenResponse.data.access_token;
            console.log('3. Token obtenido:', token.substring(0, 10) + '...');

            const telemetryUrl = "https://api.dji.com/device/api/v1/telemetry";
            console.log('4. Intentando obtener telemetría desde:', telemetryUrl);

            const telemetryResponse = await axios.get(telemetryUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('5. Respuesta de telemetría:', {
                status: telemetryResponse.status,
                data: telemetryResponse.data
            });

            const telemetria = telemetryResponse.data;

            const nuevaTelemetria = new Telemetria({
                droneId: telemetria.sn || 'unknown',
                timestamp: Date.now(),
                latitud: telemetria.latitude,
                longitud: telemetria.longitude,
                altitud: telemetria.altitude,
                velocidad: telemetria.speed,
                nivelbateria: telemetria.battery,
                posicion_vuelo: telemetria.flightStatus
            });

            console.log('6. Guardando en MongoDB:', nuevaTelemetria);
            await nuevaTelemetria.save();
            console.log('7. Datos guardados exitosamente');

            res.json(nuevaTelemetria);

        } catch (error) {
            console.error('Error detallado:', {
                message: error.message,
                stack: error.stack,
                response: error.response ? {
                    status: error.response.status,
                    data: error.response.data
                } : 'No response data'
            });

            res.status(500).json({
                error: "Error al obtener datos del dron",
                details: error.message,
                errorResponse: error.response ? error.response.data : null
            });
        }
    },
    receiveTelemetry: async (req, res) => {
        try {
            console.log('Datos recibidos:', req.body);
            
            const telemetriaData = req.body;
            
            const nuevaTelemetria = new Telemetria({
                droneId: telemetriaData.sn || 'unknown',
                timestamp: Date.now(),
                latitud: telemetriaData.latitude,
                longitud: telemetriaData.longitude,
                altitud: telemetriaData.altitude,
                velocidad: telemetriaData.speed,
                nivelbateria: telemetriaData.battery,
                posicion_vuelo: telemetriaData.flightStatus
            });

            await nuevaTelemetria.save();
            res.status(200).json({ success: true, message: 'Datos recibidos y guardados correctamente' });
        } catch (error) {
            console.error("Error al procesar telemetría:", error);
            res.status(500).json({ error: "Error procesando datos de telemetría" });
        }
    }
};

export default httptelemetria;