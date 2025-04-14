import { prevueloHelper } from '../helpers/prevuelos.js';

const httpPrevuelos = {

crearPrevuelo: async (req, res) => {
  try {
    const { useremail, solicitudesAprobadas, piloto, permiso, fecha, ubicacion, modelodron } = req.body;
    const resultado = await prevueloHelper.guardarPrevuelo({ useremail, solicitudesAprobadas, piloto, permiso, fecha, ubicacion, modelodron });

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
};
export default httpPrevuelos;
