import {Router} from 'express'
import httpPilotos from '../controllers/pilotos.js'
import {validarJWT} from '../middlewares/validar-jwt.js'
import multer from 'multer';

const router=Router()

const upload = multer({ storage: multer.memoryStorage() });

// router.get("/",[validarJWT],httpPilotos.obtenerPilotos)
// router.get("/",httpPilotos.listarPilotos)
router.get("/",httpPilotos.obtenerPilotos)
router.get("/activos",httpPilotos.obtenerPilotosActivos)
router.get('/obtenerdatospiloto/:identificacion', httpPilotos.obtenerPilotoporIdentificacion);

// router.post("/crear",httpPilotos.crearPiloto)
router.post("/crear", [validarJWT, upload.array('archivos')], httpPilotos.crearPiloto);

router.put("/editar/:identificacion",httpPilotos.editarPiloto)

router.put("/activar/:identificacion",httpPilotos.activarPiloto)
router.put("/desactivar/:identificacion",httpPilotos.desactivarPiloto)


export default router