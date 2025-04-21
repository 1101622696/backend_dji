import {dronHelper} from '../helpers/drones.js';

const httpDrones = {

crearDron: async (req, res) => {
  try {
    const { numeroSerie, marca, modelo, peso, dimensiones, alturaMaxima, velocidadMaxima, fechaCompra, capacidadBateria, ubicaciondron, contratodron, tipoCamarasSensores, fechapoliza } = req.body;
    const resultado = await dronHelper.guardarDron({ numeroSerie, marca, modelo, peso, dimensiones, alturaMaxima, velocidadMaxima, fechaCompra, capacidadBateria, ubicaciondron, contratodron, tipoCamarasSensores, fechapoliza });

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
  obtenerDronesActivos: async (req, res) => {
    try {
      const data = await dronHelper.getDronesByStatus('Activo');
      res.json(data);
    } catch (error) {
      console.error('Error al obtener datos:', error);
      res.status(500).json({ mensaje: 'Error al obtener drones activos' });
    }
  },
    obtenerDronporNumeroserie: async (req, res) => {
      try {
        const { numeroserie } = req.params;
        const dron = await dronHelper.getDronByNumeroserie(numeroserie);
    
        if (!dron) {
          return res.status(404).json({ mensaje: 'dron no encontrado' });
        }
    
        res.json(dron);
      } catch (error) {
        console.error('Error al obtener dron:', error);
        res.status(500).json({ mensaje: 'Error al obtener dron' });
      }
    },

  editarDron: async (req, res) => {
    try {
      const { numeroserie } = req.params;
      const nuevosDatos = req.body;
  
      const resultado = await dronHelper.editarDronporNumeroserie(numeroserie, nuevosDatos);
  
      if (!resultado) {
        return res.status(404).json({ mensaje: 'Dron no encontrado' });
      }
  
      res.status(200).json({ mensaje: 'Dron actualizado correctamente' });
    } catch (error) {
      console.error('Error al editar Dron:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  },


  }
export default httpDrones;
