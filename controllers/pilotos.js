import {pilotoHelper} from '../helpers/pilotos.js';

const httpPilotos = {

  crearPiloto: async (req, res) => {
    try {
      const {nombreCompleto, primerApellido, SegundoApellido, tipoDocumento, identificacion, paisExpedicion, ciudadExpedicion, fechaExpedicion, paisNacimiento, ciudadNacimiento, fechaNacimiento, grupoSanguineo, factorRH, genero, estadoCivil, ciudadOrigen, direccion, telefonoMovil, fechaExamen, email, contratopiloto, tiempoacumulado, distanciaacumulada, vuelosrealizados} = req.body;

    const estado = req.body.estado || "Activo";
    const fechadecreacion = new Date().toISOString().split('T')[0];

        let Link = null;
        if (req.files && req.files.length > 0) {
          // Primero obtener la identificacion para usarlo como nombre de la carpeta
          const identificacionnombre = identificacion;
          Link = await pilotoHelper.procesarArchivos(req.files, identificacionnombre);
      
    const resultado = await pilotoHelper.guardarPiloto({ nombreCompleto, primerApellido, SegundoApellido, tipoDocumento, identificacion, paisExpedicion, ciudadExpedicion, fechaExpedicion, paisNacimiento, ciudadNacimiento, fechaNacimiento, grupoSanguineo, factorRH, genero, estadoCivil, ciudadOrigen, direccion, telefonoMovil, fechaExamen, email, contratopiloto, Link, fechadecreacion, tiempoacumulado, distanciaacumulada, vuelosrealizados, estado });
  
      res.status(200).json({
        mensaje: 'piloto guardado  con link correctamente',
        idPiloto: resultado.idPiloto,
       
      });
  } else {
    const resultado = await pilotoHelper.guardarPiloto({ 
      nombreCompleto, 
      primerApellido, 
      SegundoApellido, 
      tipoDocumento, 
      identificacion, 
      paisExpedicion, 
      ciudadExpedicion, 
      fechaExpedicion, 
      paisNacimiento, 
      ciudadNacimiento, 
      fechaNacimiento, 
      grupoSanguineo, 
      factorRH, 
      genero, 
      estadoCivil, 
      ciudadOrigen, 
      direccion, 
      telefonoMovil, 
      fechaExamen, 
      email, 
      contratopiloto, 
      Link:null, 
      fechadecreacion, 
      tiempoacumulado, 
      distanciaacumulada, 
      vuelosrealizados, 
      estado
    });
    
    res.status(200).json({ 
      mensaje: 'Piloto guardado sin archivos correctamente', 
      idPiloto: resultado.idPiloto, 
    });
  }
} catch (error) { 
      console.error('Error al guardar piloto:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  },
  
  obtenerPilotos: async (req, res) => {
    try {
      const data = await pilotoHelper.getPilotos();
      res.json(data);
    } catch (error) {
      console.error('Error al obtener datos:', error);
      res.status(500).json({ mensaje: 'Error al obtener Pilotos' });
    }
  },
  obtenerPilotosActivos: async (req, res) => {
    try {
      const data = await pilotoHelper.getPilotoByStatus('Activo');
      res.json(data);
    } catch (error) {
      console.error('Error al obtener datos:', error);
      res.status(500).json({ mensaje: 'Error al obtener pilotos activos' });
    }
  },
  obtenerPilotoporIdentificacion: async (req, res) => {
    try {
      const { identificacion } = req.params;
      const piloto = await pilotoHelper.getPilotoById(identificacion);
  
      if (!piloto) {
        return res.status(404).json({ mensaje: 'piloto no encontrado' });
      }
  
      res.json(piloto);
    } catch (error) {
      console.error('Error al obtener piloto:', error);
      res.status(500).json({ mensaje: 'Error al obtener piloto' });
    }
  },

  editarPiloto: async (req, res) => {
    try {
      const { identificacion } = req.params;
      const nuevosDatos = req.body;
  
      const resultado = await pilotoHelper.editarPilotoporIdentificacion(identificacion, nuevosDatos);
  
      if (!resultado) {
        return res.status(404).json({ mensaje: 'Piloto no encontrado' });
      }
  
      res.status(200).json({ mensaje: 'Piloto actualizado correctamente' });
    } catch (error) {
      console.error('Error al editar Piloto:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  },
  
activarPiloto: async (req, res) => {
  try {
    const { identificacion } = req.params;
    const { estado } = req.body; // Opcional, puedes obtener el estado del body o usar "aprobado" por defecto
    
    const resultado = await pilotoHelper.actualizarEstadoEnSheets(identificacion, estado || "Activo");

    res.status(200).json({ mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar estado del piloto:', error);
    res.status(500).json({ 
      mensaje: 'Error al actualizar estado', 
      error: error.message 
    });
  }
},

desactivarPiloto: async (req, res) => {
  try {
    const { identificacion } = req.params;
    const { estado } = req.body; // Opcional, puedes obtener el estado del body o usar "aprobado" por defecto
    
    const resultado = await pilotoHelper.actualizarEstadoEnSheets(identificacion, estado || "Inactivo");

    res.status(200).json({ mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar estado del piloto:', error);
    res.status(500).json({ 
      mensaje: 'Error al actualizar estado', 
      error: error.message 
    });
  }
},

  }
export default httpPilotos;
