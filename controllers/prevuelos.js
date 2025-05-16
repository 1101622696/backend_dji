import { prevueloHelper } from '../helpers/prevuelos.js';

const httpPrevuelos = {

crearPrevuelo: async (req, res) => {
  try {
    const { email, nombre } = req.usuariobdtoken;

    const { consecutivo, item1, item2, item3, item4, item5, item6, item7, item8, item9, item10, item11, item12, item13, item14, item15, item16, item17, item18, item19, item20, item21, item22, notas } = req.body;
  
    const estado = req.body.estado || "Pendiente";
    const fechadeCreacion = new Date().toISOString().split('T')[0];

    const resultado = await prevueloHelper.guardarPrevuelo({  useremail: email, username: nombre, consecutivo, item1, item2, item3, item4, item5, item6, item7, item8, item9, item10, item11, item12, item13, item14, item15, item16, item17, item18, item19, item20, item21, item22, notas, estado, fechadeCreacion });

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

      obtenerprevuelosCantidad: async (req, res) => {
        try {
          const data = await prevueloHelper.getPrevuelos();
          res.json({ 
            cantidad: data.length,
          });
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
obtenerPrevuelosPendientesCantidad: async (req, res) => {
  try {
    const data = await prevueloHelper.getPrevuelosByStatus('Pendiente');
    res.json({ 
      cantidad: data.length,
    });
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener prevuelos pendientes' });
  }
},
verificarPrevueloPendiente: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const EsPendiente = await prevueloHelper.getEsPrevueloPendiente(consecutivo);
    res.json({ EsPendiente });
  } catch (error) {
    console.error('Error al verificar estado del prevuelo:', error);
    res.status(500).json({ mensaje: 'Error al verificar estado del prevuelo' });
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
obtenerPrevuelosAprobadasCantidad: async (req, res) => {
  try {
    const data = await prevueloHelper.getPrevuelosByStatus('aprobado');
    res.json({ 
      cantidad: data.length,
    });
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener prevuelos aprobadas' });
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

obtenerPrevuelosPendientesPorEmail: async (req, res) => {
  try {
    const { email } = req.params; // Obtiene el email desde los parámetros de la URL
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await prevueloHelper.getPrevuelosByEmailAndStatus(email, 'Pendiente');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener prevuelos pendientes por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener prevuelos pendientes por email' });
  }
},

obtenerPrevuelosPendientesPorEmailCantidad: async (req, res) => {
  try {
    const { email } = req.params; // Obtiene el email desde los parámetros de la URL
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await prevueloHelper.getPrevuelosByEmailAndStatus(email, 'Pendiente');
    res.json({ 
      cantidad: data.length,
    });
  } catch (error) {
    console.error('Error al obtener prevuelos pendientes por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener prevuelos pendientes por email' });
  }
},

obtenerPrevuelosAprobadosPorEmail: async (req, res) => {
  try {
    const { email } = req.params; 
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await prevueloHelper.getPrevuelosByEmailAndStatus(email, 'Aprobado');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener prevuelos aprobadas por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener prevuelos aprobadas por email' });
  }
},
obtenerPrevuelosAprobadosPorEmailCantidad: async (req, res) => {
  try {
    const { email } = req.params; 
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await prevueloHelper.getPrevuelosByEmailAndStatus(email, 'Aprobado');
    res.json({ 
      cantidad: data.length,
    });
  } catch (error) {
    console.error('Error al obtener prevuelos aprobadas por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener prevuelos aprobadas por email' });
  }
},


obtenerPrevuelosEnProceso: async (req, res) => {
  try {
    const data = await prevueloHelper.getPrevuelosEnProceso();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener Prevuelos en proceso' });
  }
},

obtenerPrevuelosEnProcesoCantidad: async (req, res) => {
  try {
    const data = await prevueloHelper.getPrevuelosEnProceso();
    res.json({ 
      cantidad: data.length,
    });
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener Prevuelos en proceso' });
  }
},

obtenerPrevuelosEnProcesoPorEmail: async (req, res) => {
  try {
    const { email } = req.params; 
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await prevueloHelper.getprevuelosEnProcesoPorEmail(email);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener prevuelos en proceso por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener prevuelos en proceso por email' });
  }
},

obtenerPrevuelosEnProcesoPorEmailCantidad: async (req, res) => {
  try {
    const { email } = req.params; 
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await prevueloHelper.getprevuelosEnProcesoPorEmail(email);
    res.json({ 
      cantidad: data.length,
    });
  } catch (error) {
    console.error('Error al obtener prevuelos en proceso por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener prevuelos en proceso por email' });
  }
},

obtenerPrevueloPorConsecutivo: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const prevuelo = await prevueloHelper.getPrevueloByConsecutivo(consecutivo);

    if (!prevuelo) {
      return res.status(404).json({ mensaje: 'prevuelo no encontrado' });
    }

    res.json(prevuelo);
  } catch (error) {
    console.error('Error al obtener prevuelo:', error);
    res.status(500).json({ mensaje: 'Error al obtener prevuelo' });
  }
},


obtenerPrevueloConEtapas: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const data = await prevueloHelper.getPrevueloConEtapas(consecutivo);
    
    if (!data) {
      return res.status(404).json({ mensaje: 'Prevuelo no encontrado para esta solicitud' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener prevuelo con etapas' });
  }
},

obtenerTodosPrevuelosConEtapas: async (req, res) => {
  try {
    const data = await prevueloHelper.getPrevuelosConEtapas();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener todos los prevuelos con etapas' });
  }
},

obtenerTodosPrevuelosConEtapasEmail: async (req, res) => {
  try {
    const email = req.params.email || req.query.email || req.body.email;
    
    if (!email) {
      return res.status(400).json({ mensaje: 'Email no proporcionado' });
    }
    
    const data = await prevueloHelper.getPrevuelosConEtapasEmail(email);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener todas los prevuelos con etapas email' });
  }
},

obtenerPrevuelosPorEstado: async (req, res) => {
  try {
    const { estado } = req.params;
    const todosPrevuelos = await prevueloHelper.getPrevuelosConEtapas();
    
    const prevuelosFiltrados = todosPrevuelos.filter(
      prevuelo => prevuelo.estadoProceso === estado
    );
    
    res.json(prevuelosFiltrados);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener prevuelos por estado' });
  }
},

editarPrevuelo: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const nuevosDatos = req.body;
    // console.log(nuevosDatos)
    // const { email, nombre } = req.usuariobdtoken;

    // if (!nuevosDatos.useremail) nuevosDatos.useremail = email;
    // if (!nuevosDatos.username) nuevosDatos.username = nombre;
    
    const resultado = await prevueloHelper.editarPrevueloPorConsecutivo(consecutivo, nuevosDatos);

    if (!resultado) {
      return res.status(404).json({ mensaje: 'Prevuelo no encontrado' });
    }

    res.status(200).json({ mensaje: 'Prevuelo actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar Prevuelo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
},

aprobarestadoPrevuelo: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const { estado = "Aprobado", piloto, permiso, notas  } = req.body; 
    
    await prevueloHelper.actualizarEstadoEnSheets(consecutivo, estado || "Aprobado");

    const resultado = await prevueloHelper.generarValidarPrevuelo(
    consecutivo,
     piloto,
     permiso,
     notas
    );

    res.status(200).json({ 
      mensaje: 'Estado actualizado correctamente',
      codigo: resultado.codigo,
      fechaValidacion: resultado.fechaValidacion
    });
  } catch (error) {
    console.error('Error al editar estado de Prevuelo:', error);
    res.status(500).json({ 
      mensaje: 'Error al actualizar estado', 
      error: error.message 
    });
  }
},

denegarestadoPrevuelo: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const { estado = "Denegado", piloto, permiso, notas } = req.body; 
    
 await prevueloHelper.actualizarEstadoEnSheets(consecutivo, estado || "Denegado");
   
 const resultado = await prevueloHelper.generarValidarPrevuelo(
  consecutivo,
  piloto,
  permiso,
  notas
 )

    res.status(200).json({ mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar estado de Prevuelo:', error);
    res.status(500).json({ 
      mensaje: 'Error al actualizar estado', 
      error: error.message 
    });
  }
},

}

export default httpPrevuelos;
