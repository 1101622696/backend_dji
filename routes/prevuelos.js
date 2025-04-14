import {Router} from 'express'
import httpPrevuelos from '../controllers/prevuelos.js'
import {validarJWT} from '../middlewares/validar-jwt.js'

const router=Router()

router.get("/",[validarJWT],httpPrevuelos.obtenerprevuelos)

router.post("/crear",[validarJWT],httpPrevuelos.crearPrevuelo)

export default router