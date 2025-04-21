import {Router} from 'express'
import httpPilotos from '../controllers/pilotos.js'
import {validarJWT} from '../middlewares/validar-jwt.js'

const router=Router()

// router.get("/",[validarJWT],httpPilotos.obtenerPilotos)
// router.get("/",httpPilotos.listarPilotos)
router.get("/",httpPilotos.obtenerPilotos)
router.get("/activos",httpPilotos.obtenerPilotosActivos)
router.get('/obtenerdatospiloto/:identificacion', httpPilotos.obtenerPilotoporIdentificacion);

router.post("/crear",httpPilotos.crearPiloto)
router.put("/editar/:identificacion",httpPilotos.editarPiloto)


export default router