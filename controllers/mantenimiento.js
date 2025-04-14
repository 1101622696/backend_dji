import { mantenimientoHelper } from '../helpers/mantenimiento.js';
 
const httpMantenimiento = {

crearMantenimiento: async (req, res) => {
  try {
    const {idDron, fechaMantenimiento, valor, empresaresponsable, idPiloto, descripcion } = req.body;
    const resultado = await mantenimientoHelper.guardarMantenimiento({idDron, fechaMantenimiento, valor, empresaresponsable, idPiloto, descripcion });

    res.status(200).json({
      mensaje: 'Mantenimiento guardada correctamente',
      CodigoMantenimiento: resultado.CodigoMantenimiento
    });
  } catch (error) {
    console.error('Error al guardar mantenimiento:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
},

obtenerMantenimientos: async (req, res) => {
  try {
    const data = await mantenimientoHelper.getMantenimientos();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener mantenimientos' });
  }
},
}
export default httpMantenimiento;
