import {pilotoHelper} from '../helpers/pilotos.js';

const httpPilotos = {

  crearPiloto: async (req, res) => {
    try {
      const {nombreCompleto, primerApellido, SegundoApellido, tipoDocumento, identificacion } = req.body;
      const resultado = await pilotoHelper.guardarPiloto({nombreCompleto, primerApellido, SegundoApellido, tipoDocumento, identificacion });
  
      res.status(200).json({
        mensaje: 'piloto guardada correctamente',
        idPiloto: resultado.idPiloto
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
  }
export default httpPilotos;
