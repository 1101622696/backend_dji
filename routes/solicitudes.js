import {Router} from 'express'
import httpSolicitudes from '../controllers/solicitudes.js'
import {validarJWT} from '../middlewares/validar-jwt.js'
import multer from 'multer';

const router=Router()

const upload = multer({ storage: multer.memoryStorage() });

// router.get("/",[validarJWT],httpSolicitudes.obtenerSolicitudes)

// router.post("/crear",[validarJWT],httpSolicitudes.crearSolicitud)
router.post("/crear", [validarJWT, upload.array('archivos')], httpSolicitudes.crearSolicitud);

router.get("/",httpSolicitudes.obtenerSolicitudes)
router.get("/pendientes",httpSolicitudes.obtenerSolicitudesPendientes)
router.get("/aprobadas",httpSolicitudes.obtenerSolicitudesAprobadas)
router.get("/enproceso",httpSolicitudes.obtenerSolicitudesEnproceso)
router.get('/email/:email', httpSolicitudes.obtenerSolicitudesPorEmail);
router.get('/filtrar-completo', httpSolicitudes.obtenerSolicitudesPorEmailYEstado);
router.get('/obtenerdatossolicitud/:consecutivo', httpSolicitudes.obtenerSolicitudPorConsecutivo);


// router.post("/crear",httpSolicitudes.crearSolicitud)

router.put("/editar/:consecutivo",httpSolicitudes.editarSolicitud)

router.put("/aprobar/:consecutivo",httpSolicitudes.aprobarestadoSolicitud)
router.put("/denegar/:consecutivo",httpSolicitudes.denegarestadoSolicitud)

export default router