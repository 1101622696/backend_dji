// este está bien
// routes/telemetria.js
import { Router } from 'express';
import telemetriaController from '../controllers/telemetria.js';
import Telemetria from "../models/telemetria.js";
import validarApiKey from "../middlewares/validar_api.js";

const router = Router();

// Ruta para recibir datos de telemetría
// si sirve pero no en el control pero si en prueba1 postman 
router.post("/telemetry/webhook", telemetriaController.receiveTelemetry);

// tambien sirve en el control 
// router.get("/telemetry/webhook", (req, res) => {
//     console.log("DJI hizo una solicitud GET a /telemetry/webhook");
//     console.log("Headers:", req.headers);
//     console.log("Body:", req.body);
    
//     res.status(200).json({
//         success: true,
//         message: "DJI hizo una solicitud GET, pero esta ruta requiere POST."
//     });
// });

// router.route("/telemetry/webhook")
//     .get((req, res) => {
//         res.status(200).json({ message: "Webhook activo y listo para recibir datos" });
//     })
//     .post(telemetriaController.receiveTelemetry);



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

router.post("/pilot-login", async (req, res) => {
    const { username, password } = req.body;

    // Credenciales esperadas (estas pueden venir de una base de datos)
    const validUsername = "adminPC";
    const validPassword = "adminPC";

    if (username === validUsername && password === validPassword) {
        return res.status(200).json({
            success: true,
            message: "Login exitoso",
            token: "fake-jwt-token"
        });
    } else {
        return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }
});


router.post("/auth", async (req, res) => {
    const { app_key, app_secret } = req.body;

    try {
        console.log("Datos recibidos para autenticación:", req.body);

        const response = await axios.post("https://api.dji.com/v1/oauth/token", {
            app_key,
            app_secret,
            grant_type: "client_credentials"  // Asegura que incluyes esto
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("Respuesta de DJI:", response.data);
        
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error autenticando con DJI:");
        
        if (error.response) {
            console.log("Código de estado:", error.response.status);
            console.log("Cuerpo de la respuesta:", error.response.data);
            return res.status(error.response.status).json({ 
                error: "Error de autenticación", 
                detalle: error.response.data 
            });
        } else {
            return res.status(500).json({ 
                error: "Error interno del servidor", 
                detalle: error.message 
            });
        }
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