import { solicitudHelper } from '../helpers/solicitudes.js';

const httpSolicitudes = {

crearSolicitud: async (req, res) => {
  try {
    const { proposito, fecha_inicio, hora_inicio, fecha_fin, hora_fin, empresa, peso_maximo, detalles_cronograma, departamento, municipio, tipodecontactovisualconlaua, vueloespecial } = req.body;
    const resultado = await solicitudHelper.guardarSolicitud({proposito, fecha_inicio, hora_inicio, fecha_fin, hora_fin, empresa, peso_maximo, detalles_cronograma, departamento, municipio, tipodecontactovisualconlaua, vueloespecial});

    res.status(200).json({
      mensaje: 'Solicitud guardada correctamente',
      consecutivo: resultado.consecutivo,
    });
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
}

export default httpSolicitudes;
