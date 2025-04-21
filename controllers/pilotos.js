import {pilotoHelper} from '../helpers/pilotos.js';

const httpPilotos = {

  crearPiloto: async (req, res) => {
    try {
      const {nombreCompleto, primerApellido, SegundoApellido, tipoDocumento, identificacion, paisExpedicion, ciudadExpedicion, fechaExpedicion, paisNacimiento, ciudadNacimiento, fechaNacimiento, grupoSanguineo, factorRH, genero, contratopiloto, estadoCivil, ciudadOrigen, direccion, telefonoMovil, fechaExamen, email} = req.body;

      const resultado = await pilotoHelper.guardarPiloto({ nombreCompleto, primerApellido, SegundoApellido, tipoDocumento, identificacion, paisExpedicion, ciudadExpedicion, fechaExpedicion, paisNacimiento, ciudadNacimiento, fechaNacimiento, grupoSanguineo, factorRH, genero, contratopiloto, estadoCivil, ciudadOrigen, direccion, telefonoMovil, fechaExamen, email });
  
      res.status(200).json({
        mensaje: 'piloto guardada correctamente',
        idPiloto: resultado.idPiloto,
       
      });
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
  

  }
export default httpPilotos;
