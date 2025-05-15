import {Router} from 'express'
import httpMantenimiento from '../controllers/mantenimiento.js'
import {validarJWT} from '../middlewares/validar-jwt.js'
import multer from 'multer';

const router=Router()

const upload = multer({ storage: multer.memoryStorage() });


router.get("/",[validarJWT],httpMantenimiento.obtenerMantenimientos)
router.get("/obtenerdatosmantenimiento/:codigomantenimiento",[validarJWT],httpMantenimiento.obtenerMantenimientoPorCodigo)
// router.get("/ordenados",[validarJWT],httpMantenimiento.obtenerMantenimientosOrdenadosPorValor)
router.get("/valortotal",[validarJWT],httpMantenimiento.obtenerTotalValorMantenimientos)

router.get("/ordenados", [validarJWT], httpMantenimiento.obtenerMantenimientosOrdenados);
router.get("/filtrados", [validarJWT], httpMantenimiento.obtenerMantenimientosFiltrados);


router.post("/crear",[validarJWT, upload.array('archivos')],httpMantenimiento.crearMantenimiento)

router.put("/editar/:codigomantenimiento",[validarJWT, upload.array('archivos')],httpMantenimiento.editarMantenimiento)


export default router