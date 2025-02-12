import { Router } from 'express';
import telemetriaController from '../controllers/telemetria.js';
import validarApiKey from "../middlewares/validar_api.js";

const router = Router();

// Ruta para recibir datos de telemetría vía webhook
router.post("/telemetry/webhook", telemetriaController.receiveTelemetry);

// Ruta para inicializar la conexión
router.post("/initialize", validarApiKey, telemetriaController.initializeConnection);

// Mantén tu ruta de histórico
router.get("/historico", validarApiKey, async (req, res) => {
    try {
        const historico = await Telemetria.find().sort({ timestamp: -1 }).limit(100);
        res.json(historico);
    } catch (error) {
        console.error('Error obteniendo histórico:', error);
        res.status(500).json({ error: "Error obteniendo histórico" });
    }
});

// Ruta de autenticación DJI
router.post("/cloud/oauth/token", async (req, res) => {
    try {
        const { app_id, app_key } = req.body;
        
        // Validar credenciales
        if (app_id !== process.env.APP_ID || app_key !== process.env.APP_KEY) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        // Generar token (deberías implementar una lógica más robusta)
        const token = Buffer.from(`${app_id}:${app_key}`).toString('base64');

        res.json({
            access_token: token,
            token_type: "Bearer",
            expires_in: 3600
        });
    } catch (error) {
        res.status(500).json({ error: "Error en autenticación" });
    }
});

export default router;