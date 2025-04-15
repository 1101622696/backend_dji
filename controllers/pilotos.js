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
          nombreCompleto: dataPiloto.nombreCompleto,
          primerApellido: dataPiloto.primerApellido,
          SegundoApellido: dataPiloto.SegundoApellido,
          tipoDocumento: dataPiloto.tipoDocumento,
          identificacion: dataPiloto.identificacion,
          paisExpedicion: dataPiloto.paisExpedicion,
          ciudadExpedicion: dataPiloto.ciudadExpedicion,
          fechaExpedicion: dataPiloto.fechaExpedicion,
          paisNacimiento: dataPiloto.paisNacimiento,
          ciudadNacimiento: dataPiloto.ciudadNacimiento,
          fechaNacimiento: dataPiloto.fechaNacimiento,
          grupoSanguineo: dataPiloto.grupoSanguineo,
          factorRH: dataPiloto.factorRH,
          genero: dataPiloto.genero,
          contratopiloto: dataPiloto.contratopiloto,
          estadoCivil: dataPiloto.estadoCivil,
          ciudadOrigen: dataPiloto.ciudadOrigen,
          direccion: dataPiloto.direccion,
          telefonoMovil: dataPiloto.telefonoMovil,
          fechaExamen: dataPiloto.fechaExamen,
          email: dataPiloto.email
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
