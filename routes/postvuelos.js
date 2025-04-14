import {Router} from 'express'
import httpPostvuelos from '../controllers/postvuelos.js'
import {validarJWT} from '../middlewares/validar-jwt.js'

const router=Router()

router.get("/",[validarJWT],httpPostvuelos.obtenerPostvuelos)
router.post("/crear",[validarJWT],httpPostvuelos.crearPostvuelo)


export default router