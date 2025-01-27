import {Router} from 'express'
import httptelemetria from '../controllers/telemetria.js'
import validarApiKey from "../middlewares/validar_api.js";

const router=Router()

router.get("/listar",[validarApiKey],httptelemetria.getelemetria)

export default router
