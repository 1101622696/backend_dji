import {Router} from 'express'
import httpSolicitudes from '../controllers/solicitudes.js'
import {validarJWT} from '../middlewares/validar-jwt.js'
import multer from 'multer';

const router=Router()

const upload = multer({ storage: multer.memoryStorage() });

router.get("/",[validarJWT],httpSolicitudes.obtenerSolicitudes)
router.get("/porcliente/:cliente",[validarJWT],httpSolicitudes.obtenerSolicitudesPorCliente)
router.get("/pendientes",[validarJWT],httpSolicitudes.obtenerSolicitudesPendientes)
router.get("/pendientes/verificar/:consecutivo",[validarJWT],httpSolicitudes.verificarSolicitudPendiente)
router.get("/aprobadas",[validarJWT],httpSolicitudes.obtenerSolicitudesAprobadas)
router.get("/enproceso",[validarJWT],httpSolicitudes.obtenerSolicitudesEnProceso)
router.get("/canceladas",[validarJWT],httpSolicitudes.obtenerSolicitudesCanceladas)
router.get("/pendientes/email/:email",[validarJWT],httpSolicitudes.obtenerSolicitudesPendientesPorEmail)
router.get("/aprobadas/email/:email",[validarJWT],httpSolicitudes.obtenerSolicitudesAprobadasPorEmail)
router.get("/enproceso/email/:email",[validarJWT],httpSolicitudes.obtenerSolicitudesEnProcesoPorEmail)
router.get("/canceladas/email/:email",[validarJWT],httpSolicitudes.obtenerSolicitudesCanceladasPorEmail)
router.get('/email/:email',[validarJWT], httpSolicitudes.obtenerSolicitudesPorEmail);
router.get('/ultimoemail/:email',[validarJWT], httpSolicitudes.obtenerSolicitudesPorUltimoEmail);
router.get('/filtrar-completo',[validarJWT], httpSolicitudes.obtenerSolicitudesPorEmailYEstado);
router.get('/obtenerdatossolicitud/:consecutivo',[validarJWT], httpSolicitudes.obtenerSolicitudPorConsecutivo);
router.get('/etapas/:consecutivo',[validarJWT], httpSolicitudes.obtenerSolicitudConEtapas);
router.get('/conetapas',[validarJWT], httpSolicitudes.obtenerTodasSolicitudesConEtapas);
router.get('/conetapas/email/:email',[validarJWT], httpSolicitudes.obtenerTodasSolicitudesConEtapasEmail);
router.get('/estadoproceso/:estado',[validarJWT], httpSolicitudes.obtenerSolicitudesPorEstadoProceso);


// fase mejorara para obtener los consecutivos con su estado en cada proceso 
router.get("/listar",[validarJWT],httpSolicitudes.obtenerTodasLasSolicitudesConEstados)
router.get("/resumen/email/:email",[validarJWT],httpSolicitudes.obtenerResumenPorEmail)
router.get("/emailestado/email/:email",[validarJWT],httpSolicitudes.obtenerSolicitudesPorEmailConEstados)
router.get("/emailestado/consecutivo/:consecutivo",[validarJWT],httpSolicitudes.obtenerSolicitudPorConsecutivoConEstados)
router.get("/emailestado/estado/:estado",[validarJWT],httpSolicitudes.obtenerSolicitudesPorEstadoGeneral)
router.get("/estadisticas/email/:email",[validarJWT],httpSolicitudes.obtenerEstadisticasGenerales)
router.get("/buscar",[validarJWT],httpSolicitudes.buscarSolicitudesAvanzado)



router.post("/crear", [validarJWT, upload.array('archivos')], httpSolicitudes.crearSolicitud);

router.put("/editar/:consecutivo", [validarJWT, upload.array('archivos')], httpSolicitudes.editarSolicitud);

router.put("/aprobar/:consecutivo",[validarJWT],httpSolicitudes.aprobarestadoSolicitud)
router.put("/denegar/:consecutivo",[validarJWT],httpSolicitudes.denegarestadoSolicitud)
router.put("/cancelar/:consecutivo",[validarJWT],httpSolicitudes.cancelarEstadoSolicitud)

export default router