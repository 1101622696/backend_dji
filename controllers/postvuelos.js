import {postvueloHelper} from '../helpers/postvuelos.js';

const httpPostvuelos = {

crearPostvuelo: async (req, res) => {
  try {
    const { email, nombre } = req.usuariobdtoken;

    const { consecutivo, dronusado, fechaInicio, horaInicio, horaFin, duracion, distanciaRecorrida, alturaMaxima, incidentes, propositoAlcanzado, observacionesVuelo, proposito, empresa } = req.body;
   
    const estado = req.body.estado || "Pendiente";
    const fechadeCreacion = new Date().toISOString().split('T')[0];
  
    let Link = null;
    if (req.files && req.files.length > 0) {
        const consecutivonombre = consecutivo;
        Link = await postvueloHelper.procesarArchivos(req.files, consecutivonombre);
      
    const resultado = await postvueloHelper.guardarPostvuelo({ consecutivo, username: nombre, dronusado, fechaInicio, horaInicio, horaFin, duracion, distanciaRecorrida, alturaMaxima, incidentes, propositoAlcanzado, observacionesVuelo, fechadeCreacion, Link, useremail:email, estado, proposito, empresa  });

    res.status(200).json({
      mensaje: 'Postvuelo guardado correctamente',
      idPostvuelo: resultado.idPostvuelo
    });
      } else {
        const resultado = await postvueloHelper.guardarPostvuelo({ 
          consecutivo, 
          username: nombre, 
          dronusado,
          fechaInicio, 
          horaInicio, 
          horaFin, 
          duracion, 
          distanciaRecorrida, 
          alturaMaxima, 
          incidentes, 
          propositoAlcanzado, 
          observacionesVuelo, 
          fechadeCreacion, 
          Link:null, 
          useremail:email, 
          estado, 
          proposito, 
          empresa
        });
        
        res.status(200).json({ 
          mensaje: 'Postvuelo guardado correctamente', 
          consecutivo: resultado.consecutivo, 
        });
      }
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
obtenerPostvueloPorConsecutivo: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const postvuelo = await postvueloHelper.getPostvueloByConsecutivo(consecutivo);

    if (!postvuelo) {
      return res.status(404).json({ mensaje: 'postvuelo no encontrado' });
    }

    res.json(postvuelo);
  } catch (error) {
    console.error('Error al obtener postvuelo:', error);
    res.status(500).json({ mensaje: 'Error al obtener postvuelo' });
  }
},

editarPostvuelo: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const nuevosDatos = req.body;

    const resultado = await postvueloHelper.editarPostvueloPorConsecutivo(consecutivo, nuevosDatos);

    if (!resultado) {
      return res.status(404).json({ mensaje: 'Postvuelo no encontrado' });
    }

    res.status(200).json({ mensaje: 'Postvuelo actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar Postvuelo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
},

}
export default httpPostvuelos;
