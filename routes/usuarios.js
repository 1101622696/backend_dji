import {Router} from 'express'
import httpUsuarios from '../controllers/usuarios.js'
// import { check } from 'express-validator'
// import { validarCampos } from '../middlewares/validar-campos.js'
// import helpersUsuarios from '../helpers/usuarios.js'
import {validarJWT} from '../middlewares/validar-jwt.js'

const router=Router()

router.get("/",[validarJWT],httpUsuarios.getUsuariosDesdeSheets)
router.get("/activos",[validarJWT],httpUsuarios.obtenerUsuariosActivos)
router.get("/inactivos",[validarJWT],httpUsuarios.obtenerUsuariosInactivos)
router.get("/poremail/:email",[validarJWT],httpUsuarios.obtenerUsuarioporEmail)
router.get("/ujefe",[validarJWT],httpUsuarios.obtenerUsuariosPerfilJefe)
router.get("/ucoordinadores",[validarJWT],httpUsuarios.obtenerUsuariosPerfilCoordinador)
router.get("/upilotos",[validarJWT],httpUsuarios.obtenerUsuariosPerfilPiloto)
router.get("/uclientes",[validarJWT],httpUsuarios.obtenerUsuariosPerfilCliente)

router.get("/filtrados", [validarJWT], httpUsuarios.obtenerUsuariosFiltrados);

router.post("/crear",[validarJWT],httpUsuarios.crearUsuario)

router.put("/editar/:email",[validarJWT],httpUsuarios.editarUsuario)
router.put("/editarpassword/:email",[validarJWT],httpUsuarios.editarPasswordUsuario)
router.put("/activar/:email",[validarJWT],httpUsuarios.activarUsuario)
router.put("/inactivar/:email",[validarJWT],httpUsuarios.desactivarUsuario)

router.post("/login",httpUsuarios.login)


export default router