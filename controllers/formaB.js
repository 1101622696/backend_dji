// import DetectorXService from '../services/formaB.js';
import DetectorXService from '../services/formaB2.js';
import { 
  listarPDFsEnDrive, 
  descargarPDFDesdeDrive, 
  subirResultadosFormularioASheets,
  validarCedulaExisteEnSheets
} from '../helpers/formaB.js';
import path from 'path';
import fs from 'fs';

const detectorService = new DetectorXService();

const formularioController = {

  procesarFormularioCompleto: async (req, res) => {
    try {
      const { nombreArchivo } = req.params;
      
      console.log(`PROCESANDO FORMULARIO COMPLETO: ${nombreArchivo}`);
      
      const carpeta = process.env.CARPETA_ARCHIVOS || 'C:\\Users\\dcardenas\\poppler\\Library\\bin';
      const rutaCompleta = path.join(carpeta, nombreArchivo);
      
      if (!fs.existsSync(rutaCompleta)) {
        return res.status(404).json({
          success: false,
          error: `Archivo no encontrado: ${nombreArchivo}`,
          metodo: 'formulario-completo'
        });
      }
      
      if (!nombreArchivo.toLowerCase().endsWith('.pdf')) {
        return res.status(400).json({
          success: false,
          error: 'El archivo debe ser un PDF',
          metodo: 'formulario-completo'
        });
      }
      
      const resultado = await detectorService.procesarFormularioCompleto(rutaCompleta);

      res.json({
        success: true,
        metodo: 'formulario-completo',
        archivo: nombreArchivo,
        data: resultado
      });
      
    } catch (error) {
      console.error('Error en procesamiento completo:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        metodo: 'formulario-completo',
        detalles: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  procesarFormulariosDesdeDrive: async (req, res) => {
    try {
      console.log('INICIANDO PROCESAMIENTO DESDE GOOGLE DRIVE...');
      
      const carpetaDriveId = '1-3NH6W7Kz4Ihtwu_N1iauQK0PhHDO5gy';
      const carpetaLocal = process.env.CARPETA_ARCHIVOS;
      
      console.log('Listando PDFs en Google Drive...');
      const pdfFiles = await listarPDFsEnDrive(carpetaDriveId);
      
      if (pdfFiles.length === 0) {
        return res.json({
          success: true,
          mensaje: 'No se encontraron PDFs en la carpeta de Drive',
          totalArchivos: 0
        });
      }
      
      console.log(`Encontrados ${pdfFiles.length} PDFs en Drive`);
      
      const resultadosCompletos = [];
      let procesados = 0;
      let errores = 0;
      
      for (const pdfFile of pdfFiles) {
  try {
    console.log(`\n--- Procesando: ${pdfFile.name} ---`);
    
    // Extraer cédula del nombre del archivo
    const cedula = pdfFile.name.replace('.pdf', '');
    
    // Validar si ya existe en Sheets
    const yaExiste = await validarCedulaExisteEnSheets(cedula);
    
    if (yaExiste) {
      console.log(`Cédula ${cedula} ya existe en Sheets. Omitiendo...`);
      resultadosCompletos.push({
        archivo: pdfFile.name,
        procesado: false,
        razon: 'Ya existe en Sheets'
      });
      continue; // Saltar al siguiente archivo
    }
    
    const rutaLocal = path.join(carpetaLocal, pdfFile.name);
    await descargarPDFDesdeDrive(pdfFile.id, rutaLocal);
    
    const resultado = await detectorService.procesarFormularioCompleto(rutaLocal);
    
    const resultadoSheets = await subirResultadosFormularioASheets(
      resultado.resultados, 
      pdfFile.name, 
    );
          
          resultadosCompletos.push({
            archivo: pdfFile.name,
            procesado: true,
            totalPreguntas: resultado.resumen.total_preguntas_procesadas,
            subirSheets: resultadoSheets.success
          });
          
          procesados++;
          
          if (fs.existsSync(rutaLocal)) {
            fs.unlinkSync(rutaLocal);
          }
          
        } catch (errorArchivo) {
          console.error(`Error procesando ${pdfFile.name}:`, errorArchivo.message);
          errores++;
          
          resultadosCompletos.push({
            archivo: pdfFile.name,
            procesado: false,
            error: errorArchivo.message
          });
        }
      }
      
      res.json({
        success: true,
        mensaje: 'Procesamiento desde Drive completado',
        resumen: {
          totalArchivos: pdfFiles.length,
          procesadosExitosamente: procesados,
          errores: errores
        },
        detalles: resultadosCompletos
      });
      
    } catch (error) {
      console.error('Error en procesamiento desde Drive:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        metodo: 'procesamiento-drive'
      });
    }
  }
};

export default formularioController;





