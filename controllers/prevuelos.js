import { prevueloHelper } from '../helpers/prevuelos.js';

const httpPrevuelos = {

crearPrevuelo: async (req, res) => {
  try {
    const { item1, item2, item3, item4, item5, item6, item7, item8, item9, item10, item11, item12, item13, item14, item15, item16, item17, item18, item19, item20, item21, item22, notas } = req.body;
    const resultado = await prevueloHelper.guardarPrevuelo({  item1, item2, item3, item4, item5, item6, item7, item8, item9, item10, item11, item12, item13, item14, item15, item16, item17, item18, item19, item20, item21, item22, notas });

    res.status(200).json({
      mensaje: 'prevuelo guardado correctamente',
      consecutivoprevuelo: resultado.consecutivoprevuelo
    });
  } catch (error) {
    console.error('Error al guardar prevuelo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
},

obtenerprevuelos: async (req, res) => {
        try {
          const data = await prevueloHelper.getPrevuelos();
          res.json({ data });
        } catch (error) {
          console.error('Error al obtener datos:', error);
          res.status(500).json({ mensaje: 'Error al obtener prevuelos' });
        }
      },

obtenerPrevuelosPendientes: async (req, res) => {
  try {
    const data = await prevueloHelper.getPrevuelosByStatus('Pendiente');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener prevuelos pendientes' });
  }
},
obtenerPrevuelosAprobadas: async (req, res) => {
  try {
    const data = await prevueloHelper.getPrevuelosByStatus('aprobado');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener prevuelos aprobadas' });
  }
},
obtenerPrevuelosEnproceso: async (req, res) => {
  try {
    const data = await prevueloHelper.getPrevuelosByStatus('en proceso');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener prevuelos en proceso' });
  }
},
obtenerPrevuelosPorEmail: async (req, res) => {
  try {
    const { email } = req.params; // Obtiene el email desde los parámetros de la URL
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await prevueloHelper.getPrevuelosByEmail(email);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener prevuelos por email' });
  }
},
obtenerPrevuelosPorEmailYEstado: async (req, res) => {
  try {
    const { email, estado } = req.query;
    
    if (!email || !estado) {
      return res.status(400).json({ 
        mensaje: 'El email y el estado son requeridos' 
      });
    }
    
    const data = await prevueloHelper.getPrevuelosByEmailAndStatus(email, estado);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos filtrados:', error);
    res.status(500).json({ mensaje: 'Error al obtener prevuelos filtradas' });
  }
},
}

export default httpPrevuelos;
