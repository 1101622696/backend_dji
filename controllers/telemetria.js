// controllers/telemetria.js
import axios from "axios";
import Telemetria from "../models/telemetria.js";

const httptelemetria = {
    getelemetria: async (req, res) => {
        try {
            console.log('1. Iniciando obtención de token...');
            
            // URL correcta para la API de DJI
            const tokenResponse = await axios.post("https://developer.dji.com/api/v1/auth/token", {
                app_id: process.env.APP_KEY,
                app_secret: process.env.APP_SECRET
            });

            console.log('2. Respuesta del token:', {
                status: tokenResponse.status,
                statusText: tokenResponse.statusText
            });

            const token = tokenResponse.data.access_token;
            console.log('3. Token obtenido');

            // URL correcta para obtener telemetría
            const telemetryResponse = await axios.get("https://developer.dji.com/api/v1/telemetry", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('4. Respuesta de telemetría recibida');

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

            await nuevaTelemetria.save();
            console.log('5. Datos guardados en MongoDB');
            
            res.json(nuevaTelemetria);

        } catch (error) {
            console.error('Error detallado:', {
                message: error.message,
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
            console.log('Datos recibidos del webhook:', req.body);
            
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
            res.status(200).json({ 
                success: true, 
                message: 'Datos recibidos y guardados correctamente',
                data: nuevaTelemetria
            });
        } catch (error) {
            console.error("Error al procesar telemetría:", error);
            res.status(500).json({ 
                error: "Error procesando datos de telemetría",
                details: error.message
            });
        }
    }
};

export default httptelemetria;