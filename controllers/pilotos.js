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
  }
export default httpPilotos;
