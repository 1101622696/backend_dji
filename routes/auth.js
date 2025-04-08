import { Router } from 'express';
import AuthController from '../controllers/auth.js';

const router = Router();

// Ruta para obtener token manualmente
router.get('/auth/token', AuthController.getAccessToken);

// Ruta para suscribirse al topic OSD (opcional, puede añadirse si deseas probar directamente)
router.post('/auth/subscribe', AuthController.subscribeToTopics);

export default router;