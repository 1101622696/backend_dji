import axios from "axios";
import Telemetria from "../models/telemetria.js";
import djiAuth from "../services/djiAuth.js";

class TelemetriaController {
    constructor() {
        // DJI usa diferentes endpoints dependiendo del entorno
        this.baseURL = 'https://api.dji.com/api/v1';
    }

    // Método para recibir datos vía webhook/callback de DJI
    async receiveTelemetry(req, res) {
        try {
            console.log('Datos de telemetría recibidos:', req.body);
            
            // Extraer datos relevantes del payload de DJI
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
            
            // DJI espera una respuesta específica
            res.status(200).json({
                success: true,
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

    // Método para iniciar la conexión con el dron
    async initializeConnection(req, res) {
        try {
            const token = await djiAuth.getAccessToken();
            // Configurar el webhook/callback URL
            const response = await axios.post(`${this.baseURL}/workspace/binding`, {
                callback_url: `${process.env.BASE_URL}/api/dji/telemetry/webhook`,
                topics: ["drone_position", "battery_info", "flight_status"]
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            res.json({
                success: true,
                message: "Conexión inicializada correctamente",
                data: response.data
            });
        } catch (error) {
            console.error('Error inicializando conexión:', error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }
}

export default new TelemetriaController();