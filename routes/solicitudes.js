import {Router} from 'express'
import httpSolicitudes from '../controllers/solicitudes.js'
import {validarJWT} from '../middlewares/validar-jwt.js'
import multer from 'multer';

const router=Router()

const upload = multer({ storage: multer.memoryStorage() });

router.get("/",[validarJWT],httpSolicitudes.obtenerSolicitudes)
router.get("/scantidad",[validarJWT],httpSolicitudes.obtenerSolicitudesCantidad)
router.get("/pendientes",[validarJWT],httpSolicitudes.obtenerSolicitudesPendientes)
router.get("/pendientes/cantidad",[validarJWT],httpSolicitudes.obtenerSolicitudesPendientesCantidad)
router.get("/pendientes/verificar/:consecutivo",[validarJWT],httpSolicitudes.verificarSolicitudPendiente)
router.get("/aprobadas",[validarJWT],httpSolicitudes.obtenerSolicitudesAprobadas)
router.get("/aprobadas/cantidad",[validarJWT],httpSolicitudes.obtenerSolicitudesAprobadasCantidad)
router.get("/enproceso",[validarJWT],httpSolicitudes.obtenerSolicitudesEnProceso)
router.get("/enproceso/cantidad",[validarJWT],httpSolicitudes.obtenerSolicitudesEnProcesoCantidad)
router.get("/pendientes/email/:email",[validarJWT],httpSolicitudes.obtenerSolicitudesPendientesPorEmail)
router.get("/pendientes/email/cantidad/:email",[validarJWT],httpSolicitudes.obtenerSolicitudesPendientesPorEmail)
router.get("/aprobadas/email/:email",[validarJWT],httpSolicitudes.obtenerSolicitudesAprobadasPorEmail)
router.get("/aprobadas/email/cantidad/:email",[validarJWT],httpSolicitudes.obtenerSolicitudesAprobadasPorEmailCantidad)
router.get("/enproceso/email/:email",[validarJWT],httpSolicitudes.obtenerSolicitudesEnProcesoPorEmail)
router.get("/enproceso/email/cantidad/:email",[validarJWT],httpSolicitudes.obtenerSolicitudesEnProcesoPorEmailCantidad)
router.get('/email/:email',[validarJWT], httpSolicitudes.obtenerSolicitudesPorEmail);
router.get('/filtrar-completo',[validarJWT], httpSolicitudes.obtenerSolicitudesPorEmailYEstado);
router.get('/obtenerdatossolicitud/:consecutivo',[validarJWT], httpSolicitudes.obtenerSolicitudPorConsecutivo);
router.get('/etapas/:consecutivo',[validarJWT], httpSolicitudes.obtenerSolicitudConEtapas);
router.get('/conetapas',[validarJWT], httpSolicitudes.obtenerTodasSolicitudesConEtapas);
router.get('/estadoproceso/:estado',[validarJWT], httpSolicitudes.obtenerSolicitudesPorEstadoProceso);

// router.post("/crear",httpSolicitudes.crearSolicitud)
router.post("/crear", [validarJWT, upload.array('archivos')], httpSolicitudes.crearSolicitud);

// In your routes.js
router.put("/editar/:consecutivo", [validarJWT, upload.array('archivos')], httpSolicitudes.editarSolicitud);
// router.put("/editar/:consecutivo",[validarJWT],httpSolicitudes.editarSolicitud)

router.put("/aprobar/:consecutivo",[validarJWT],httpSolicitudes.aprobarestadoSolicitud)
router.put("/denegar/:consecutivo",[validarJWT],httpSolicitudes.denegarestadoSolicitud)

export default router