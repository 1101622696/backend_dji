




// código de intento para cloud api 
// import { Router } from 'express';
// import telemetriaController from '../controllers/telemetria.js';
// import Telemetria from "../models/telemetria.js";
// // import validarApiKey from "../middlewares/validar_api.js";

// const router = Router();

// router.post("/telemetry/webhook", telemetriaController.receiveTelemetry);

// router.get("/historico", async (req, res) => {
//     try {
//         const historico = await Telemetria.find().sort({ timestamp: -1 }).limit(100);
//         res.json(historico);
//     } catch (error) {
//         console.error('Error obteniendo histórico:', error);
//         res.status(500).json({ error: "Error obteniendo histórico" });
//     }
// });

// export default router;

