import { Router } from 'express';
import httptelemetria from '../controllers/telemetria.js';
import validarApiKey from "../middlewares/validar_api.js";

const router = Router();

// Ruta de verificación para DJI - debe estar en la raíz
router.get("/", (req, res) => {
    res.status(200).send("DJI Cloud API Service");
});
router.get("/listar", [validarApiKey], httptelemetria.getelemetria);
router.get("/listar", httptelemetria.getelemetria);


// Ruta para obtener datos guardados
// router.get("/telemetry", [validarApiKey], httptelemetria.getelemetria);

// Ruta para webhook de DJI
router.post("/webhook", [validarApiKey], httptelemetria.receiveTelemetry);

export default router;