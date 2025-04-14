import {Router} from 'express'
import httpSolicitudes from '../controllers/solicitudes.js'
import {validarJWT} from '../middlewares/validar-jwt.js'

const router=Router()

router.get("/",[validarJWT],httpSolicitudes.obtenerSolicitudes)

router.post("/crear",[validarJWT],httpSolicitudes.crearSolicitud)


export default router