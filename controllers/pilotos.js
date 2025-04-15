import {pilotoHelper} from '../helpers/pilotos.js';

const httpPilotos = {

  crearPiloto: async (req, res) => {
    try {
      const {nombreCompleto, primerApellido, SegundoApellido, tipoDocumento, identificacion, paisExpedicion, ciudadExpedicion, fechaExpedicion, paisNacimiento, ciudadNacimiento, fechaNacimiento, grupoSanguineo, factorRH, genero, contratopiloto, estadoCivil, ciudadOrigen, direccion, telefonoMovil, fechaExamen, email} = req.body;
      
      const dataPiloto = {
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
        contratopiloto, 
        estadoCivil, 
        ciudadOrigen, 
        direccion, 
        telefonoMovil, 
        fechaExamen, 
        email
      }
      const resultado = await pilotoHelper.guardarPiloto({ dataPiloto });
  
      res.status(200).json({
        mensaje: 'piloto guardada correctamente',
        idPiloto: resultado.idPiloto,
        piloto:{
          idPiloto: resultado.idPiloto,
          nombreCompleto: resultado.nombreCompleto,
          primerApellido: resultado.primerApellido,
          SegundoApellido: resultado.SegundoApellido,
          tipoDocumento: resultado.tipoDocumento,
          identificacion: resultado.identificacion,
          paisExpedicion: resultado.paisExpedicion,
          ciudadExpedicion: resultado.ciudadExpedicion,
          fechaExpedicion: resultado.fechaExpedicion,
          paisNacimiento: resultado.paisNacimiento,
          ciudadNacimiento: resultado.ciudadNacimiento,
          fechaNacimiento: resultado.fechaNacimiento,
          grupoSanguineo: resultado.grupoSanguineo,
          factorRH: resultado.factorRH,
          genero: resultado.genero,
          contratopiloto: resultado.contratopiloto,
          estadoCivil: resultado.estadoCivil,
          ciudadOrigen: resultado.ciudadOrigen,
          direccion: resultado.direccion,
          telefonoMovil: resultado.telefonoMovil,
          fechaExamen: resultado.fechaExamen,
          email: resultado.email
        }

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
