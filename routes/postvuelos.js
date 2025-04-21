import {Router} from 'express'
import httpPostvuelos from '../controllers/postvuelos.js'
import {validarJWT} from '../middlewares/validar-jwt.js'

const router=Router()

// router.get("/",[validarJWT],httpPostvuelos.obtenerPostvuelos)
router.get("/",httpPostvuelos.obtenerPostvuelos)
router.get("/pendientes",httpPostvuelos.obtenerPostvuelosPendientes)
router.get("/aprobadas",httpPostvuelos.obtenerPostvuelosAprobadas)
router.get("/enproceso",httpPostvuelos.obtenerPostvuelosEnproceso)
router.get('/email/:email', httpPostvuelos.obtenerPostvuelosPorEmail);
router.get('/filtrar-completo', httpPostvuelos.obtenerPostvuelosPorEmailYEstado);
router.get('/obtenerdatospostvuelo/:consecutivo', httpPostvuelos.obtenerPostvueloPorConsecutivo);

router.post("/crear",httpPostvuelos.crearPostvuelo)
router.put("/editar/:consecutivo",httpPostvuelos.editarPostvuelo)


export default router