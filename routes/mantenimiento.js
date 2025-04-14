import {Router} from 'express'
import httpMantenimiento from '../controllers/mantenimiento.js'
import {validarJWT} from '../middlewares/validar-jwt.js'

const router=Router()

router.get("/",[validarJWT],httpMantenimiento.obtenerMantenimientos)
router.post("/crear",[validarJWT],httpMantenimiento.crearMantenimiento)


export default router