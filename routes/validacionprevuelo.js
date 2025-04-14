import {Router} from 'express'
import httpValidacionPrevuelo from '../controllers/validacionprevuelo.js'
import {validarJWT} from '../middlewares/validar-jwt.js'

const router=Router()

router.get("/",[validarJWT],httpValidacionPrevuelo.listarvalidacionesprevuelo)


export default router