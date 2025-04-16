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
obtenerPostvuelosPendientes: async (req, res) => {
  try {
    const data = await postvueloHelper.getPostvuelosByStatus('Pendiente');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener postvuelos pendientes' });
  }
},
obtenerPostvuelosAprobadas: async (req, res) => {
  try {
    const data = await postvueloHelper.getPostvuelosByStatus('aprobado');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener postvuelos aprobadas' });
  }
},
obtenerPostvuelosEnproceso: async (req, res) => {
  try {
    const data = await postvueloHelper.getPostvuelosByStatus('en proceso');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener postvuelos en proceso' });
  }
},
obtenerPostvuelosPorEmail: async (req, res) => {
  try {
    const { email } = req.params; // Obtiene el email desde los parámetros de la URL
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await postvueloHelper.getPostvuelosByEmail(email);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener postvuelos por email' });
  }
},
obtenerPostvuelosPorEmailYEstado: async (req, res) => {
  try {
    const { email, estado } = req.query;
    
    if (!email || !estado) {
      return res.status(400).json({ 
        mensaje: 'El email y el estado son requeridos' 
      });
    }
    
    const data = await postvueloHelper.getPostvuelosByEmailAndStatus(email, estado);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos filtrados:', error);
    res.status(500).json({ mensaje: 'Error al obtener postvuelos filtradas' });
  }
},
}
export default httpPostvuelos;
