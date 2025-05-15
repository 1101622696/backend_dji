import {Router} from 'express'
import httpPostvuelos from '../controllers/postvuelos.js'
import {validarJWT} from '../middlewares/validar-jwt.js'
import multer from 'multer';

const router=Router()

const upload = multer({ storage: multer.memoryStorage() });

router.get("/",[validarJWT],httpPostvuelos.obtenerPostvuelos)
router.get("/pendientes",[validarJWT],httpPostvuelos.obtenerPostvuelosPendientes)
router.get("/pendientes/verificar/:consecutivo",[validarJWT],httpPostvuelos.verificarPostvueloPendiente)
router.get("/aprobados",[validarJWT],httpPostvuelos.obtenerPostvuelosAprobados)
router.get("/enproceso",[validarJWT],httpPostvuelos.obtenerPostvuelosEnproceso)
router.get("/pendientes/email/:email",[validarJWT],httpPostvuelos.obtenerPostvuelosPendientesPorEmail)
router.get("/aprobados/email/:email",[validarJWT],httpPostvuelos.obtenerPostvuelosAprobadosPorEmail)
router.get('/email/:email',[validarJWT], httpPostvuelos.obtenerPostvuelosPorEmail);
router.get('/filtrar-completo',[validarJWT], httpPostvuelos.obtenerPostvuelosPorEmailYEstado);
router.get('/obtenerdatospostvuelo/:consecutivo',[validarJWT], httpPostvuelos.obtenerPostvueloPorConsecutivo);
router.get('/etapas/:consecutivo',[validarJWT], httpPostvuelos.obtenerPostvueloConEtapas);
router.get('/conetapas',[validarJWT], httpPostvuelos.obtenerTodosPostvuelosConEtapas);
router.get('/conetapas/email/:email',[validarJWT], httpPostvuelos.obtenerTodosPostvuelosConEtapasEmail);
router.get('/estadoproceso/:estado',[validarJWT], httpPostvuelos.obtenerPostvuelosPorEstado);

router.post("/crear", [validarJWT, upload.array('archivos')], httpPostvuelos.crearPostvuelo);

router.put("/editar/:consecutivo",[validarJWT, upload.array('archivos')], httpPostvuelos.editarPostvuelo)

router.put("/aprobar/:consecutivo",[validarJWT],httpPostvuelos.aprobarestadoPostvuelo)
router.put("/denegar/:consecutivo",[validarJWT],httpPostvuelos.denegarestadoPostvuelo)

export default router