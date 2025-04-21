import {Router} from 'express'
import httpDrones from '../controllers/drones.js'
import {validarJWT} from '../middlewares/validar-jwt.js'
import multer from 'multer';

const router=Router()

const upload = multer({ storage: multer.memoryStorage() });

// router.get("/",[validarJWT],httpDrones.obtenerdron)
router.get("/",httpDrones.obtenerdron)
router.get("/activos",httpDrones.obtenerDronesActivos)
router.get('/obtenerdatosdron/:numeroserie', httpDrones.obtenerDronporNumeroserie);

// router.post("/crear",httpDrones.crearDron)
router.post("/crear", [validarJWT, upload.array('archivos')], httpDrones.crearDron);


router.put("/editar/:numeroserie",httpDrones.editarDron)


export default router