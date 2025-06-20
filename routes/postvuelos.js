import {Router} from 'express'
import httpPostvuelos from '../controllers/postvuelos.js'
import {validarJWT} from '../middlewares/validar-jwt.js'
import multer from 'multer';

const router=Router()

const upload = multer({ storage: multer.memoryStorage() });

router.get('/obtenerdatospostvuelo/:consecutivo',[validarJWT], httpPostvuelos.obtenerPostvueloPorConsecutivo);

router.post("/crear", [validarJWT, upload.array('archivos')], httpPostvuelos.crearPostvuelo);

router.put("/editar/:consecutivo",[validarJWT, upload.array('archivos')], httpPostvuelos.editarPostvuelo)

router.put("/aprobar/:consecutivo",[validarJWT],httpPostvuelos.aprobarestadoPostvuelo)
router.put("/denegar/:consecutivo",[validarJWT],httpPostvuelos.denegarestadoPostvuelo)

export default router