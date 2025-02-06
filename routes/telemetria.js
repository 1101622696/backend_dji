// import { Router } from 'express';
// import httptelemetria from '../controllers/telemetria.js';
// import diagnostico from '../controllers/diagnostico.js';  
// import validarApiKey from "../middlewares/validar_api.js";

// const router = Router();

// // Ruta de verificación DJI
// router.get("/", (req, res) => {
//     console.log("Accediendo a ruta de verificación DJI");
//     res.status(200).send("DJI Cloud API Service");
// });

// // Ruta para listar telemetría
// router.get("/listar", validarApiKey, async (req, res) => {
//     console.log("Accediendo a ruta /listar");
//     try {
//         await httptelemetria.getelemetria(req, res);
//     } catch (error) {
//         console.error('Error en ruta /listar:', error);
//         res.status(500).json({ error: "Error interno del servidor" });
//     }
// });
// router.get("/diagnostico", validarApiKey, diagnostico.testConexion);
// router.post("/webhook", validarApiKey, httptelemetria.receiveTelemetry);

// export default router;



import { Router } from 'express';
import httptelemetria from '../controllers/telemetria.js';
import diagnosticocontroller from '../controllers/diagnostico.js';
import validarApiKey from "../middlewares/validar_api.js";

const router = Router();

// Ruta de verificación DJI
router.get("/", (req, res) => {
    console.log("Accediendo a ruta de verificación DJI");
    res.status(200).send("DJI Cloud API Service");
});

// Ruta de diagnóstico
router.get("/diagnostico", (req, res) => {
    console.log("Accediendo a ruta de diagnóstico");
    diagnostico.testConexion(req, res);
});
// Otras rutas...
router.get("/listar", validarApiKey, async (req, res) => {
    console.log("Accediendo a ruta /listar");
    try {
        await httptelemetria.getelemetria(req, res);
    } catch (error) {
        console.error('Error en ruta /listar:', error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.get("/test", validarApiKey, async(req, res) => {
    console.log("Accediendo a ruta de diagnóstico");
    try {
        await diagnosticocontroller.testConexion(req, res);
    } catch (error) {
        console.error('Error en ruta /diagnostico:', error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.get("/test-connection", validarApiKey, httptelemetria.testDJIConnection);
router.post("/webhook", validarApiKey, httptelemetria.receiveTelemetry);

export default router;