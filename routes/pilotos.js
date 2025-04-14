import {Router} from 'express'
import httpPilotos from '../controllers/pilotos.js'
import {validarJWT} from '../middlewares/validar-jwt.js'

const router=Router()

router.get("/",[validarJWT],httpPilotos.obtenerPilotos)
router.post("/crear",[validarJWT],httpPilotos.crearPiloto)
// router.get("/",httpPilotos.listarPilotos)


export default router