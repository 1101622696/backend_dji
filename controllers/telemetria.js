import axios from "axios";
import Telemetria from "../models/telemetria.js";

const httptelemetria = {
  getelemetria: async (req, res) => {
    try {
      // Obtén el token de la API (puedes optimizarlo guardándolo en memoria si no expira constantemente)
      const tokenResponse = await axios.post("https://open.dji.com/v1/auth/token", {
        app_key: process.env.APP_KEY,
        app_secret: process.env.APP_SECRET,
      });

      const token = tokenResponse.data.access_token;

      // Llama a la API de telemetría del dron
      const telemetryResponse = await axios.get("https://open.dji.com/v1/telemetry", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const telemetria = telemetryResponse.data;

      // Opcional: Guarda los datos de telemetría en MongoDB
      const nuevaTelemetria = new Telemetria({
        droneId: telemetria.drone_id,
        timestamp: Date.now(),
        latitude: telemetria.latitude,
        longitude: telemetria.longitude,
        altitude: telemetria.altitude,
        speed: telemetria.speed,
        batteryLevel: telemetria.battery,
        flightStatus: telemetria.status,
      });

      await nuevaTelemetria.save();

      // Devuelve los datos al cliente
      res.json(nuevaTelemetria);
    } catch (error) {
      console.error("Error al obtener telemetría:", error.message);
      res.status(500).json({ error: "Error al obtener datos del dron" });
    }
  },
  receiveTelemetry: async (req, res) => {
    try {
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
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error al procesar telemetría:", error);
        res.status(500).json({ error: "Error procesando datos de telemetría" });
    }
}
};

export default httptelemetria;
