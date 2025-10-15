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
  console.log('========== INICIO registrarEquipo ==========');

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

    // ✅ Procesar archivos desde BUFFER (req.files[].buffer)
    if (req.files && req.files.length > 0) {
      console.log(`📸 ${req.files.length} archivo(s) recibido(s)`);

      for (const file of req.files) {
        console.log('📸 Procesando archivo desde buffer...');

        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const nombreArchivo = `cedula_${equipo}_${timestamp}.jpg`;

        // ✅ Subir a Drive desde buffer
        console.log('☁️ Subiendo a Drive...');
        const driveFile = await registroHelper.subirImagenADrive(file.buffer, nombreArchivo);
        driveFiles.push(driveFile);
        console.log('✅ Subido:', driveFile.webViewLink);

        // ✅ Decodificar PDF417 desde buffer
        if (!cedula) {
          try {
            console.log('🔍 Decodificando...');
            textoCompleto = await registroHelper.decodificarPDF417(file.buffer);
            cedula = registroHelper.extraerCedulaDelTexto(textoCompleto);
            console.log('✅ Cédula extraída:', cedula);
          } catch (decodeError) {
            console.warn('⚠️ No se pudo decodificar:', decodeError.message);
          }
        }
      }
    } else {
      console.log('ℹ️ No se envió imagen');
    }

    // Guardar en Sheets
    console.log('💾 Guardando en Sheets...');
    const resultado = await registroHelper.guardarRegistro({
      equipo,
      cedula: cedula || req.body.cedula || '',
      nombre: nombre || '',
      marca: marca || '',
      piso: piso || '',
      observaciones: observaciones || '',
      estado,
      fecharegistro
    });

    res.status(200).json({
      mensaje: 'Equipo registrado correctamente',
      equipo: resultado.equipo,
      cedula: cedula || req.body.cedula || 'No detectada',
      textoCompleto: textoCompleto ? textoCompleto.substring(0, 100) + '...' : 'No procesada',
      imagenesDrive: driveFiles.length > 0 ? driveFiles.map(f => f.webViewLink) : null
    });

  } catch (error) {
    console.error('❌ Error procesando registro:', error);

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
