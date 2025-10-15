import { registroHelper } from '../helpers/registro.js';

const httpRegistros = {

// registrarEquipo: async (req, res) => {
//   try {    
//     const {equipo, cedula, nombre, marca, piso, observaciones  } = req.body;

//     const estado = req.body.estado || "1";
//     const fecharegistro = new Date().toISOString().split('T')[0];

//     const resultado = await registroHelper.guardarRegistro({  equipo, cedula, nombre, marca, piso, observaciones, estado, fecharegistro });
  
//     equipo = resultado.equipo;

//     res.status(200).json({ 
//       mensaje: 'Equipo registrado correctamente', 
//       equipo: resultado.equipo, 
//     });
  

// } catch (error) { 
//   console.error('Error al registrar:', error); 
//   res.status(500).json({ mensaje: 'Error interno del servidor' }); 
// } 
// },

registrarEquipo: async (req, res) => {
  let tempFilePaths = [];

  try {
    const { equipo, nombre, marca, piso, observaciones } = req.body;
    const estado = req.body.estado || "1";
    const fecharegistro = new Date().toISOString().split('T')[0];

    if (!equipo) {
      return res.status(400).json({ mensaje: 'El código del equipo es obligatorio' });
    }

    let cedula = req.body.cedula || null;
    let textoCompleto = null;
    let driveFiles = [];
    let enlaceDrive = null;

    // ✅ 1. Verificar si hay archivos subidos
    if (req.files && req.files.length > 0) {
      console.log(`${req.files.length} archivo(s) recibido(s)`);

      for (const file of req.files) {
        const tempFilePath = file.path;
        tempFilePaths.push(tempFilePath);

        console.log('Procesando archivo:', tempFilePath);

        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const nombreArchivo = `cedula_${equipo}_${timestamp}.jpg`;

        // ✅ 2. Subir imagen a Drive
        console.log('Subiendo imagen a Google Drive...');
        const resultadoDrive = await registroHelper.subirImagenADrive(tempFilePath, nombreArchivo);

        enlaceDrive = resultadoDrive.webViewLink;
        driveFiles.push(resultadoDrive);
        console.log('Imagen subida:', enlaceDrive);

        // ✅ 3. Decodificar PDF417 solo del primer archivo
        if (!cedula) {
          try {
            console.log('Decodificando PDF417...');
            textoCompleto = await registroHelper.decodificarPDF417(tempFilePath);

            console.log('Extrayendo cédula...');
            cedula = registroHelper.extraerCedulaDelTexto(textoCompleto);
            console.log('Cédula extraída:', cedula);
          } catch (decodeError) {
            console.warn('No se pudo decodificar PDF417:', decodeError.message);
          }
        }
      }

      // ✅ 4. Eliminar archivos temporales
      for (const tempPath of tempFilePaths) {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
          console.log('Archivo temporal eliminado:', tempPath);
        }
      }

    } else {
      console.log('No se envió imagen. Se usará cédula proporcionada manualmente.');
    }

    // ✅ 5. Guardar registro inicial en Sheets
    console.log('Guardando registro en Google Sheets...');
    const fila = await registroHelper.guardarRegistro({
      equipo,
      cedula: '', // se guarda vacío de momento
      nombre,
      marca,
      piso,
      observaciones,
      estado,
      fecharegistro,
      imagen: enlaceDrive,
    });

    // ✅ 6. Si se logró extraer la cédula, actualizar esa fila
    if (cedula) {
      console.log(`Actualizando cédula en la fila ${fila}...`);
      await registroHelper.actualizarCedulaEnFila(fila, cedula);
    }

    // ✅ 7. Respuesta final
    res.status(200).json({
      mensaje: 'Equipo registrado correctamente',
      equipo,
      fila,
      cedula: cedula || req.body.cedula || 'No detectada',
      textoCompleto: textoCompleto || 'No se procesó imagen',
      imagenesDrive: driveFiles.map(f => f.webViewLink),
    });

  } catch (error) {
    console.error('Error procesando registro:', error);

    // Limpiar archivos temporales en caso de error
    for (const tempPath of tempFilePaths) {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }

    res.status(500).json({
      mensaje: 'Error procesando el registro',
      error: error.message
    });
  }
},

obtenerDatosPorequipo: async (req, res) => {
  try {
    const { equipo } = req.params;
    const registro = await registroHelper.getRegistroByEquipo(equipo);

    if (!registro) {
      return res.status(404).json({ mensaje: 'registro no encontrada' });
    }

    res.json(registro);
  } catch (error) {
    console.error('Error al obtener registro:', error);
    res.status(500).json({ mensaje: 'Error al obtener registro' });
  }
},

obtenerEquipos: async (req, res) => {
  try {

    const resumen = await registroHelper.obtenerRegistrosPC();
    
    res.json({
      ok: true,
      resumen,
      mensaje: 'equipo obtenido exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener resumen general:', error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error interno del servidor',
      error: error.message
    });
  }
},

editarRegistro: async (req, res) => {
  try {
    const { equipo } = req.params;
    const nuevosDatos = req.body;
    
    const resultado = await registroHelper.editarPorEquipo(equipo, nuevosDatos);

    if (!resultado) {
      return res.status(404).json({ mensaje: 'equipo no encontrado' });
    }

    res.status(200).json({ mensaje: 'equipo actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar equipo:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
},

enOficina: async (req, res) => {
  try {
    const { equipo } = req.params;
    const { estado = "1" } = req.body;
    
    await registroHelper.actualizarEstadoEnSheets(equipo, estado);
    
    res.status(200).json({ 
      mensaje: 'Euipo en Oficina',
    });
  } catch (error) {
    console.error('Error al modificar el equipo:', error);
    res.status(500).json({ 
      mensaje: 'Error al modificar el estado del equipo', 
      error: error.message 
    });
  }
},

afueradeOficina: async (req, res) => {
  try {
    const { equipo } = req.params;
    const { estado = "2" } = req.body;
    
    await registroHelper.actualizarEstadoEnSheets(equipo, estado);
    
    res.status(200).json({ 
      mensaje: 'Euipo afuera de Oficina',
    });
  } catch (error) {
    console.error('Error al modificar el estado del equipo:', error);
    res.status(500).json({ 
      mensaje: 'Error al modificar el estado del equipo', 
      error: error.message 
    });
  }
},


}
export default httpRegistros;
