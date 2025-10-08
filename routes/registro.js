import {Router} from 'express'
import httpRegistros from '../controllers/registro.js'

const router=Router()

router.get('/obtenerdatos/:equipo', httpRegistros.obtenerDatosPorequipo);

router.get("/obtenerequipos/",httpRegistros.obtenerEquipos)

router.post("/crear", httpRegistros.registrarEquipo);

router.put("/editar/:equipo", httpRegistros.editarRegistro);

router.put("/enOficina/:equipo",httpRegistros.enOficina)
router.put("/afueradeOficina/:equipo",httpRegistros.afueradeOficina)

export default router
