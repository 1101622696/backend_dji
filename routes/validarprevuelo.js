import {Router} from 'express'
import ValidarPrevuelo from '../controllers/validarprevuelo.js'
import {validarJWT} from '../middlewares/validar-jwt.js'

const router=Router()

router.get("/",[validarJWT],ValidarPrevuelo.listarvalidarPrevuelo)

export default router