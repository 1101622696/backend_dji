import {Router} from 'express'
import httpValidarPostvuelo from '../controllers/validarpostvuelo.js'
import {validarJWT} from '../middlewares/validar-jwt.js'

const router=Router()

router.get("/",[validarJWT],httpValidarPostvuelo.listarvalidarPostvuelo)


export default router