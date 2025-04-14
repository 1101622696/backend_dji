import {Router} from 'express'
import httpUsuarios from '../controllers/usuarios.js'
// import { check } from 'express-validator'
// import { validarCampos } from '../middlewares/validar-campos.js'
// import helpersUsuarios from '../helpers/usuarios.js'
import {validarJWT} from '../middlewares/validar-jwt.js'

const router=Router()

router.get("/",[validarJWT],httpUsuarios.getUsuariosDesdeSheets)
router.post("/login",httpUsuarios.login)


export default router