import {postvueloHelper} from '../helpers/postvuelos.js';

const httpPostvuelos = {

crearPostvuelo: async (req, res) => {
  try {
    const { horaInicio, horaFin, distanciaRecorrida, alturaMaxima, incidentes, propositoAlcanzado, observacionesVuelo } = req.body;
    const resultado = await postvueloHelper.guardarPostvuelo({ horaInicio, horaFin, distanciaRecorrida, alturaMaxima, incidentes, propositoAlcanzado, observacionesVuelo });

    res.status(200).json({
      mensaje: 'Postvuelo guardado correctamente',
      idPostvuelo: resultado.idPostvuelo
    });
  } catch (error) {
    console.error('Error al guardar Postvuelo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
},

obtenerPostvuelos: async (req, res) => {
  try {
    const data = await postvueloHelper.getPostvuelos();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener postvuelos' });
  }
},
}
export default httpPostvuelos;
