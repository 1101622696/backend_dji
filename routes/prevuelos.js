import {Router} from 'express'
import httpPrevuelos from '../controllers/prevuelos.js'
import {validarJWT} from '../middlewares/validar-jwt.js'

const router=Router()


router.get("/",[validarJWT],httpPrevuelos.obtenerprevuelos)
router.get("/pendientes",[validarJWT],httpPrevuelos.obtenerPrevuelosPendientes)
router.get("/pendientes/verificar/:consecutivo",[validarJWT],httpPrevuelos.verificarPrevueloPendiente)
router.get("/aprobados",[validarJWT],httpPrevuelos.obtenerPrevuelosAprobadas)
router.get("/enproceso",[validarJWT],httpPrevuelos.obtenerPrevuelosEnProceso)
router.get("/pendientes/email/:email",[validarJWT],httpPrevuelos.obtenerPrevuelosPendientesPorEmail)
router.get("/aprobados/email/:email",[validarJWT],httpPrevuelos.obtenerPrevuelosAprobadosPorEmail)
router.get("/enproceso/email/:email",[validarJWT],httpPrevuelos.obtenerPrevuelosEnProcesoPorEmail)
router.get('/email/:email',[validarJWT], httpPrevuelos.obtenerPrevuelosPorEmail);
router.get('/filtrar-completo',[validarJWT], httpPrevuelos.obtenerPrevuelosPorEmailYEstado);
router.get('/obtenerdatosprevuelo/:consecutivo',[validarJWT], httpPrevuelos.obtenerPrevueloPorConsecutivo);
router.get('/etapas/:consecutivo',[validarJWT], httpPrevuelos.obtenerPrevueloConEtapas);
router.get('/conetapas',[validarJWT], httpPrevuelos.obtenerTodosPrevuelosConEtapas);
router.get('/conetapas/email/:email',[validarJWT], httpPrevuelos.obtenerTodosPrevuelosConEtapasEmail);
router.get('/estadoproceso/:estado',[validarJWT], httpPrevuelos.obtenerPrevuelosPorEstado);

router.post("/crear",[validarJWT],httpPrevuelos.crearPrevuelo)

router.put("/editar/:consecutivo",[validarJWT],httpPrevuelos.editarPrevuelo)

router.put("/aprobar/:consecutivo",[validarJWT],httpPrevuelos.aprobarestadoPrevuelo)
router.put("/denegar/:consecutivo",[validarJWT],httpPrevuelos.denegarestadoPrevuelo)

export default router