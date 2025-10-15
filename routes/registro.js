// import {Router} from 'express'
// import httpRegistros from '../controllers/registro.js'
// import multer from 'multer';

// const router=Router()
// const upload = multer({ storage: multer.memoryStorage() });

// router.get('/obtenerdatos/:equipo', httpRegistros.obtenerDatosPorequipo);

// router.get("/obtenerequipos/",httpRegistros.obtenerEquipos)

// router.post("/crear", [upload.array('archivos')], httpRegistros.registrarEquipo);

// router.put("/editar/:equipo", httpRegistros.editarRegistro);

// router.put("/enOficina/:equipo",httpRegistros.enOficina)
// router.put("/afueradeOficina/:equipo",httpRegistros.afueradeOficina)

// export default router

import { Router } from 'express'
import httpRegistros from '../controllers/registro.js'
import multer from 'multer'

const router = Router()

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
})

router.get('/obtenerdatos/:equipo', httpRegistros.obtenerDatosPorequipo)
router.get('/obtenerequipos/', httpRegistros.obtenerEquipos)
router.post('/crear', upload.array('archivos', 5), httpRegistros.registrarEquipo)
router.put('/editar/:equipo', httpRegistros.editarRegistro)
router.put('/enOficina/:equipo', httpRegistros.enOficina)
router.put('/afueradeOficina/:equipo', httpRegistros.afueradeOficina)

export default router
