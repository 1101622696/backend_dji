import { solicitudHelper } from '../helpers/solicitudes.js';
import { firebaseHelper } from '../helpers/firebase.js';

const httpSolicitudes = {

crearSolicitud: async (req, res) => {
  try {
    // console.log("Usuario token:", req.usuariobdtoken);
    
    const { email, nombre } = req.usuariobdtoken;
    const {tipodeoperacionaerea, fecha_inicio, hora_inicio, pilotoarealizarvuelo, fecha_fin, hora_fin, empresa, peso_maximo, detalles_cronograma, departamento, municipio, tipodecontactovisualconlaua, vueloespecial, justificacionvueloespecial, poligononombre, altura_poligono, latitud_poligono_1, longitud_poligono_1, latitud_poligono_2, longitud_poligono_2, latitud_poligono_3, longitud_poligono_3, latitud_poligono_4, longitud_poligono_4, latitud_poligono_5, longitud_poligono_5, tramolinealnombre, altura_tramo, latitud_tramo_1, longitud_tramo_1, latitud_tramo_2, longitud_tramo_2, latitud_tramo_3, longitud_tramo_3, latitud_tramo_4, longitud_tramo_4, latitud_tramo_5, longitud_tramo_5, circuferenciaencoordenadayradionombre, altura_circunferencia, latitud_circunferencia_1, longitud_circunferencia_1, check_kmz, realizado  } = req.body;

    const estado = req.body.estado || "Pendiente";
    const fechadeCreacion = new Date().toISOString().split('T')[0];
    
    const includeUserDetails = pilotoarealizarvuelo === 'Si';

    const userEmailFirst = includeUserDetails ? email : null;
    const usernameFirst = includeUserDetails ? nombre : null;
   
    let Link = null;
    let consecutivo;

    if (req.files && req.files.length > 0) {
      consecutivo = await solicitudHelper.getSiguienteConsecutivo();
      Link = await solicitudHelper.procesarArchivos(req.files, consecutivo);

    const resultado = await solicitudHelper.guardarSolicitud({  useremail: userEmailFirst, username: usernameFirst, tipodeoperacionaerea, fecha_inicio, hora_inicio, fecha_fin, hora_fin, empresa, peso_maximo, detalles_cronograma, departamento, municipio, tipodecontactovisualconlaua, vueloespecial, justificacionvueloespecial, poligononombre, altura_poligono, latitud_poligono_1, longitud_poligono_1, latitud_poligono_2, longitud_poligono_2, latitud_poligono_3, longitud_poligono_3, latitud_poligono_4, longitud_poligono_4, latitud_poligono_5, longitud_poligono_5, tramolinealnombre, altura_tramo, latitud_tramo_1, longitud_tramo_1, latitud_tramo_2, longitud_tramo_2, latitud_tramo_3, longitud_tramo_3, latitud_tramo_4, longitud_tramo_4, latitud_tramo_5, longitud_tramo_5, circuferenciaencoordenadayradionombre, altura_circunferencia, latitud_circunferencia_1, longitud_circunferencia_1, check_kmz, Link, estado, fechadeCreacion, realizado, username_final: nombre, useremail_final: email });
  
    consecutivo = resultado.consecutivo;

    res.status(200).json({ 
      mensaje: 'Solicitud guardada correctamente', 
      consecutivo: resultado.consecutivo, 
    });
  } else {
    const resultado = await solicitudHelper.guardarSolicitud({ 
      useremail: userEmailFirst,
      username: usernameFirst,
      tipodeoperacionaerea, 
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
      justificacionvueloespecial, 
      poligononombre, 
      altura_poligono, 
      latitud_poligono_1, 
      longitud_poligono_1, 
      latitud_poligono_2, 
      longitud_poligono_2, 
      latitud_poligono_3, 
      longitud_poligono_3, 
      latitud_poligono_4, 
      longitud_poligono_4, 
      latitud_poligono_5, 
      longitud_poligono_5, 
      tramolinealnombre, 
      altura_tramo, 
      latitud_tramo_1, 
      longitud_tramo_1, 
      latitud_tramo_2, 
      longitud_tramo_2, 
      latitud_tramo_3, 
      longitud_tramo_3, 
      latitud_tramo_4, 
      longitud_tramo_4, 
      latitud_tramo_5, 
      longitud_tramo_5, 
      circuferenciaencoordenadayradionombre, 
      altura_circunferencia, 
      latitud_circunferencia_1, 
      longitud_circunferencia_1, 
      check_kmz,        
      Link: null,
      estado,
      fechadeCreacion,
      realizado,
      username_final: nombre, 
      useremail_final: email 
    });
    
    consecutivo = resultado.consecutivo;
    
    res.status(200).json({ 
      mensaje: 'Solicitud guardada correctamente', 
      consecutivo: resultado.consecutivo, 
    });
  }

   await firebaseHelper.enviarNotificacion(
      "apinto@sevicol.com.co", // Email fijo del destinatario
      "Nueva solicitud de vuelo registrada",
      `${nombre} ha registrado una solicitud de vuelo #${consecutivo}`,
      { 
        tipo: "registro_solicitud", 
        consecutivo: consecutivo 
      }
    );

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
obtenerSolicitudesCantidad: async (req, res) => {
  try {
    const data = await solicitudHelper.getSolicitudesVuelo();
    res.json({ 
      cantidad: data.length,
    });
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes' });
  }
},
obtenerSolicitudesPorCliente: async (req, res) => {
  try {
    const { cliente } = req.params;
    const data = await solicitudHelper.getSolicitudesByCliente(cliente);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes por cliente' });
  }
},
obtenerSolicitudesPendientes: async (req, res) => {
  try {
    const data = await solicitudHelper.getSolicitudesByStatus('Pendiente');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes pendientes' });
  }
},
obtenerSolicitudesPendientesCantidad: async (req, res) => {
  try {
    const data = await solicitudHelper.getSolicitudesByStatus('Pendiente');
    res.json({ 
      cantidad: data.length,
    });
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes pendientes' });
  }
},
verificarSolicitudPendiente: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const EsPendiente = await solicitudHelper.getEssolicitudPendiente(consecutivo);
    res.json({ EsPendiente });
  } catch (error) {
    console.error('Error al verificar estado de solicitud:', error);
    res.status(500).json({ mensaje: 'Error al verificar estado de solicitud' });
  }
},
obtenerSolicitudesAprobadas: async (req, res) => {
  try {
    const data = await solicitudHelper.getSolicitudesByStatus('aprobado');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes aprobadas' });
  }
},
obtenerSolicitudesAprobadasCantidad: async (req, res) => {
  try {
    const data = await solicitudHelper.getSolicitudesByStatus('aprobado');
    res.json({ 
      cantidad: data.length,
    });
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes aprobadas' });
  }
},

obtenerSolicitudesCanceladas: async (req, res) => {
  try {
    const data = await solicitudHelper.getSolicitudesByStatus('Cancelado');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes canceladas' });
  }
},

obtenerSolicitudesPorEmail: async (req, res) => {
  try {
    const { email } = req.params; // Obtiene el email desde los parámetros de la URL
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await solicitudHelper.getSolicitudesByEmail(email);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes por email' });
  }
},

obtenerSolicitudesPorUltimoEmail: async (req, res) => {
  try {
    const { email } = req.params; // Obtiene el email desde los parámetros de la URL
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await solicitudHelper.getSolicitudesByLastEmail(email);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes por email' });
  }
},

obtenerSolicitudesPorEmailYEstado: async (req, res) => {
  try {
    const { email, estado } = req.query;
    
    if (!email || !estado) {
      return res.status(400).json({ 
        mensaje: 'El email y el estado son requeridos' 
      });
    }
    
    const data = await solicitudHelper.getSolicitudesByEmailAndStatus(email, estado);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos filtrados:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes filtradas' });
  }
},
obtenerSolicitudesPendientesPorEmail: async (req, res) => {
  try {
    const { email } = req.params; // Obtiene el email desde los parámetros de la URL
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await solicitudHelper.getSolicitudesByEmailAndStatus(email, 'Pendiente');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes pendientes por email' });
  }
},

obtenerSolicitudesPendientesPorEmailCantidad: async (req, res) => {
  try {
    const { email } = req.params; // Obtiene el email desde los parámetros de la URL
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await solicitudHelper.getSolicitudesByEmailAndStatus(email, 'Pendiente');
    res.json({ 
      cantidad: data.length,
    });
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes pendientes por email' });
  }
},

obtenerSolicitudesAprobadasPorEmail: async (req, res) => {
  try {
    const { email } = req.params; // Obtiene el email desde los parámetros de la URL
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await solicitudHelper.getSolicitudesByEmailAndStatus(email, 'Aprobado');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener solicitudes aprobadas por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes aprobadas por email' });
  }
},

obtenerSolicitudesAprobadasPorEmailCantidad: async (req, res) => {
  try {
    const { email } = req.params; // Obtiene el email desde los parámetros de la URL
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await solicitudHelper.getSolicitudesByEmailAndStatus(email, 'Aprobado');
    res.json({ 
      cantidad: data.length,
    });
  } catch (error) {
    console.error('Error al obtener solicitudes aprobadas por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes aprobadas por email' });
  }
},

obtenerSolicitudesEnProceso: async (req, res) => {
  try {
    const data = await solicitudHelper.getSolicitudesEnProceso();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes en proceso' });
  }
},

obtenerSolicitudesEnProcesoCantidad: async (req, res) => {
  try {
    const data = await solicitudHelper.getSolicitudesEnProceso();
    res.json({ 
      cantidad: data.length,
    });
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes en proceso' });
  }
},

obtenerSolicitudesEnProcesoPorEmail: async (req, res) => {
  try {
    const { email } = req.params; 
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await solicitudHelper.getSolicitudesEnProcesoPorEmail(email);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener solicitudes en proceso por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes en proceso por email' });
  }
},

obtenerSolicitudesCanceladasPorEmail: async (req, res) => {
  try {
    const { email } = req.params; // Obtiene el email desde los parámetros de la URL
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await solicitudHelper.getSolicitudesByEmailAndStatus(email, 'Cancelado');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener solicitudes canceladas por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes canceladas por email' });
  }
},

obtenerSolicitudesEnProcesoPorEmailCantidad: async (req, res) => {
  try {
    const { email } = req.params; 
    
    if (!email) {
      return res.status(400).json({ mensaje: 'El email es requerido' });
    }
    
    const data = await solicitudHelper.getSolicitudesEnProcesoPorEmail(email);
    res.json({ 
      cantidad: data.length,
    });
  } catch (error) {
    console.error('Error al obtener solicitudes en proceso por email:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes en proceso por email' });
  }
},

obtenerSolicitudPorConsecutivo: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const solicitud = await solicitudHelper.getSolicitudesByConsecutivo(consecutivo);

    if (!solicitud) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    }

    res.json(solicitud);
  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitud' });
  }
},

obtenerSolicitudConEtapas: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const data = await solicitudHelper.getSolicitudConEtapas(consecutivo);
    
    if (!data) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitud con etapas' });
  }
},

obtenerTodasSolicitudesConEtapas: async (req, res) => {
  try {
    const data = await solicitudHelper.getAllSolicitudesConEtapas();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener todas las solicitudes con etapas' });
  }
},

obtenerTodasSolicitudesConEtapasEmail: async (req, res) => {
  try {
    // Obtener el email del parámetro de la URL o del cuerpo de la solicitud
    const email = req.params.email || req.query.email || req.body.email;
    
    if (!email) {
      return res.status(400).json({ mensaje: 'Email no proporcionado' });
    }
    
    const data = await solicitudHelper.getAllSolicitudesConEtapasEmail(email);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener todas las solicitudes con etapas email' });
  }
},

obtenerSolicitudesPorEstadoProceso: async (req, res) => {
  try {
    const { estado } = req.params;
    const todasSolicitudes = await solicitudHelper.getAllSolicitudesConEtapas();
    
    const solicitudesFiltradas = todasSolicitudes.filter(
      solicitud => solicitud.estadoProceso === estado
    );
    
    res.json(solicitudesFiltradas);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes por estado de proceso' });
  }
},

editarSolicitud: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const nuevosDatos = req.body;
    const { email, nombre } = req.usuariobdtoken;
    
    // Procesar archivos si se han enviado
    if (req.files && req.files.length > 0) {
      // Procesará los archivos reutilizando la carpeta si existe
      const Link = await solicitudHelper.procesarArchivos(req.files, consecutivo);
      nuevosDatos.Link = Link;
    }

    // Añadir datos del usuario token si no están en los datos nuevos
    if (!nuevosDatos.useremail) nuevosDatos.useremail = email;
    if (!nuevosDatos.username) nuevosDatos.username = nombre;
    
    const resultado = await solicitudHelper.editarSolicitudPorConsecutivo(consecutivo, nuevosDatos);

    if (!resultado) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    }

    res.status(200).json({ mensaje: 'Solicitud actualizada correctamente' });
  } catch (error) {
    console.error('Error al editar solicitud:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
},

aprobarestadoSolicitud: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const { estado = "Aprobado", numeroserie, piloto, notas } = req.body;
    
    await solicitudHelper.putSolicitudByStatus(consecutivo, estado);
    
    const resultado = await solicitudHelper.generarValidacionPrevuelo(
      consecutivo,
      numeroserie,
      piloto,
      notas
    );

    res.status(200).json({ 
      mensaje: 'Solicitud aprobada correctamente',
      codigo: resultado.codigo,
      fechaValidacion: resultado.fechaValidacion
    });
  } catch (error) {
    console.error('Error al aprobar solicitud:', error);
    res.status(500).json({ 
      mensaje: 'Error al aprobar solicitud', 
      error: error.message 
    });
  }
},

denegarestadoSolicitud: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const { estado = "Denegado", numeroserie, piloto, notas  } = req.body; 
    
     await solicitudHelper.putSolicitudByStatus(consecutivo, estado || "Denegado");

     const resultado = await solicitudHelper.generarValidacionPrevuelo(
      consecutivo,
      numeroserie,
      piloto,
      notas
     )

    res.status(200).json({ 
      mensaje: 'Estado actualizado correctamente',
      codigo: resultado.codigo,
    });
  } catch (error) {
    console.error('Error al editar estado de solicitud:', error);
    res.status(500).json({ 
      mensaje: 'Error al actualizar estado', 
      error: error.message 
    });
  }
},

cancelarEstadoSolicitud: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const { notas } = req.body; 
    
    await solicitudHelper.putSolicitudByStatus(consecutivo, "Cancelado");

    const resultado = await solicitudHelper.generarCancelacionPrevuelo(consecutivo, notas);

    res.status(200).json({ 
      mensaje: 'Solicitud cancelada correctamente', 
      codigo: resultado.codigo,
      fechaValidacion: resultado.fechaValidacion
    });
  } catch (error) {
    console.error('Error al cancelar solicitud:', error);
    res.status(500).json({ 
      mensaje: 'Error al cancelar la solicitud', 
      error: error.message 
    });
  }
},


}

export default httpSolicitudes;
