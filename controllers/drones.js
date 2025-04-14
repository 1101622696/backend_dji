import {dronHelper} from '../helpers/drones.js';

const httpDrones = {

crearDron: async (req, res) => {
  try {
    const { numeroSerie, marca, modelo, peso, dimensiones, alturaMaxima } = req.body;
    const resultado = await dronHelper.guardarDron({ numeroSerie, marca, modelo, peso, dimensiones, alturaMaxima });

    res.status(200).json({
      mensaje: 'dron guardado correctamente',
      codigo: resultado.codigo
    });
  } catch (error) {
    console.error('Error al guardar dron:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
},

obtenerdron: async (req, res) => {
  try {
    const data = await dronHelper.getDrones();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener dron' });
  }
},
}

export default httpDrones;
