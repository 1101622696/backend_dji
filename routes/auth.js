import { Router } from 'express';
import AuthController from '../controllers/auth.js';

const router = Router();

// Ruta para autenticación con DJI
router.post("/auth", AuthController.authenticateDJI);

export default router;
