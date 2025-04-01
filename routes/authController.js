import { Router } from 'express';
import AuthController from '../controllers/authController.js';
// import validarApiKey from "../middlewares/validar_api.js";

const router = Router();

router.post('/api/dji/auth', AuthController.authenticateDJI);

export default router;