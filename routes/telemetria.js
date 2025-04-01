// este está bien
// routes/telemetria.js
import { Router } from 'express';
import telemetriaController from '../controllers/telemetria.js';
import Telemetria from "../models/telemetria.js";
import validarApiKey from "../middlewares/validar_api.js";
import axios from "axios";

const router = Router();

// Ruta para recibir datos de telemetría
router.post("/telemetry/webhook", telemetriaController.receiveTelemetry);

// Ruta para obtener histórico
router.get("/historico", validarApiKey, async (req, res) => {
    try {
        const historico = await Telemetria.find().sort({ timestamp: -1 }).limit(100);
        res.json(historico);
    } catch (error) {
        console.error('Error obteniendo histórico:', error);
        res.status(500).json({ error: "Error obteniendo histórico" });
    }
});

// Cambia tu controlador de autenticación a esto
router.post("/auth", async (req, res) => {
    const { app_key, app_secret } = req.body;

    try {
        const response = await axios.post(`${process.env.BASE_URL}/api/v1/auth/token`, {
            app_key,
            app_secret
        });

        if (response.data && response.data.access_token) {
            res.status(200).json({ token: response.data.access_token });
        } else {
            res.status(400).json({ error: "Error de autenticación", detalle: response.data });
        }
    } catch (error) {
        console.error("Error autenticando con DJI:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router;


// este es el local
// import { Router } from 'express';
// import httptelemetria from '../controllers/telemetria.js';
// import validarApiKey from "../middlewares/validar_api.js";

// const router = Router();

// // Ruta de verificación DJI
// router.get("/", (req, res) => {
//     console.log("Accediendo a ruta de verificación DJI");
//     res.status(200).send("DJI Cloud API Service");
// });

// // Otras rutas...
// router.get("/listar", validarApiKey, async (req, res) => {
//     console.log("Accediendo a ruta /listar");
//     try {
//         await httptelemetria.getelemetria(req, res);
//     } catch (error) {
//         console.error('Error en ruta /listar:', error);
//         res.status(500).json({ error: "Error interno del servidor" });
//     }
// });

// router.get("/test", async(req, res) => {
//     console.log("Diagnostic route accessed");
//     try {
//         const resultados = {
//             status: 'OK',
//             message: 'Diagnostic endpoint working'
//         };
//         res.json(resultados);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // router.get("/test-connection", validarApiKey, httptelemetria.testDJIConnection);
// // router.get("/testconnection", validarApiKey, httptelemetria.testConnection);
// // router.post("/webhook", validarApiKey, httptelemetria.receiveTelemetry);

// export default router;