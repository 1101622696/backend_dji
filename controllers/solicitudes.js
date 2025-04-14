import { solicitudHelper } from '../helpers/solicitudes.js';

const httpSolicitudes = {

crearSolicitud: async (req, res) => {
  try {
    const { ubicacion, proposito } = req.body;
    const resultado = await solicitudHelper.guardarSolicitud({ ubicacion, proposito });

    res.status(200).json({
      mensaje: 'Solicitud guardada correctamente',
      consecutivo: resultado.consecutivo
    });
  } catch (error) {
    console.error('Error al guardar solicitud:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
},

obtenerSolicitudes: async (req, res) => {
  try {
    const data = await solicitudHelper.getSolicitudesVuelo();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes' });
  }
},
}
export default httpSolicitudes;
