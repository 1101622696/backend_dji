import {postvueloHelper} from '../helpers/postvuelos.js';

const httpPostvuelos = {

 crearPostvuelo: async (req, res) => {
  try {
    const { email, nombre } = req.usuariobdtoken;

    const { consecutivo, horaInicio, horaFin, distanciaRecorrida, alturaMaxima, incidentes, propositoAlcanzado, observacionesVuelo } = req.body;
       
    const estado = req.body.estado || "Pendiente";
    const fechadeCreacion = new Date().toISOString().split('T')[0];
  
    let Link = null;
    if (req.files && req.files.length > 0) {
        const consecutivonombre = consecutivo;
        Link = await postvueloHelper.procesarArchivos(req.files, consecutivonombre);
      
    const resultado = await postvueloHelper.guardarPostvuelo({ 
      consecutivo, 
      username: nombre, 
      horaInicio, 
      horaFin, 
      distanciaRecorrida, 
      alturaMaxima, 
      incidentes, 
      propositoAlcanzado, 
      observacionesVuelo, 
      fechadeCreacion, 
      Link, 
      useremail: email, 
      estado 
    });

    res.status(200).json({
      mensaje: 'Postvuelo guardado correctamente',
      idPostvuelo: resultado.idPostvuelo
    });
      } else {
        const resultado = await postvueloHelper.guardarPostvuelo({ 
          consecutivo, 
          username: nombre, 
          horaInicio, 
          horaFin, 
          distanciaRecorrida, 
          alturaMaxima, 
          incidentes, 
          propositoAlcanzado, 
          observacionesVuelo, 
          fechadeCreacion, 
          Link: null, 
          useremail: email, 
          estado, 
        });
        
        res.status(200).json({ 
          mensaje: 'Postvuelo guardado correctamente', 
          consecutivo: resultado.consecutivo, 
        });
      }
  } catch (error) {
    console.error('Error al guardar Postvuelo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
},

editarPostvuelo: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const nuevosDatos = req.body;
    const { email, nombre } = req.usuariobdtoken;

    // console.log('Editando postvuelo:', consecutivo);
    // console.log('Archivos recibidos:', req.files ? req.files.length : 0);

    if (nuevosDatos.horaInicio && nuevosDatos.horaFin) {
      nuevosDatos.duracion = postvueloHelper.calcularDuracion(nuevosDatos.horaInicio, nuevosDatos.horaFin);
    } else if (nuevosDatos.horaInicio || nuevosDatos.horaFin) {
      // Si solo se cambia una de las horas, necesitamos los datos actuales para calcular
      const datosActuales = await postvueloHelper.getPostvueloByConsecutivo(consecutivo);
      
      if (datosActuales) {
        const horaInicio = nuevosDatos.horaInicio || datosActuales.horaInicio;
        const horaFin = nuevosDatos.horaFin || datosActuales.horaFin;
        if (horaInicio && horaFin) {
          nuevosDatos.duracion = postvueloHelper.calcularDuracion(horaInicio, horaFin);
        }
      }
    }

    // Procesar archivos si existen
    if (req.files && req.files.length > 0) {
      // console.log('Procesando archivos para consecutivo:', consecutivo);
      try {
        // Usar el consecutivo del parámetro de la URL para crear/buscar la carpeta
        const Link = await postvueloHelper.procesarArchivos(req.files, consecutivo);
        // console.log('Link de carpeta generado:', Link);
        nuevosDatos.Link = Link;
      } catch (error) {
        console.error('Error al procesar archivos:', error);
        // No fallar la actualización si hay error con archivos
      }
    }
    
    // Añadir datos del usuario token si no están en los datos nuevos
    if (!nuevosDatos.useremail) nuevosDatos.useremail = email;
    if (!nuevosDatos.username) nuevosDatos.username = nombre;
    
    const resultado = await postvueloHelper.editarPostvueloPorConsecutivo(consecutivo, nuevosDatos);

    if (!resultado) {
      return res.status(404).json({ mensaje: 'Postvuelo no encontrado' });
    }

    res.status(200).json({ mensaje: 'Postvuelo actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar Postvuelo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
},

aprobarestadoPostvuelo: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const { estado = "Aprobado", piloto, numeroserie, notas  } = req.body; 
    
    await postvueloHelper.actualizarEstadoEnSheets(consecutivo, estado || "Aprobado");

    const resultado = await postvueloHelper.generarValidacionPostvuelo(
      consecutivo,
      piloto,
      numeroserie,
      notas
    )

    res.status(200).json({ mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar estado de Postvuelo:', error);
    res.status(500).json({ 
      mensaje: 'Error al actualizar estado', 
      error: error.message 
    });
  }
},

denegarestadoPostvuelo: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const { estado = "Denegado", piloto, numeroserie, notas  } = req.body; 
    
   await postvueloHelper.actualizarEstadoEnSheets(consecutivo, estado || "Denegado");

   const resultado = postvueloHelper.generarValidacionPostvuelo(
    consecutivo,
    piloto,
    numeroserie,
    notas
   )

    res.status(200).json({ mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar estado de Postvuelo:', error);
    res.status(500).json({ 
      mensaje: 'Error al actualizar estado', 
      error: error.message 
    });
  }
},

obtenerPostvueloPorConsecutivo: async (req, res) => {
  try {
    const { consecutivo } = req.params;
    const postvuelo = await postvueloHelper.getPostvueloByConsecutivo(consecutivo);

    if (!postvuelo) {
      return res.status(404).json({ mensaje: 'postvuelo no encontrado' });
    }

    res.json(postvuelo);
  } catch (error) {
    console.error('Error al obtener postvuelo:', error);
    res.status(500).json({ mensaje: 'Error al obtener postvuelo' });
  }
},

}
export default httpPostvuelos;