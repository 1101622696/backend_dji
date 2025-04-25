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

obtenerPostvuelosCantidad: async (req, res) => {
  try {
    const data = await postvueloHelper.getPostvuelos();
    res.json({ 
      cantidad: data.length,
    });
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

obtenerPostvuelosPendientesCantidad: async (req, res) => {
  try {
    const data = await postvueloHelper.getPostvuelosByStatus('Pendiente');
    res.json({ 
      cantidad: data.length,
    });
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener postvuelos pendientes' });
  }
},
verificarPostvueloPendiente: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const EsPendiente = await postvueloHelper.getEsPostvueloPendiente(consecutivo);
    res.json({ EsPendiente });
  } catch (error) {
    console.error('Error al verificar estado del postvuelo:', error);
    res.status(500).json({ mensaje: 'Error al verificar estado del postvuelo' });
  }
},
obtenerPostvuelosAprobados: async (req, res) => {
  try {
    const data = await postvueloHelper.getPostvuelosByStatus('aprobado');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener postvuelos aprobadas' });
  }
},

obtenerPostvuelosAprobadosCantidad: async (req, res) => {
  try {
    const data = await postvueloHelper.getPostvuelosByStatus('aprobado');
    res.json({ 
      cantidad: data.length,
    });
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
obtenerPostvuelosEnprocesoCantidad: async (req, res) => {
  try {
    const data = await postvueloHelper.getPostvuelosByStatus('en proceso');
    res.json({ 
      cantidad: data.length,
    });
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
obtenerPostvuelosPendientesPorEmail: async (req, res) => {
  try {
    const { email } = req.params; // Obtiene el email desde los parámetros de la URL
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await postvueloHelper.getPostvuelosByEmailAndStatus(email, 'Pendiente');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener postvuelos pendientes por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener postvuelos pendientes por email' });
  }
},

obtenerPostvuelosAprobadosPorEmail: async (req, res) => {
  try {
    const { email } = req.params; // Obtiene el email desde los parámetros de la URL
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await postvueloHelper.getPostvuelosByEmailAndStatus(email, 'Aprobado');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener postvuelos aprobados por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener postvuelos aprobadas por email' });
  }
},

obtenerPostvuelosPendientesPorEmailCantidad: async (req, res) => {
  try {
    const { email } = req.params; // Obtiene el email desde los parámetros de la URL
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await postvueloHelper.getPostvuelosByEmailAndStatus(email, 'Pendiente');
        res.json({ 
      cantidad: data.length,
    });
  } catch (error) {
    console.error('Error al obtener postvuelos pendientes por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener postvuelos pendientes por email' });
  }
},

obtenerPostvuelosAprobadosPorEmailCantidad: async (req, res) => {
  try {
    const { email } = req.params; // Obtiene el email desde los parámetros de la URL
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await postvueloHelper.getPostvuelosByEmailAndStatus(email, 'Aprobado');
        res.json({ 
      cantidad: data.length,
    });
  } catch (error) {
    console.error('Error al obtener postvuelos aprobados por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener postvuelos aprobadas por email' });
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

obtenerPostvueloConEtapas: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const data = await postvueloHelper.getPostvueloConEtapas(consecutivo);
    
    if (!data) {
      return res.status(404).json({ mensaje: 'Postvuelo no encontrado' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener postvuelo con etapas' });
  }
},

obtenerTodosPostvuelosConEtapas: async (req, res) => {
  try {
    const data = await postvueloHelper.getPostvuelosConEtapas();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener todos los postvuelos con etapas' });
  }
},

obtenerPostvuelosPorEstado: async (req, res) => {
  try {
    const { estado } = req.params;
    const todosPostvuelos = await postvueloHelper.getPostvuelosConEtapas();
    
    const postvuelosFiltrados = todosPostvuelos.filter(
      postvuelo => postvuelo.estadoProceso === estado
    );
    
    res.json(postvuelosFiltrados);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener postvuelos por estado' });
  }
},

editarPostvuelo: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const nuevosDatos = req.body;
    const { email, nombre } = req.usuariobdtoken;

        if (req.files && req.files.length > 0) {
          // Procesará los archivos reutilizando la carpeta si existe
          const Link = await postvueloHelper.procesarArchivos(req.files, consecutivo);
          nuevosDatos.Link = Link;
        }
    
    // Añadir datos del usuario token si no están en los datos nuevos
    if (!nuevosDatos.useremail) nuevosDatos.useremail = email;
    if (!nuevosDatos.username) nuevosDatos.username = nombre;
    
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

aprobarestadoPostvuelo: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const { estado } = req.body; // Opcional, puedes obtener el estado del body o usar "aprobado" por defecto
    
    const resultado = await postvueloHelper.actualizarEstadoEnSheets(consecutivo, estado || "Aprobado");

    res.status(200).json({ mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar estado de Postvuelo:', error);
    res.status(500).json({ 
      mensaje: 'Error al actualizar estado', 
      error: error.message 
    });
  }
},

denegarestadoPostvuelo: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const { estado } = req.body; // Opcional, puedes obtener el estado del body o usar "aprobado" por defecto
    
    const resultado = await postvueloHelper.actualizarEstadoEnSheets(consecutivo, estado || "Denegado");

    res.status(200).json({ mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar estado de Postvuelo:', error);
    res.status(500).json({ 
      mensaje: 'Error al actualizar estado', 
      error: error.message 
    });
  }
},

}
export default httpPostvuelos;
