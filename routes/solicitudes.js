import {Router} from 'express'
import httpSolicitudes from '../controllers/solicitudes.js'
import {validarJWT} from '../middlewares/validar-jwt.js'
import multer from 'multer';

const router=Router()

const upload = multer({ storage: multer.memoryStorage() });

// router.get("/",[validarJWT],httpSolicitudes.obtenerSolicitudes)

// router.post("/crear",[validarJWT],httpSolicitudes.crearSolicitud)
router.post("/crear", [validarJWT, upload.array('archivos')], httpSolicitudes.crearSolicitud);

router.get("/",[validarJWT],httpSolicitudes.obtenerSolicitudes)
router.get("/pendientes",[validarJWT],httpSolicitudes.obtenerSolicitudesPendientes)
router.get("/aprobadas",[validarJWT],httpSolicitudes.obtenerSolicitudesAprobadas)
router.get("/enproceso",[validarJWT],httpSolicitudes.obtenerSolicitudesEnProceso)
router.get("/pendientes/email/:email",[validarJWT],httpSolicitudes.obtenerSolicitudesPendientesPorEmail)
router.get("/aprobadas/email/:email",[validarJWT],httpSolicitudes.obtenerSolicitudesAprobadasPorEmail)
router.get("/enproceso/email/:email",[validarJWT],httpSolicitudes.obtenerSolicitudesEnProcesoPorEmail)
router.get('/email/:email',[validarJWT], httpSolicitudes.obtenerSolicitudesPorEmail);
router.get('/filtrar-completo',[validarJWT], httpSolicitudes.obtenerSolicitudesPorEmailYEstado);
router.get('/obtenerdatossolicitud/:consecutivo',[validarJWT], httpSolicitudes.obtenerSolicitudPorConsecutivo);


// router.post("/crear",httpSolicitudes.crearSolicitud)

router.put("/editar/:consecutivo",[validarJWT],httpSolicitudes.editarSolicitud)

router.put("/aprobar/:consecutivo",[validarJWT],httpSolicitudes.aprobarestadoSolicitud)
router.put("/denegar/:consecutivo",[validarJWT],httpSolicitudes.denegarestadoSolicitud)

export default router