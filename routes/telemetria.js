import { Router } from 'express';
import httptelemetria from '../controllers/telemetria.js';
import validarApiKey from "../middlewares/validar_api.js";

const router = Router();

router.get("/", (req, res) => {
    res.status(200).send("DJI Cloud API Service");
});

// Añadimos el middleware validarApiKey y un try-catch
router.get("/listar", validarApiKey, async (req, res) => {
    try {
        await httptelemetria.getelemetria(req, res);
    } catch (error) {
        console.error('Error en ruta /listar:', error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


router.post("/webhook", [validarApiKey], httptelemetria.receiveTelemetry);

export default router;