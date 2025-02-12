import axios from "axios";
import Telemetria from "../models/telemetria.js";

class TelemetriaController {
    async receiveTelemetry(req, res) {
        try {
            console.log('Datos de telemetría recibidos:', req.body);
            
            // Extraer datos del payload de DJI
            const {
                sn, // Número de serie del dron
                timestamp,
                position, // Contiene lat, lng, alt
                battery,
                speed,
                flightStatus
            } = req.body;

            // Crear nuevo registro de telemetría
            const telemetria = new Telemetria({
                droneId: sn,
                timestamp: new Date(timestamp),
                latitud: position?.lat,
                longitud: position?.lng,
                altitud: position?.alt,
                velocidad: speed,
                nivelbateria: battery?.capacity,
                posicion_vuelo: flightStatus
            });

            await telemetria.save();
            
            res.status(200).json({
                success: true,
                message: "Datos de telemetría guardados correctamente",
                data: telemetria
            });
        } catch (error) {
            console.error('Error procesando datos de telemetría:', error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }
}

export default new TelemetriaController();