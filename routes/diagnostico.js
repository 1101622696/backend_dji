import { Router } from 'express';
import diagnostico from '../controllers/diagnostico.js';

const router = Router();

router.get("/diagnostico", (req, res) => {
    console.log("Accediendo a ruta de diagnóstico");
    diagnostico.testConexion(req, res);
});

export default router;
