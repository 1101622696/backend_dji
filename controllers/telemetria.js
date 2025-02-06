import axios from "axios";
import Telemetria from "../models/telemetria.js";

const httptelemetria = {
    getelemetria: async (req, res) => {
        try {
            console.log('Iniciando obtención de telemetría...');
            
            const tokenResponse = await axios.post("https://api.dji.com/oauth/api/v1/token", {
                client_id: process.env.APP_KEY,
                client_secret: process.env.APP_SECRET,
                grant_type: 'client_credentials'
            });

            console.log('Token obtenido correctamente');

            const token = tokenResponse.data.access_token;

            const telemetryResponse = await axios.get("https://api.dji.com/device/api/v1/telemetry", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Datos de telemetría recibidos:', telemetryResponse.data);

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
            console.log('Datos guardados en MongoDB');
            
            res.json(nuevaTelemetria);

        } catch (error) {
            console.error("Error detallado al obtener telemetría:", error);
            if (error.response) {
                console.error('Respuesta de error:', error.response.data);
            }
            res.status(500).json({ 
                error: "Error al obtener datos del dron",
                details: error.message 
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