import {Router} from 'express'
import httpDrones from '../controllers/drones.js'
import {validarJWT} from '../middlewares/validar-jwt.js'
import multer from 'multer';

const router=Router()

const upload = multer({ storage: multer.memoryStorage() });

// router.get("/",[validarJWT],httpDrones.obtenerdron)
router.get("/",[validarJWT],httpDrones.obtenerdron)
router.get("/activos",[validarJWT],httpDrones.obtenerDronesActivos)
router.get("/activosnoOcupados",[validarJWT],httpDrones.obtenerDronesActivosyNoOcupados)
router.get('/obtenerdatosdron/:numeroserie',[validarJWT], httpDrones.obtenerDronporNumeroserie);

// router.post("/crear",httpDrones.crearDron)
router.post("/crear", [validarJWT, upload.array('archivos')], httpDrones.crearDron);

router.put("/editar/:numeroserie",[validarJWT, upload.array('archivos')], httpDrones.editarDron)

router.put("/activar/:numeroserie",[validarJWT],httpDrones.activarDron)
router.put("/desactivar/:numeroserie",[validarJWT],httpDrones.desactivarDron)

export default router