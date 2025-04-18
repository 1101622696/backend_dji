import {Router} from 'express'
import httpDrones from '../controllers/drones.js'
import {validarJWT} from '../middlewares/validar-jwt.js'

const router=Router()

// router.get("/",[validarJWT],httpDrones.obtenerdron)
router.get("/",httpDrones.obtenerdron)
router.get("/activos",httpDrones.obtenerDronesActivos)


router.post("/crear",httpDrones.crearDron)


export default router