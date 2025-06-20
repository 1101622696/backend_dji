import { prevueloHelper } from '../helpers/prevuelos.js';

const httpPrevuelos = {

crearPrevuelo: async (req, res) => {
  try {
    const { email, nombre } = req.usuariobdtoken;

    const { consecutivo, item1, item2, item3, item4, item5, item6, item7, item8, item9, item10, item11, item12, item13, item14, item15, item16, item17, item18, item19, item20, item21, item22, notas } = req.body;
  
    const estado = req.body.estado || "Pendiente";
    const fechadeCreacion = new Date().toISOString().split('T')[0];

    const resultado = await prevueloHelper.guardarPrevuelo({  useremail: email, username: nombre, consecutivo, item1, item2, item3, item4, item5, item6, item7, item8, item9, item10, item11, item12, item13, item14, item15, item16, item17, item18, item19, item20, item21, item22, notas, estado, fechadeCreacion });

    res.status(200).json({
      mensaje: 'prevuelo guardado correctamente',
      consecutivoprevuelo: resultado.consecutivoprevuelo
    });
  } catch (error) {
    console.error('Error al guardar prevuelo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
},

editarPrevuelo: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const nuevosDatos = req.body;
    // console.log(nuevosDatos)
    // const { email, nombre } = req.usuariobdtoken;

    // if (!nuevosDatos.useremail) nuevosDatos.useremail = email;
    // if (!nuevosDatos.username) nuevosDatos.username = nombre;
    
    const resultado = await prevueloHelper.editarPrevueloPorConsecutivo(consecutivo, nuevosDatos);

    if (!resultado) {
      return res.status(404).json({ mensaje: 'Prevuelo no encontrado' });
    }

    res.status(200).json({ mensaje: 'Prevuelo actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar Prevuelo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
},

aprobarestadoPrevuelo: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const { estado = "Aprobado", piloto, permiso, notas  } = req.body; 
    
    await prevueloHelper.actualizarEstadoEnSheets(consecutivo, estado || "Aprobado");

    const resultado = await prevueloHelper.generarValidarPrevuelo(
    consecutivo,
     piloto,
     permiso,
     notas
    );

    res.status(200).json({ 
      mensaje: 'Estado actualizado correctamente',
      codigo: resultado.codigo,
      fechaValidacion: resultado.fechaValidacion
    });
  } catch (error) {
    console.error('Error al editar estado de Prevuelo:', error);
    res.status(500).json({ 
      mensaje: 'Error al actualizar estado', 
      error: error.message 
    });
  }
},

denegarestadoPrevuelo: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const { estado = "Denegado", piloto, permiso, notas } = req.body; 
    
 await prevueloHelper.actualizarEstadoEnSheets(consecutivo, estado || "Denegado");
   
 const resultado = await prevueloHelper.generarValidarPrevuelo(
  consecutivo,
  piloto,
  permiso,
  notas
 )

    res.status(200).json({ mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar estado de Prevuelo:', error);
    res.status(500).json({ 
      mensaje: 'Error al actualizar estado', 
      error: error.message 
    });
  }
},

obtenerPrevueloPorConsecutivo: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const prevuelo = await prevueloHelper.getPrevueloByConsecutivo(consecutivo);

    if (!prevuelo) {
      return res.status(404).json({ mensaje: 'prevuelo no encontrado' });
    }

    res.json(prevuelo);
  } catch (error) {
    console.error('Error al obtener prevuelo:', error);
    res.status(500).json({ mensaje: 'Error al obtener prevuelo' });
  }
},

}

export default httpPrevuelos;
