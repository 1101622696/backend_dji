import {Router} from 'express'
import httptelemetria from '../controllers/telemetria.js'
import validarApiKey from "../middlewares/validar_api.js";

const router = Router()

// Ruta para la verificación inicial de DJI Cloud API
router.get("/", (req, res) => {
    res.status(200).send("DJI Cloud API Service");
});

// Ruta para obtener datos guardados
router.get("/listar", [validarApiKey], httptelemetria.getelemetria)

// Ruta para recibir datos del dron
router.post("/webhook", [validarApiKey], httptelemetria.receiveTelemetry)

export default router