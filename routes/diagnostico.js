import { Router } from 'express';
import diagnosticocontroller from '../controllers/diagnostico.js';
import validarApiKey from "../middlewares/validar_api.js";

const router = Router();

// Change this from "/diagnostico" to "/"
router.get("/", validarApiKey, async(req, res) => {
    console.log("Accediendo a ruta de diagnóstico");
    try {
        await diagnosticocontroller.testConexion(req, res);
    } catch (error) {
        console.error('Error en ruta /diagnostico:', error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router;