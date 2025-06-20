import {Router} from 'express'
import httpPrevuelos from '../controllers/prevuelos.js'
import {validarJWT} from '../middlewares/validar-jwt.js'

const router=Router()


router.get('/obtenerdatosprevuelo/:consecutivo',[validarJWT], httpPrevuelos.obtenerPrevueloPorConsecutivo);

router.post("/crear",[validarJWT],httpPrevuelos.crearPrevuelo)

router.put("/editar/:consecutivo",[validarJWT],httpPrevuelos.editarPrevuelo)

router.put("/aprobar/:consecutivo",[validarJWT],httpPrevuelos.aprobarestadoPrevuelo)
router.put("/denegar/:consecutivo",[validarJWT],httpPrevuelos.denegarestadoPrevuelo)

export default router