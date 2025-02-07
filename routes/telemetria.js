// import { Router } from 'express';
// import httptelemetria from '../controllers/telemetria.js';
// import diagnosticocontroller from '../controllers/diagnostico.js';
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

// router.get("/test-connection", validarApiKey, httptelemetria.testDJIConnection);
// // router.get("/testconnection", validarApiKey, httptelemetria.testConnection);
// router.post("/webhook", validarApiKey, httptelemetria.receiveTelemetry);

// export default router;



import { Router } from 'express';
import telemetriaController from '../controllers/telemetria.js';
import validarApiKey from "../middlewares/validar_api.js";

const router = Router();

router.get("/telemetria", validarApiKey, (req, res) => {
    console.log("Accediendo a ruta /telemetria");
    telemetriaController.getTelemetria(req, res);
});

router.get("/historico", validarApiKey, async (req, res) => {
    try {
        const historico = await Telemetria.find().sort({ createdAt: -1 }).limit(100);
        res.json(historico);
    } catch (error) {
        console.error('Error obteniendo histórico:', error);
        res.status(500).json({ error: "Error obteniendo histórico" });
    }
});

// router.post("/cloud/oauth/token", validarApiKey, async (req, res) => {
//     try {
//         const token = "TOKEN_GENERADO"; 
//               res.json({ token });
//     } catch (error) {
//         console.error('Error obteniendo token:', error);
//         res.status(500).json({ error: "Error al obtener el token" });
//     }
// });
router.all("/cloud/oauth/token", validarApiKey, async (req, res) => {
    try {
        const token = "TOKEN_GENERADO";  
        res.json({
            access_token: token,
            token_type: "Bearer",
            expires_in: 3600
        });
    } catch (error) {
        console.error('Error obteniendo token:', error);
        res.status(500).json({ error: "Error al obtener el token" });
    }
});

export default router;
