import axios from "axios";
import Telemetria from "../models/telemetria.js";
import djiAuth from "../services/djiAuth.js";

class TelemetriaController {
    constructor() {
        // Updated to use DJI's cloud API endpoint
        this.baseURL = 'https://developer.dji.com/api/v1';
    }

    async receiveTelemetry(req, res) {
        try {
            console.log('Raw webhook payload:', JSON.stringify(req.body, null, 2));
            
            // Extract data from DJI's webhook payload
            const {
                sn, 
                timestamp,
                position,
                battery,
                speed,
                flightStatus
            } = req.body;

            // Log extracted data
            console.log('Extracted telemetry data:', {
                sn, timestamp, position, battery, speed, flightStatus
            });

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
            console.log('Telemetry saved successfully');
            
            res.status(200).json({
                success: true,
                message: 'Telemetry data received and stored',
                data: telemetria
            });
        } catch (error) {
            console.error('Error processing telemetry:', error);
            res.status(500).json({ 
                success: false,
                error: error.message 
            });
        }
    }

    async initializeConnection(req, res) {
        try {
            console.log('Initializing DJI connection...');
            
            const token = await djiAuth.getAccessToken();
            console.log('Successfully obtained token');

            // Register webhook URL with DJI
            const webhookUrl = `${process.env.BASE_URL}/api/dji/telemetry/webhook`;
            console.log('Registering webhook URL:', webhookUrl);

            const response = await axios.post(`${this.baseURL}/workspaces/bindings`, {
                callback_url: webhookUrl,
                topics: ["drone_position", "battery_info", "flight_status"]
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('DJI binding response:', response.data);

            res.json({
                success: true,
                message: "Connection initialized successfully",
                data: response.data
            });
        } catch (error) {
            console.error('Detailed initialization error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            res.status(500).json({ 
                success: false,
                error: error.message
            });
        }
    }
}

export default new TelemetriaController();