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
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/temp')
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now()
    const ext = path.extname(file.originalname)
    cb(null, `cedula_${timestamp}${ext}`)
  }
})

const upload = multer({ 
  storage: storage,
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
