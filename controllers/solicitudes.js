import { solicitudHelper } from '../helpers/solicitudes.js';

const httpSolicitudes = {

crearSolicitud: async (req, res) => {
  try {
    console.log("Usuario token:", req.usuariobdtoken);
    
    // if (!req.usuariobdtoken) {
    //   return res.status(401).json({ mensaje: 'No autorizado: información de usuario no encontrada' });
    // }
    
    // Usar las propiedades correctas según tu estructura
    // const useremail = req.usuariobdtoken.email;
    // const username = req.usuariobdtoken.nombre;
    const { email, nombre } = req.usuariobdtoken;

    const {proposito, fecha_inicio, hora_inicio, fecha_fin, hora_fin, empresa, peso_maximo, detalles_cronograma, departamento, municipio, tipodecontactovisualconlaua, vueloespecial, justificacionvueloespecial, poligononombre, altura_poligono, latitud_poligono_1, longitud_poligono_1, latitud_poligono_2, longitud_poligono_2, latitud_poligono_3, longitud_poligono_3, latitud_poligono_4, longitud_poligono_4, latitud_poligono_5, longitud_poligono_5, tramolinealnombre, altura_tramo, latitud_tramo_1, longitud_tramo_1, latitud_tramo_2, longitud_tramo_2, latitud_tramo_3, longitud_tramo_3, latitud_tramo_4, longitud_tramo_4, latitud_tramo_5, longitud_tramo_5, circuferenciaencoordenadayradionombre, altura_circunferencia, latitud_circunferencia_1, longitud_circunferencia_1, check_kmz, realizado  } = req.body;

    const estado = req.body.estado || "pendiente";
    const fechadeCreacion = new Date().toISOString().split('T')[0];
    
    let Link = null;
    if (req.files && req.files.length > 0) {
      // Primero obtener el consecutivo para usarlo como nombre de la carpeta
      const consecutivo = await getSiguienteConsecutivo();
      Link = await procesarArchivos(req.files, consecutivo);

    const resultado = await solicitudHelper.guardarSolicitud({  useremail, username, proposito, fecha_inicio, hora_inicio, fecha_fin, hora_fin, empresa, peso_maximo, detalles_cronograma, departamento, municipio, tipodecontactovisualconlaua, vueloespecial, justificacionvueloespecial, poligononombre, altura_poligono, latitud_poligono_1, longitud_poligono_1, latitud_poligono_2, longitud_poligono_2, latitud_poligono_3, longitud_poligono_3, latitud_poligono_4, longitud_poligono_4, latitud_poligono_5, longitud_poligono_5, tramolinealnombre, altura_tramo, latitud_tramo_1, longitud_tramo_1, latitud_tramo_2, longitud_tramo_2, latitud_tramo_3, longitud_tramo_3, latitud_tramo_4, longitud_tramo_4, latitud_tramo_5, longitud_tramo_5, circuferenciaencoordenadayradionombre, altura_circunferencia, latitud_circunferencia_1, longitud_circunferencia_1, check_kmz, Link, estado, fechadeCreacion, realizado });
    res.status(200).json({ 
      mensaje: 'Solicitud guardada correctamente', 
      consecutivo: resultado.consecutivo, 
    });
  } else {
    const resultado = await guardarSolicitud({ 
      useremail: email, 
      username: nombre, 
      proposito, 
      fecha_inicio, 
      ...otros,
      Link: null,
      estado,
      fechadeCreacion,
      realizado
    });
    
    res.status(200).json({ 
      mensaje: 'Solicitud guardada correctamente', 
      consecutivo: resultado.consecutivo, 
    });
  }
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
obtenerSolicitudesPendientes: async (req, res) => {
  try {
    const data = await solicitudHelper.getSolicitudesByStatus('Pendiente');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes pendientes' });
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
obtenerSolicitudesEnproceso: async (req, res) => {
  try {
    const data = await solicitudHelper.getSolicitudesByStatus('en proceso');
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener solicitudes en proceso' });
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

editarSolicitud: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const nuevosDatos = req.body;

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

}

export default httpSolicitudes;
