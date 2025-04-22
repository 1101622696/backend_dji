import {Router} from 'express'
import httpPilotos from '../controllers/pilotos.js'
import {validarJWT} from '../middlewares/validar-jwt.js'
import multer from 'multer';

const router=Router()

const upload = multer({ storage: multer.memoryStorage() });

// router.get("/",[validarJWT],httpPilotos.obtenerPilotos)
// router.get("/",httpPilotos.listarPilotos)
router.get("/",[validarJWT],httpPilotos.obtenerPilotos)
router.get("/activos",[validarJWT],httpPilotos.obtenerPilotosActivos)
router.get('/obtenerdatospiloto/:identificacion',[validarJWT], httpPilotos.obtenerPilotoporIdentificacion);

// router.post("/crear",httpPilotos.crearPiloto)
router.post("/crear", [validarJWT, upload.array('archivos')], httpPilotos.crearPiloto);

router.put("/editar/:identificacion",[validarJWT],httpPilotos.editarPiloto)

router.put("/activar/:identificacion",[validarJWT],httpPilotos.activarPiloto)
router.put("/desactivar/:identificacion",[validarJWT],httpPilotos.desactivarPiloto)


export default router