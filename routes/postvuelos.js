import {Router} from 'express'
import httpPostvuelos from '../controllers/postvuelos.js'
import {validarJWT} from '../middlewares/validar-jwt.js'
import multer from 'multer';

const router=Router()

const upload = multer({ storage: multer.memoryStorage() });

// router.get("/",[validarJWT],httpPostvuelos.obtenerPostvuelos)
router.get("/",httpPostvuelos.obtenerPostvuelos)
router.get("/pendientes",httpPostvuelos.obtenerPostvuelosPendientes)
router.get("/aprobadas",httpPostvuelos.obtenerPostvuelosAprobadas)
router.get("/enproceso",httpPostvuelos.obtenerPostvuelosEnproceso)
router.get('/email/:email', httpPostvuelos.obtenerPostvuelosPorEmail);
router.get('/filtrar-completo', httpPostvuelos.obtenerPostvuelosPorEmailYEstado);
router.get('/obtenerdatospostvuelo/:consecutivo', httpPostvuelos.obtenerPostvueloPorConsecutivo);

// router.post("/crear",httpPostvuelos.crearPostvuelo)
router.post("/crear", [validarJWT, upload.array('archivos')], httpPostvuelos.crearPostvuelo);

router.put("/editar/:consecutivo",httpPostvuelos.editarPostvuelo)


export default router