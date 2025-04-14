import {Router} from 'express'
import httpPostvuelos from '../controllers/postvuelos.js'
import {validarJWT} from '../middlewares/validar-jwt.js'

const router=Router()

router.get("/",[validarJWT],httpPostvuelos.listarPostvuelos)


export default router