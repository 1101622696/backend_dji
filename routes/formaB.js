import { Router } from 'express';
import formularioController from '../controllers/formaB.js';

const router = Router();

router.get('/archivo/:nombreArchivo', formularioController.procesarFormularioCompleto);

router.post('/procesarformaB', formularioController.procesarFormulariosDesdeDrive);

export default router;
