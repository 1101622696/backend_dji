import { Router } from 'express';
import formularioController from '../controllers/formaA.js';

const router = Router();

router.get('/archivo/:nombreArchivo', formularioController.procesarFormularioCompleto);

router.post('/procesarformaA', formularioController.procesarFormulariosDesdeDrive);

export default router;

// router.get('/parentesis/:nombreArchivo', formularioController.procesarParentesis);
// router.get('/parentesis-ocr/:nombreArchivo', formularioController.procesarParentesisOCR);

// router.get('/archivos', formularioController.listarArchivos);


// router.get('/radiobutton-con-x/:nombreArchivo', formularioController.procesarRadiobuttonConX);
// router.get('/radiobutton-con-x-numero/:nombreArchivo', formularioController.procesarRadiobuttonXConNumero);
// router.get('/radiobutton-con-x-texto/:nombreArchivo', formularioController.procesarRadiobuttonXConTexto);
// router.get('/radiobutton-con-relleno/:nombreArchivo', formularioController.procesarRadiobuttonXConRelleno);

// router.get('/lista-indentada/:nombreArchivo', formularioController.procesarListaIndentada);
// router.get('/lista-indentada-ocr/:nombreArchivo', formularioController.procesarListaIndentadaOCR);
// router.get('/parentesis/:nombreArchivo', formularioController.procesarParentesis);
// router.get('/parentesis-ocr/:nombreArchivo', formularioController.procesarParentesisOCR);


// router.get('/imagen/:nombreArchivo', formularioController.procesarOpenAIImagen);
// router.get('/archivos', formularioController.listarArchivos);

// router.get('/detectar/:nombreArchivo', formularioController.detectarX);
// router.get('/estructura/:nombreArchivo', formularioController.detectarEstructura);
// router.get('/detectar/:nombreArchivo', formularioController.detectarX);
// router.get('/comparar/:nombreArchivo', formularioController.compararMetodos);

// router.get('/imagen/:nombreArchivo', formularioController.procesarOpenAIImagen);
// router.get('/comparacionvision/:nombreArchivo', formularioController.procesarComparacion);
// router.get('/probarprompt/:nombreArchivo', formularioController.probarDetector);
// router.get('/ocr/:nombreArchivo', formularioController.procesarOpenAIOCR);

// router.post('/lote', formularioController.procesarLote);