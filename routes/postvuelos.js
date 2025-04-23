import {Router} from 'express'
import httpPostvuelos from '../controllers/postvuelos.js'
import {validarJWT} from '../middlewares/validar-jwt.js'
import multer from 'multer';

const router=Router()

const upload = multer({ storage: multer.memoryStorage() });

// router.get("/",[validarJWT],httpPostvuelos.obtenerPostvuelos)
router.get("/",[validarJWT],httpPostvuelos.obtenerPostvuelos)
router.get("/pcantidad",[validarJWT],httpPostvuelos.obtenerPostvuelosCantidad)
router.get("/pendientes",[validarJWT],httpPostvuelos.obtenerPostvuelosPendientes)
router.get("/pendientes/cantidad",[validarJWT],httpPostvuelos.obtenerPostvuelosPendientesCantidad)
router.get("/aprobados",[validarJWT],httpPostvuelos.obtenerPostvuelosAprobados)
router.get("/aprobados/cantidad",[validarJWT],httpPostvuelos.obtenerPostvuelosAprobadosCantidad)
router.get("/enproceso",[validarJWT],httpPostvuelos.obtenerPostvuelosEnproceso)
router.get("/enproceso/cantidad",[validarJWT],httpPostvuelos.obtenerPostvuelosEnprocesoCantidad)
router.get("/pendientes/email/:email",[validarJWT],httpPostvuelos.obtenerPostvuelosPendientesPorEmail)
router.get("/pendientes/email/cantidad/:email",[validarJWT],httpPostvuelos.obtenerPostvuelosPendientesPorEmailCantidad)
router.get("/aprobados/email/:email",[validarJWT],httpPostvuelos.obtenerPostvuelosAprobadosPorEmail)
router.get("/aprobados/email/cantidad/:email",[validarJWT],httpPostvuelos.obtenerPostvuelosAprobadosPorEmailCantidad)
router.get('/email/:email',[validarJWT], httpPostvuelos.obtenerPostvuelosPorEmail);
router.get('/filtrar-completo',[validarJWT], httpPostvuelos.obtenerPostvuelosPorEmailYEstado);
router.get('/obtenerdatospostvuelo/:consecutivo',[validarJWT], httpPostvuelos.obtenerPostvueloPorConsecutivo);

// router.post("/crear",httpPostvuelos.crearPostvuelo)
router.post("/crear", [validarJWT, upload.array('archivos')], httpPostvuelos.crearPostvuelo);

router.put("/editar/:consecutivo",[validarJWT],httpPostvuelos.editarPostvuelo)

router.put("/aprobar/:consecutivo",[validarJWT],httpPostvuelos.aprobarestadoPostvuelo)
router.put("/denegar/:consecutivo",[validarJWT],httpPostvuelos.denegarestadoPostvuelo)

export default router