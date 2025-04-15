import { solicitudHelper } from '../helpers/solicitudes.js';

const httpSolicitudes = {

crearSolicitud: async (req, res) => {
  try {
    const { proposito, fecha_inicio, hora_inicio, fecha_fin, hora_fin, empresa, peso_maximo, detalles_cronograma, departamento, municipio, tipodecontactovisualconlaua, vueloespecial } = req.body;
    const dataSolicitud = {
      proposito,
      fecha_inicio,
      hora_inicio,
      fecha_fin,
      hora_fin,
      empresa,
      peso_maximo,
      detalles_cronograma,
      departamento,
      municipio,
      tipodecontactovisualconlaua,
      vueloespecial,
    };
    const resultado = await solicitudHelper.guardarSolicitud(dataSolicitud);

    res.status(200).json({
      mensaje: 'Solicitud guardada correctamente',
      consecutivo: resultado.consecutivo,
      solicitud: {
        consecutivo: resultado.consecutivo,
        proposito: dataSolicitud.proposito,
        fecha_inicio: dataSolicitud.fecha_inicio,
        hora_inicio: dataSolicitud.hora_inicio,
        fecha_fin: dataSolicitud.fecha_fin,
        hora_fin: dataSolicitud.hora_fin,
        empresa: dataSolicitud.empresa,
        peso_maximo: dataSolicitud.peso_maximo,
        detalles_cronograma: dataSolicitud.detalles_cronograma,
        departamento: dataSolicitud.departamento,
        municipio: dataSolicitud.municipio,
        tipodecontactovisualconlaua: dataSolicitud.tipodecontactovisualconlaua,
        vueloespecial: dataSolicitud.vueloespecial,
      }
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
