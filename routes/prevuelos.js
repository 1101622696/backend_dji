import {Router} from 'express'
import httpPrevuelos from '../controllers/prevuelos.js'
import {validarJWT} from '../middlewares/validar-jwt.js'

const router=Router()

// router.get("/",[validarJWT],httpPrevuelos.obtenerprevuelos)

router.post("/crear",[validarJWT],httpPrevuelos.crearPrevuelo)
router.get("/",httpPrevuelos.obtenerprevuelos)
router.get("/pendientes",httpPrevuelos.obtenerPrevuelosPendientes)
router.get("/aprobadas",httpPrevuelos.obtenerPrevuelosAprobadas)
router.get("/enproceso",httpPrevuelos.obtenerPrevuelosEnproceso)
router.get('/email/:email', httpPrevuelos.obtenerPrevuelosPorEmail);
router.get('/filtrar-completo', httpPrevuelos.obtenerPrevuelosPorEmailYEstado);
router.get('/obtenerdatosprevuelo/:consecutivo', httpPrevuelos.obtenerPrevueloPorConsecutivo);

// router.post("/crear",httpPrevuelos.crearPrevuelo)
router.put("/editar/:consecutivo",httpPrevuelos.editarPrevuelo)

export default router