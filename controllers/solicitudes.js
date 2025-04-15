import { solicitudHelper } from '../helpers/solicitudes.js';

const httpSolicitudes = {

crearSolicitud: async (req, res) => {
  try {
    const { proposito, fecha_inicio, hora_inicio, fecha_fin, hora_fin, empresa, peso_maximo, detalles_cronograma, departamento, municipio, tipodecontactovisualconlaua, vueloespecial } = req.body;
    const resultado = await solicitudHelper.guardarSolicitud(proposito, fecha_inicio, hora_inicio, fecha_fin, hora_fin, empresa, peso_maximo, detalles_cronograma, departamento, municipio, tipodecontactovisualconlaua, vueloespecial);

    res.status(200).json({
      mensaje: 'Solicitud guardada correctamente',
      consecutivo: resultado.consecutivo,
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
