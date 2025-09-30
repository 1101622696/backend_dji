// FORMA A 
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { exec, execSync } from 'child_process';

const popplerExecutablePath = 'C:\\Users\\Diego Cárdenas\\sevicol\\TIC\\poppler\\Library\\bin';

class ProcesadorFormularioPsicosocial {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.coordenadasFormaB = {
  pagina_6: { 
    preguntas: [
      { num: 1, x: 41, y: 480, w: 588, h: 40 },
      { num: 2, x: 41, y: 523, w: 588, h: 40 },
      { num: 3, x: 41, y: 565, w: 588, h: 40 },
      { num: 4, x: 40, y: 607, w: 588, h: 40 },
      { num: 5, x: 40, y: 649, w: 588, h: 40 },
      { num: 6, x: 40, y: 693, w: 588, h: 40 },
      { num: 7, x: 40, y: 735, w: 588, h: 40 },
      { num: 8, x: 40, y: 778, w: 588, h: 40 },
      { num: 9, x: 39, y: 821, w: 588, h: 40 },
      { num: 10, x: 39, y: 860, w: 588, h: 40 },
      { num: 11, x: 39, y: 903, w: 588, h: 40 }
    ]
  },
  
  pagina_7: { 
    preguntas: [
      { num: 12, x: 55, y: 107, w: 565, h: 40 },
      { num: 13, x: 55, y: 195, w: 565, h: 40 },
      { num: 14, x: 55, y: 235, w: 565, h: 40 },
      { num: 15, x: 55, y: 275, w: 565, h: 40 },
      { num: 16, x: 55, y: 368, w: 565, h: 40 },
      { num: 17, x: 55, y: 407, w: 565, h: 40 },
      { num: 18, x: 55, y: 450, w: 565, h: 40 },
      { num: 19, x: 55, y: 491, w: 565, h: 40 },
      { num: 20, x: 55, y: 530, w: 565, h: 40 },
      { num: 21, x: 55, y: 574, w: 565, h: 40 },
      { num: 22, x: 55, y: 675, w: 565, h: 40 },
      { num: 23, x: 55, y: 715, w: 565, h: 40 },
      { num: 24, x: 55, y: 758, w: 565, h: 40 },
      { num: 25, x: 55, y: 798, w: 565, h: 40 },
      { num: 26, x: 55, y: 840, w: 565, h: 40 },
      { num: 27, x: 55, y: 879, w: 565, h: 40 }
    ]
  },
  
  pagina_8: { 
    preguntas: [
      { num: 28, x: 48, y: 108, w: 580, h: 40 },
      { num: 29, x: 48, y: 144, w: 580, h: 40 },
      { num: 30, x: 48, y: 185, w: 580, h: 40 },
      { num: 31, x: 48, y: 275, w: 580, h: 40 },
      { num: 32, x: 48, y: 316, w: 580, h: 40 },
      { num: 33, x: 48, y: 355, w: 580, h: 40 },
      { num: 34, x: 48, y: 398, w: 580, h: 40 },
      { num: 35, x: 48, y: 440, w: 580, h: 40 },
      { num: 36, x: 48, y: 482, w: 580, h: 40 },
      { num: 37, x: 48, y: 522, w: 580, h: 40 },
      { num: 38, x: 48, y: 564, w: 580, h: 40 },
      { num: 39, x: 48, y: 649, w: 580, h: 40 },
      { num: 40, x: 48, y: 686, w: 580, h: 40 },
      { num: 41, x: 48, y: 729, w: 580, h: 40 },
      { num: 42, x: 48, y: 771, w: 580, h: 40 },
      { num: 43, x: 48, y: 812, w: 580, h: 40 },
      { num: 44, x: 48, y: 854, w: 580, h: 40 },
      { num: 45, x: 48, y: 894, w: 580, h: 40 }
    ]
  },
  
  pagina_9: { 
    preguntas: [
      { num: 46, x: 60, y: 110, w: 565, h: 40 },
      { num: 47, x: 60, y: 150, w: 565, h: 40 },
      { num: 48, x: 60, y: 238, w: 565, h: 40 },
      { num: 49, x: 60, y: 279, w: 565, h: 40 },
      { num: 50, x: 60, y: 318, w: 565, h: 40 },
      { num: 51, x: 60, y: 360, w: 565, h: 40 },
      { num: 52, x: 60, y: 400, w: 565, h: 40 },
      { num: 53, x: 60, y: 487, w: 565, h: 40 },
      { num: 54, x: 60, y: 525, w: 565, h: 40 },
      { num: 55, x: 60, y: 568, w: 565, h: 40 },
      { num: 56, x: 60, y: 610, w: 565, h: 40 }, 
      { num: 57, x: 60, y: 650, w: 565, h: 40 },
      { num: 58, x: 60, y: 690, w: 565, h: 40 },
      { num: 59, x: 60, y: 730, w: 565, h: 40 },
      { num: 60, x: 60, y: 830, w: 565, h: 40 },
      { num: 61, x: 60, y: 872, w: 565, h: 40 }
    ]
  },
  
  pagina_10: {
    preguntas: [
      { num: 62, x: 55, y: 104, w: 561, h: 40 },
      { num: 63, x: 55, y: 190, w: 561, h: 40 },
      { num: 64, x: 55, y: 230, w: 561, h: 40 },
      { num: 65, x: 55, y: 270, w: 561, h: 40 },
      { num: 66, x: 55, y: 310, w: 561, h: 40 },
      { num: 67, x: 55, y: 353, w: 561, h: 40 },
      { num: 68, x: 55, y: 396, w: 561, h: 40 },
      { num: 69, x: 55, y: 435, w: 561, h: 40 },
      { num: 70, x: 55, y: 478, w: 561, h: 40 },
      { num: 71, x: 55, y: 519, w: 561, h: 40 },
      { num: 72, x: 55, y: 558, w: 561, h: 40 },
      { num: 73, x: 55, y: 600, w: 561, h: 40 },
      { num: 74, x: 55, y: 641, w: 561, h: 40 },
      { num: 75, x: 55, y: 681, w: 561, h: 40 },
      { num: 76, x: 55, y: 768, w: 561, h: 40 }, 
      { num: 77, x: 55, y: 808, w: 561, h: 40 },
      { num: 78, x: 55, y: 848, w: 561, h: 40 }

    ]
  },
  
  pagina_11: { 
    preguntas: [
      { num: 79, x: 62, y: 110, w: 561, h: 40 },
      { num: 80, x: 62, y: 148, w: 561, h: 40 },
      { num: 81, x: 62, y: 191, w: 561, h: 40 },
      { num: 82, x: 62, y: 234, w: 561, h: 40 },
      { num: 83, x: 62, y: 275, w: 561, h: 40 },
      { num: 84, x: 62, y: 315, w: 561, h: 40 },
      { num: 85, x: 62, y: 355, w: 561, h: 40 },
      { num: 86, x: 62, y: 395, w: 561, h: 40 },
      { num: 87, x: 62, y: 435, w: 561, h: 40 },
      { num: 88, x: 62, y: 478, w: 561, h: 40 },
      { num: 89, x: 62, y: 520, w: 561, h: 40 },
      { num: 90, x: 62, y: 605, w: 561, h: 40 },
      { num: 91, x: 62, y: 645, w: 561, h: 40 },
      { num: 92, x: 62, y: 685, w: 561, h: 40 },
      { num: 93, x: 62, y: 727, w: 561, h: 40 },
      { num: 94, x: 62, y: 770, w: 561, h: 40 },
      { num: 95, x: 62, y: 855, w: 561, h: 40 },
      { num: 96, x: 62, y: 892, w: 561, h: 40 }
    ]
  },
  
  pagina_12: { 
    preguntas: [
      { num: 97, x: 53, y: 103, w: 552, h: 40 },
      { num: 98, x: 53, y: 147, w: 552, h: 40 },
      { num: 99, x: 53, y: 185, w: 552, h: 40 },
      { num: 100, x: 53, y: 225, w: 552, h: 40 },
      { num: 101, x: 53, y: 270, w: 552, h: 40 },
      { num: 102, x: 53, y: 310, w: 552, h: 40 },
      { num: 103, x: 53, y: 350, w: 552, h: 40 },
      { num: 104, x: 53, y: 392, w: 552, h: 40 },
      { num: 105, x: 53, y: 430, w: 552, h: 40 }
          ],
    pregunta_condicional: {
      x: 72, y: 515, w: 110, h: 19
    },
    preguntas_condicionales: [
      { num: 106, x: 53, y: 574, w: 552, h: 40 }, 
      { num: 107, x: 53, y: 615, w: 552, h: 40 },
      { num: 108, x: 53, y: 658, w: 552, h: 40 },
      { num: 109, x: 53, y: 700, w: 552, h: 40 },
      { num: 110, x: 53, y: 740, w: 552, h: 40 },
      { num: 111, x: 53, y: 780, w: 552, h: 40 },
      { num: 112, x: 53, y: 820, w: 552, h: 40 },
      { num: 113, x: 53, y: 860, w: 552, h: 40 },
      { num: 114, x: 53, y: 900, w: 552, h: 40 }
    ]
  },
  pagina_13: { 
    pregunta_condicional: {
      x: 83, y: 132, w: 108, h: 28
    },
    preguntas_condicionales: [
      { num: 115, x: 60, y: 213, w: 561, h: 40 },
      { num: 116, x: 60, y: 254, w: 561, h: 40 },
      { num: 117, x: 60, y: 295, w: 561, h: 40 },
      { num: 118, x: 60, y: 338, w: 561, h: 40 },
      { num: 119, x: 60, y: 375, w: 561, h: 40 },
      { num: 120, x: 60, y: 420, w: 561, h: 40 },
      { num: 121, x: 60, y: 458, w: 561, h: 40 },
      { num: 122, x: 60, y: 501, w: 561, h: 40 },
      { num: 123, x: 60, y: 540, w: 561, h: 40 }
    ]
  },
  
  pagina_14: { 
    preguntas: [
      { num: 1, x: 60, y: 225, w: 546, h: 40 },
      { num: 2, x: 60, y: 265, w: 546, h: 40 },
      { num: 3, x: 60, y: 308, w: 546, h: 40 },
      { num: 4, x: 60, y: 350, w: 546, h: 40 },
      { num: 5, x: 60, y: 390, w: 546, h: 40 },
      { num: 6, x: 60, y: 432, w: 546, h: 40 },
      { num: 7, x: 60, y: 472, w: 546, h: 40 },
      { num: 8, x: 60, y: 512, w: 546, h: 40 },
      { num: 9, x: 60, y: 554, w: 546, h: 40 },
      { num: 10, x: 60, y: 595, w: 546, h: 40 },
      { num: 11, x: 60, y: 635, w: 546, h: 40 },
      { num: 12, x: 60, y: 676, w: 546, h: 40 },
      { num: 13, x: 60, y: 717, w: 546, h: 40 },
      { num: 14, x: 60, y: 805, w: 546, h: 40 },
      { num: 15, x: 60, y: 845, w: 546, h: 40 },
      { num: 16, x: 60, y: 885, w: 546, h: 40 }
    ]
  },
  
  pagina_15: { 
    preguntas: [
      { num: 17, x: 66, y: 110, w: 550, h: 40 },
      { num: 18, x: 66, y: 150, w: 550, h: 40 },
      { num: 19, x: 66, y: 190, w: 550, h: 40 },
      { num: 20, x: 66, y: 235, w: 550, h: 40 },
      { num: 21, x: 66, y: 275, w: 550, h: 40 },
      { num: 22, x: 66, y: 315, w: 550, h: 40 },
      { num: 23, x: 66, y: 355, w: 550, h: 40 },
      { num: 24, x: 66, y: 395, w: 550, h: 40 },
      { num: 25, x: 66, y: 440, w: 550, h: 40 },
      { num: 26, x: 66, y: 475, w: 550, h: 40 },
      { num: 27, x: 66, y: 520, w: 550, h: 40 },
      { num: 28, x: 66, y: 560, w: 550, h: 40 },
      { num: 29, x: 66, y: 600, w: 550, h: 40 },
      { num: 30, x: 66, y: 642, w: 550, h: 40 },
      { num: 31, x: 66, y: 681, w: 550, h: 40 }     
    ],
  },

  pagina_16: { 
    preguntas: [
      { num: 1, x: 58, y: 189, w: 554, h: 40 },
      { num: 2, x: 58, y: 231, w: 554, h: 40 },
      { num: 3, x: 58, y: 273, w: 554, h: 40 },
      { num: 4, x: 58, y: 314, w: 554, h: 40 },
      { num: 5, x: 58, y: 354, w: 554, h: 40 },
      { num: 6, x: 58, y: 397, w: 554, h: 40 },
      { num: 7, x: 58, y: 435, w: 554, h: 40 },
      { num: 8, x: 58, y: 520, w: 554, h: 40 },
      { num: 9, x: 58, y: 564, w: 554, h: 40 },
      { num: 10, x: 58, y: 601, w: 554, h: 40 },
      { num: 11, x: 58, y: 644, w: 554, h: 40 },
      { num: 12, x: 58, y: 685, w: 554, h: 40 },
      { num: 13, x: 58, y: 725, w: 554, h: 40 },
      { num: 14, x: 58, y: 765, w: 554, h: 40 },
      { num: 15, x: 58, y: 804, w: 554, h: 40 },
      { num: 16, x: 58, y: 846, w: 554, h: 40 },
      { num: 17, x: 58, y: 888, w: 554, h: 40 }
    ],
  },
  
  pagina_17: { 
    preguntas: [
      { num: 18, x: 64, y: 110, w: 549, h: 40 },
      { num: 19, x: 64, y: 150, w: 549, h: 40 },
      { num: 20, x: 64, y: 191, w: 549, h: 40 },
      { num: 21, x: 64, y: 230, w: 549, h: 40 },
      { num: 22, x: 64, y: 272, w: 549, h: 40 },
      { num: 23, x: 64, y: 314, w: 549, h: 40 },
      { num: 24, x: 64, y: 356, w: 549, h: 40 },
      { num: 25, x: 64, y: 398, w: 549, h: 40 },
      { num: 26, x: 64, y: 435, w: 549, h: 40 },
      { num: 27, x: 64, y: 475, w: 549, h: 40 },
      { num: 28, x: 64, y: 519, w: 549, h: 40 },
      { num: 29, x: 64, y: 561, w: 549, h: 40 },
      { num: 30, x: 64, y: 601, w: 549, h: 40 },
      { num: 31, x: 64, y: 642, w: 549, h: 40 } 
    ],
    pregunta_multiple: {
      x: 70, y: 725, w: 225, h: 126
    }
  }
};
  }

   async convertirPDFaImagenes(rutaPDF) {
      const outputDir = path.join(process.cwd(), `temp_pdf_${Date.now()}`);
  
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
  
      return this.convertirConPoppler(rutaPDF, outputDir);
    }
  
    async convertirConPoppler(rutaPDF, dirTemp) {
      return new Promise(async (resolve, reject) => {
        try {
          const prefix = path.basename(rutaPDF, '.pdf');
  
          const pdfCorto = await this.rutaCorta(rutaPDF);
          const dirTempCorto = await this.rutaCorta(dirTemp);
          const outputPatternCorto = await this.rutaCorta(path.join(dirTemp, prefix));
          const exeCorto = await this.rutaCorta(path.join(popplerExecutablePath, 'pdftocairo.exe'));
  
          const cmd = `"${exeCorto}" -png -scale-to 1024 "${pdfCorto}" "${outputPatternCorto}"`;
          console.log(`Ejecutando: ${cmd}`);
  
          exec(cmd, { 
            timeout: 60000,
            maxBuffer: 1024 * 1024 * 10 
          }, (error, stdout, stderr) => {
            if (error) {
              console.error('Error exec:', error);
              console.error('stderr:', stderr);
              return reject(new Error(`pdftocairo falló: ${stderr}`));
            }
  
            try {
              const files = fs.readdirSync(dirTemp)
                .filter(f => f.startsWith(prefix) && f.endsWith('.png'))
                .sort((a, b) => {
                  const numA = parseInt(a.match(/(\d+)\.png$/)?.[1] || '0');
                  const numB = parseInt(b.match(/(\d+)\.png$/)?.[1] || '0');
                  return numA - numB;
                })
                .map(f => path.join(dirTemp, f));
  
              if (files.length === 0) {
                return reject(new Error('No se generaron archivos PNG'));
              }
  
              console.log(`Generadas ${files.length} imágenes`);
              resolve(files);
            } catch (error) {
              reject(error);
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    }
  async rutaCorta(ruta) {
    try {
      return execSync(`for %I in ("${ruta}") do @echo %~sI`, { shell: 'cmd.exe' })
        .toString()
        .trim();
    } catch (err) {
      console.error(`Error obteniendo ruta corta para: ${ruta}`, err);
      return ruta;
    }
  }
  
async crearImagenOptimaEspecializada(rutaArchivo, tipoPagina = 'formulario') {
  try {
    let pipeline = sharp(rutaArchivo);

    if (tipoPagina === 'formulario') {
      pipeline = pipeline
        .resize(3400, null, { withoutEnlargement: false }) 
        .grayscale()
        .normalize({ lower: 1, upper: 99 }) 
        .linear(1.2, -(128 * 1.2) + 128) 
        .sharpen({ 
          sigma: 1.5,     
          m1: 2.0, 
          m2: 3.0 
        })
        .png({ quality: 100, compressionLevel: 0 }); 
    }

    return await pipeline.toBuffer();
  } catch (error) {
    console.error('Error optimizando imagen:', error);
    return fs.readFileSync(rutaArchivo);
  }
}

  async procesarFormularioCompleto(rutaPDF) {
    let directorioTemporal = null;
    try {
      console.log('Iniciando procesamiento completo del formulario...');
      const tiempoInicio = Date.now();

      
      const imagenesRutas = await this.convertirPDFaImagenes(rutaPDF);
      directorioTemporal = path.dirname(imagenesRutas[0]);
      
      const resultados = {};

      for (let pagina = 1; pagina <= Math.min(17, imagenesRutas.length); pagina++) {
        console.log(`Procesando página ${pagina}...`);

        const rutaImagen = imagenesRutas[pagina - 1];
        if (!rutaImagen || !fs.existsSync(rutaImagen)) {
          console.warn(`Página ${pagina} no encontrada, saltando...`);
          continue;
        }

        try {
          let resultado;
          
          if ([1, 4, 5].includes(pagina)) {
            switch (pagina) {
              case 1:
                resultado = await this.procesarPaginaUno(rutaImagen);
                break;
              case 4:
                resultado = await this.procesarPaginaCuatro(rutaImagen);
                break;
              case 5:
                resultado = await this.procesarPaginaCinco(rutaImagen);
                break;
            }
            resultados[`pagina_${pagina}`] = resultado;
          }
          else if (pagina >= 6 && pagina <= 17) {
            const preguntasIndividuales = await this.procesarPaginaPorPreguntas(rutaImagen, pagina);
            Object.assign(resultados, preguntasIndividuales);
          }

        } catch (errorPagina) {
          console.error(`Error procesando página ${pagina}:`, errorPagina.message);
          if ([1, 4, 5].includes(pagina)) {
            resultados[`pagina_${pagina}`] = {
              error: errorPagina.message,
              procesada: false
            };
          }
        }
      }

      const tiempoTotal = ((Date.now() - tiempoInicio) / 1000).toFixed(1);
      console.log(`Formulario procesado completamente en ${tiempoTotal}s`);

      return {
        resultados,
        resumen: this.generarResumen(resultados),
        tiempo_procesamiento: `${tiempoTotal}s`,
        metodo_conversion: 'poppler-windows-mixto'
      };

    } catch (error) {
      console.error('Error procesando formulario:', error);
      throw error;
    } finally {
      if (directorioTemporal && fs.existsSync(directorioTemporal)) {
        await this.limpiarDirectorioTemporal(directorioTemporal);
      }
    }
  }

  async procesarPaginaUno(rutaImagen) {
    try {
      const imagenOptimizada = await this.crearImagenOptimaEspecializada(rutaImagen);
      const rutaTemporal = rutaImagen.replace(/\.[^.]+$/, '_opt.png');
      fs.writeFileSync(rutaTemporal, imagenOptimizada);
      
      const prompt = this.generarPromptPaginaUno();
      const resultado = await this.analizarConOpenAI(rutaTemporal, prompt);
      
      const resultadoValidado = this.validarPaginaUno(resultado);
      
      if (fs.existsSync(rutaTemporal)) {
        fs.unlinkSync(rutaTemporal);
      }
      
      return { ...resultadoValidado, procesada: true };
      
    } catch (error) {
      console.error('Error procesando página 1:', error);
      throw error;
    }
  }

  async procesarPaginaCuatro(rutaImagen) {
    try {
      const imagenOptimizada = await this.crearImagenOptimaEspecializada(rutaImagen);
      const rutaTemporal = rutaImagen.replace(/\.[^.]+$/, '_opt.png');
      fs.writeFileSync(rutaTemporal, imagenOptimizada);
      
      const prompt = this.generarPromptPaginaCuatro();
      const resultado = await this.analizarConOpenAI(rutaTemporal, prompt);
      
      const resultadoValidado = this.validarPaginaCuatro(resultado);
      
      if (fs.existsSync(rutaTemporal)) {
        fs.unlinkSync(rutaTemporal);
      }
      
      return { ...resultadoValidado, procesada: true };
      
    } catch (error) {
      console.error('Error procesando página 4:', error);
      throw error;
    }
  }

  async procesarPaginaCinco(rutaImagen) {
    try {
      const imagenOptimizada = await this.crearImagenOptimaEspecializada(rutaImagen);
      const rutaTemporal = rutaImagen.replace(/\.[^.]+$/, '_opt.png');
      fs.writeFileSync(rutaTemporal, imagenOptimizada);
      
      const prompt = this.generarPromptPaginaCinco();
      const resultado = await this.analizarConOpenAI(rutaTemporal, prompt);
      
      const resultadoValidado = this.validarPaginaCinco(resultado);
      
      if (fs.existsSync(rutaTemporal)) {
        fs.unlinkSync(rutaTemporal);
      }
      
      return { ...resultadoValidado, procesada: true };
      
    } catch (error) {
      console.error('Error procesando página 5:', error);
      throw error;
    }
  }

  generarPromptPaginaUno() {
    return `
ANÁLISIS DE DOCUMENTO - EXTRACCIÓN DE DATOS

Analiza esta imagen de un documento administrativo y extrae la información visible en los campos de texto y casillas marcadas.

PASO 1 - LOCALIZAR TABLA:
- Identificar la tabla ubicada al inicio de la página 
- Extraer los datos que se encuentran en la seguna columna

CAMPOS A EXTRAER:
1:Nombres y Apellidos 
2:Numero de cedula
3:Cargo
4:Área a la que pertenece

Responde únicamente con un objeto JSON válido con esta estructura:
{
  "nombre": "Nombre completo extraído",
  "numero_cedula": "12345678",
  "cargo": "Cargo extraído",
  "area": "Área extraída de la última fila de la tabla",
}

IMPORTANTE:
- Respuesta en formato JSON únicamente
`;
}

generarPromptPaginaCuatro() {
    return `
ANÁLISIS DE DOCUMENTO - EXTRACCIÓN DE DATOS

Analiza esta imagen de un documento administrativo y extrae la información visible en los campos de texto y casillas marcadas.

CAMPOS A EXTRAER:
1. FECHA: Formato DD/MM/AAAA en la parte superior
2. NÚMERO DE DOCUMENTO: Número de identificación
3. NOMBRE COMPLETO: Texto en el primer campo de nombre
4. SEXO: Opciones marcadas (1=Masculino, 2=Femenino)
5. AÑO DE NACIMIENTO: Año de 4 dígitos
6. ESTADO CIVIL: hay 7 opciones en lista vertical, cada una con un paréntesis antes. Identifica cuál paréntesis tiene una equis (x) y devuelve el TEXTO de esa opción. Las opciones son:
   - Soltero (a)
   - Casado (a)
   - Unión libre
   - Separado (a)
   - Divorciado
   - Viudo (a)
   - Sacerdote/Monja   
7. NIVEL DE ESTUDIOS: En la pregunta 5 "Último nivel de estudios que alcanzó (marque solo una opción)", hay 12 opciones en lista vertical, cada una con un paréntesis antes. Identifica cuál paréntesis tiene una equis (x) y devuelve el TEXTO de esa opción. Las opciones son:
   - Ninguno
   - Primaria incompleta
   - Primaria completa
   - Bachillerato incompleta
   - Bachillerato completa
   - Técnico / tecnólogo incompleto
   - Técnico / tecnólogo completo
   - Profesional incompleto
   - Profesional completo
   - Carrera militar / policía
   - Postgrado completo
   - Postgrado incompleto

8. OCUPACIÓN: Texto del campo de profesión/ocupación
9. LUGAR DE RESIDENCIA: Ciudad/Municipio y Departamento
10. CAMPO 8: Posición marcada del 1-7 en opciones horizontales que tienen un paréntesis antes de cada una, solo un paréntesis tiene una equis (x), determinar en qué posición está (mantener como número)
11. TIPO DE VIVIENDA (Pregunta 9): Hay 3 opciones escritas horizontalmente con paréntesis: "(   ) Propia   (   ) En arriendo   (   ) Familiar". Identifica cuál paréntesis tiene una equis (x) y devuelve el TEXTO de esa opción: "propia", "en arriendo", o "familiar"

Responde únicamente con un objeto JSON válido con esta estructura:
{
  "fecha": "DD/MM/2025",
  "numero_documento": "12345678",
  "nombre_completo": "Nombre completo extraído",
  "pregunta_2_sexo": masculino,
  "pregunta_3_año_nacimiento": "1985",
  "pregunta_4_estado_civil": "Soltero (a)",
  "pregunta_5_nivel_estudios": "primaria completa",
  "pregunta_6_ocupacion": "Ocupación",
  "pregunta_7_municipio": "Ciudad",
  "pregunta_7_departamento": "Departamento",
  "pregunta_8_respuesta": 3,
  "pregunta_9_tipo_vivienda": "propia",
}

IMPORTANTE:
- Para pregunta_2_sexo: Devolver el texto exacto de la opción marcada en minúsculas
- Para pregunta_4_estado_civil: Devolver el texto exacto de la opción marcada en minúsculas
- Para pregunta_5_nivel_estudios: Devolver el texto exacto de la opción marcada en minúsculas
- Para pregunta_9_tipo_vivienda: Devolver "propia", "en arriendo", o "familiar" según la opción marcada
- Extrae solo información visible, usa texto para las opciones específicas mencionadas
- Respuesta en formato JSON únicamente
`;
}

  generarPromptPaginaCinco() {
    return `
ANÁLISIS DE DOCUMENTO - EXTRACCIÓN DE DATOS

Analiza esta imagen de un documento administrativo y extrae la información visible en los campos de texto y casillas marcadas.

CAMPOS A EXTRAER:
1. CAMPO 10: Número escrito una vez se termine el texto de la pregunta
2. CAMPO 11: Municipio y Departamento
3. pregunta numero 12, hay dos opciones, una debajo de la otra, si al inicio de la primera opcion en el paréntesis hay una "x" devolver "menos de un año", la segunda opción es que al final de las palabras "cuántos años" en seguida hay un numero, devolver ese numero escrito
4. la pregunta numero 13 no analizarla, saltar esta pregunta.
5. Tipo de cargo: En la pregunta 14 hay 4 opciones en lista vertical, cada una con un paréntesis antes. Identifica cuál paréntesis tiene una equis (x) y devuelve el TEXTO de esa opción. Las opciones son aproximadamente:
   - Jefatura
   - Profesional
   - Auxiliar
   - Operario
6. el mismo estilo que la pregunta numero 12.
7. la pregunta numero 16 no analizarla, saltar esta pregunta.
8. Tipo de contrato: En la pregunta 17 hay 6 opciones en lista vertical, cada una con un paréntesis antes. Identifica cuál paréntesis tiene una equis (x) y devuelve el TEXTO de esa opción. Las opciones son aproximadamente:
   - Temporal de menos de un año
   - Temporal de un año o más
   - Término indefinido
   - Cooperado (cooperativa)
   - Prestación de servicios
   - No sé
9. Luego de la pregunta numero 18 debe haber un numero, una vez se termine todo el texto de la pregunta, debe haber un numero escrito sobre una linea, devolver ese numero
10. Tipo de salario: En la pregunta 19 hay 3 opciones en lista vertical, cada una con un paréntesis antes. Identifica cuál paréntesis tiene una equis (x) y devuelve el TEXTO de esa opción. Las opciones son aproximadamente:
   - Fijo
   - Una parte
   - Todo variable


Responde únicamente con un objeto JSON válido con esta estructura:
{
  "pregunta_10_numero": "25",
  "pregunta_11_municipio": "Ciudad",
  "pregunta_11_departamento": "Departamento",
  "pregunta_12_tiempoempresa": "menos de un año", o el numero, solo una, 
  "pregunta_14_cargo": "Auxiliar",
  "pregunta_15_tiempocargo": "menos de un año", o el numero, solo una, 
  "pregunta_17_contrato": "Temporal de un año o mas",
  "pregunta_18_numero": "9",
  "pregunta_19_salario": "Fijo"
}

IMPORTANTE:
- Para preguntas 14, 17 y 19: Devolver el texto exacto de la opción marcada en minúsculas
- Extrae solo información visible, usa texto para las opciones específicas mencionadas
- Respuesta en formato JSON únicamente
`;
}

async procesarPaginaPorPreguntas(rutaImagen, numeroPagina) {
  const configPagina = this.coordenadasFormaB[`pagina_${numeroPagina}`];
  if (!configPagina) {
    throw new Error(`Configuración no encontrada para página ${numeroPagina}`);
  }

  console.log(`Recortando y procesando preguntas individuales de página ${numeroPagina}...`);
  
  const preguntasRecortadas = await this.recortarPreguntasDePagina(rutaImagen, numeroPagina);
  
  const resultados = {};
  let respuestaCondicional = null;
  
  for (const preguntaRecortada of preguntasRecortadas) {
    try {
      if (numeroPagina === 12 && preguntaRecortada.tipo === 'condicional') {
        const resultado = await this.procesarPreguntaIndividual(preguntaRecortada);
        respuestaCondicional = resultado.respuesta.toUpperCase();
        const key = `p${preguntaRecortada.pagina}_q${preguntaRecortada.numero}`;
        resultados[key] = resultado;
      }
      else if (numeroPagina === 12 && preguntaRecortada.tipo === 'condicional_respuesta') {
        const key = `p${preguntaRecortada.pagina}_q${preguntaRecortada.numero}`;
        
        if (respuestaCondicional === 'SI') {
          const resultado = await this.procesarPreguntaIndividual(preguntaRecortada);
          resultados[key] = resultado;
        } else {
          resultados[key] = {
            pregunta: preguntaRecortada.numero,
            respuesta: ""
          };
        }
      }
      else if (numeroPagina === 13 && preguntaRecortada.tipo === 'condicional') {
        const resultado = await this.procesarPreguntaIndividual(preguntaRecortada);
        respuestaCondicional = resultado.respuesta.toUpperCase();
        const key = `p${preguntaRecortada.pagina}_q${preguntaRecortada.numero}`;
        resultados[key] = resultado;
      }
      else if (numeroPagina === 13 && preguntaRecortada.tipo === 'condicional_respuesta') {
        const key = `p${preguntaRecortada.pagina}_q${preguntaRecortada.numero}`;
        
        if (respuestaCondicional === 'SI') {
          const resultado = await this.procesarPreguntaIndividual(preguntaRecortada);
          resultados[key] = resultado;
        } else {
          resultados[key] = {
            pregunta: preguntaRecortada.numero,
            respuesta: ""
          };
        }
      }
      else {
        const resultado = await this.procesarPreguntaIndividual(preguntaRecortada);
        const key = `p${preguntaRecortada.pagina}_q${preguntaRecortada.numero}`;
        resultados[key] = resultado;
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`Error procesando pregunta ${preguntaRecortada.numero} de página ${numeroPagina}:`, error.message);
      const key = `p${preguntaRecortada.pagina}_q${preguntaRecortada.numero}`;
      resultados[key] = {
        pregunta: preguntaRecortada.numero,
        respuesta: "ERROR: " + error.message
      };
    }
  }

  return resultados;
}

  async recortarPreguntasDePagina(rutaImagenPagina, numeroPagina) {
    const configPagina = this.coordenadasFormaB[`pagina_${numeroPagina}`];
    const preguntasRecortadas = [];
    
    const imagenOriginal = sharp(rutaImagenPagina);
    
    if (configPagina.preguntas) {
      for (const pregunta of configPagina.preguntas) {
        const rutaRecortada = await this.recortarPreguntaIndividual(
          imagenOriginal, 
          pregunta, 
          numeroPagina, 
          rutaImagenPagina
        );
        
        preguntasRecortadas.push({
          ruta: rutaRecortada,
          numero: pregunta.num,
          pagina: numeroPagina,
          tipo: 'normal'
        });
      }
    }

    if (configPagina.pregunta_condicional) {
      const rutaCondicional = await this.recortarPreguntaEspecial(
        imagenOriginal,
        configPagina.pregunta_condicional,
        numeroPagina,
        'condicional',
        rutaImagenPagina
      );
      
      preguntasRecortadas.push({
        ruta: rutaCondicional,
        numero: 'condicional',
        pagina: numeroPagina,
        tipo: 'condicional'
      });
    }

    if (configPagina.preguntas_condicionales) {
      for (const pregunta of configPagina.preguntas_condicionales) {
        const rutaRecortada = await this.recortarPreguntaIndividual(
          imagenOriginal,
          pregunta,
          numeroPagina,
          rutaImagenPagina,
          'condicional_'
        );
        
        preguntasRecortadas.push({
          ruta: rutaRecortada,
          numero: pregunta.num,
          pagina: numeroPagina,
          tipo: 'condicional_respuesta'
        });
      }
    }

    if (configPagina.pregunta_multiple) {
      const rutaMultiple = await this.recortarPreguntaEspecial(
        imagenOriginal,
        configPagina.pregunta_multiple,
        numeroPagina,
        'multiple',
        rutaImagenPagina
      );
      
      preguntasRecortadas.push({
        ruta: rutaMultiple,
        numero: 'multiple',
        pagina: numeroPagina,
        tipo: 'multiple'
      });
    }

    return preguntasRecortadas;
  }

  async recortarPreguntaIndividual(imagenOriginal, pregunta, numeroPagina, rutaOriginal, prefijo = '') {
    const directorioBase = path.dirname(rutaOriginal);
    const nombreArchivo = `${prefijo}pregunta_p${numeroPagina}_q${pregunta.num}.png`;
    const rutaDestino = path.join(directorioBase, nombreArchivo);

    try {
      await imagenOriginal
        .clone()
        .extract({
          left: Math.round(pregunta.x),
          top: Math.round(pregunta.y),
          width: Math.round(pregunta.w),
          height: Math.round(pregunta.h)
        })
        .png()
        .toFile(rutaDestino);

      console.log(`Recortada: P${numeroPagina}-Q${pregunta.num}`);
      return rutaDestino;

    } catch (error) {
      console.error(`Error recortando P${numeroPagina}-Q${pregunta.num}:`, error);
      throw error;
    }
  }

  async recortarPreguntaEspecial(imagenOriginal, coordenadas, numeroPagina, tipo, rutaOriginal) {
    const directorioBase = path.dirname(rutaOriginal);
    const nombreArchivo = `pregunta_p${numeroPagina}_${tipo}.png`;
    const rutaDestino = path.join(directorioBase, nombreArchivo);

    try {
      await imagenOriginal
        .clone()
        .extract({
          left: Math.round(coordenadas.x),
          top: Math.round(coordenadas.y),
          width: Math.round(coordenadas.w),
          height: Math.round(coordenadas.h)
        })
        .png()
        .toFile(rutaDestino);

      console.log(`Recortada especial: P${numeroPagina}-${tipo}`);
      return rutaDestino;

    } catch (error) {
      console.error(`Error recortando P${numeroPagina}-${tipo}:`, error);
      throw error;
    }
  }

async procesarPreguntaIndividual(imagenPregunta) {
  const { ruta, numero, pagina, tipo } = imagenPregunta;
  
  let prompt;
  switch (tipo) {
    case 'condicional':
      prompt = this.generarPromptCondicional();
      break;
    case 'multiple':
      prompt = this.generarPromptMultiple();
      break;
    default:
      prompt = this.generarPromptPreguntaSimple();
  }

  console.log(`Procesando: P${pagina}-Q${numero} (${tipo})`);
  
  const resultado = await this.analizarConOpenAI(ruta, prompt, 0.0);
  
  if (tipo === 'multiple') {
    return {
      pregunta: numero,
      respuesta: resultado.opciones_marcadas?.join(', ') || resultado.respuesta || ""
    };
  }
  
  return {
    pregunta: numero,
    respuesta: resultado.opcion_texto || resultado.respuesta || ""
  };
}

  async analizarConOpenAI(rutaImagen, prompt, temperature = 0.0) {
  try {
    const imageBuffer = fs.readFileSync(rutaImagen);
    const base64Image = imageBuffer.toString('base64');
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Eres un experto en detección visual de marcas en formularios. Analiza meticulosamente cada pregunta y sus opciones. Sé extremadamente preciso en identificar qué paréntesis tiene marca."
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      temperature: temperature,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    const contenido = response.choices?.[0]?.message?.content;
    if (!contenido) {
      throw new Error('Respuesta vacía de OpenAI');
    }
    
    return this.parsearJSON(contenido.trim());
      
  } catch (error) {
    console.error('Error en análisis OpenAI:', error);
    throw error;
  }
}


// async procesarPreguntaIndividual(imagenPregunta) {
//   const { ruta, numero, pagina, tipo } = imagenPregunta;
  
//   // Validar que la imagen existe y tiene contenido
//   if (!fs.existsSync(ruta)) {
//     throw new Error(`Imagen no encontrada: ${ruta}`);
//   }
  
//   const stats = fs.statSync(ruta);
//   if (stats.size === 0) {
//     throw new Error(`Imagen vacía: ${ruta}`);
//   }
  
//   if (stats.size < 1000) { // Menos de 1KB probablemente es una imagen corrupta
//     console.warn(`Imagen muy pequeña (${stats.size} bytes): ${ruta}`);
//   }
  
//   let prompt;
//   switch (tipo) {
//     case 'condicional':
//       prompt = this.generarPromptCondicional();
//       break;
//     case 'multiple':
//       prompt = this.generarPromptMultiple();
//       break;
//     default:
//       prompt = this.generarPromptPreguntaSimple();
//   }

//   console.log(`Procesando: P${pagina}-Q${numero} (${tipo})`);
  
//   const resultado = await this.analizarConOpenAI(ruta, prompt, 0.0);
  
//   // Mejorar el retorno dependiendo del tipo
//   if (tipo === 'multiple') {
//     return {
//       pregunta: numero,
//       respuesta: resultado.opciones_marcadas?.join(', ') || resultado.respuesta || ""
//     };
//   }
  
//   return {
//     pregunta: numero,
//     respuesta: resultado.opcion_texto || resultado.respuesta || ""
//   };
// }

// async analizarConOpenAI(rutaImagen, prompt, temperature = 0.0) {
//   try {
//     const imageBuffer = fs.readFileSync(rutaImagen);
//     const base64Image = imageBuffer.toString('base64');
    
//     const response = await this.openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [
//         {
//           role: "system",
//           content: "Eres un experto en detección visual de marcas en formularios. Analiza meticulosamente cada pregunta y sus opciones. Sé extremadamente preciso en identificar qué paréntesis tiene marca."
//         },
//         {
//           role: "user",
//           content: [
//             { type: "text", text: prompt },
//             {
//               type: "image_url",
//               image_url: {
//                 url: `data:image/png;base64,${base64Image}`,
//                 detail: "high"
//               }
//             }
//           ]
//         }
//       ],
//       temperature: temperature,
//       max_tokens: 3000,
//       response_format: { type: "json_object" }
//     });

//     // Diagnóstico mejorado
//     console.log('Response completo:', JSON.stringify(response, null, 2));
    
//     const contenido = response.choices?.[0]?.message?.content;
//     if (!contenido || contenido.trim() === '') {
//       console.error('Detalles del error:');
//       console.error('- Response choices:', response.choices);
//       console.error('- Finish reason:', response.choices?.[0]?.finish_reason);
//       console.error('- Usage:', response.usage);
//       throw new Error(`Respuesta vacía de OpenAI. Finish reason: ${response.choices?.[0]?.finish_reason}`);
//     }
    
//     return this.parsearJSON(contenido.trim());
      
//   } catch (error) {
//     console.error('Error detallado en análisis OpenAI:');
//     console.error('- Error message:', error.message);
//     console.error('- Error status:', error.status);
//     console.error('- Error code:', error.code);
//     console.error('- Ruta imagen:', rutaImagen);
    
//     // Verificar si la imagen existe y su tamaño
//     if (fs.existsSync(rutaImagen)) {
//       const stats = fs.statSync(rutaImagen);
//       console.error('- Tamaño imagen:', stats.size, 'bytes');
//     } else {
//       console.error('- Imagen no existe:', rutaImagen);
//     }
    
//     throw error;
//   }
// }



  generarPromptPreguntaSimple() {
    return `
DETECTOR DE MARCA MANUSCRITA - PREGUNTA INDIVIDUAL

Esta imagen contiene UNA sola pregunta de un formulario psicosocial con 5 opciones:
1. "Siempre" 
2. "Casi Siempre"
3. "Algunas Veces" 
4. "Casi nunca"
5. "Nunca"

TAREA: Identificar cuál de los 5 paréntesis tiene una marca manuscrita.

PROCESO:
1. Localizar los 5 paréntesis en orden horizontal
2. Examinar cada paréntesis buscando marcas: X, ✓, /, trazos, garabatos
3. Identificar cuál paréntesis se ve "diferente" o "más lleno"
4. SOLO UNO debe estar marcado

RESPUESTA REQUERIDA (JSON):
{
  "opcion_texto": "Casi Siempre",
}

IMPORTANTE: Solo JSON válido, sin texto adicional.`;
  }

  generarPromptCondicional() {
    return `
DETECTOR DE MARCA SÍ/NO - PREGUNTA CONDICIONAL

Esta imagen contiene una pregunta con opciones SÍ/NO.

TAREA: Identificar si está marcado SÍ o NO.

RESPUESTA REQUERIDA (JSON):
{
  "respuesta": "SI",
}

IMPORTANTE: Solo JSON válido, sin texto adicional.`;
  }

generarPromptMultiple() {
  return `
DETECTOR DE MÚLTIPLE SELECCIÓN

Esta imagen contiene opciones de múltiple selección.
1. La pregunta multiselección tiene 8 opciones con paréntesis
2. PUEDE tener MÚLTIPLES marcas (2, 3, 4 o más opciones marcadas)

TAREA: Identificar todas las opciones marcadas.

RESPUESTA REQUERIDA (JSON):
{
  "opciones_marcadas": ["Embarazo", "Crisis con su pareja"],
  "total_marcadas": 2
}

Importante devolver el texto exacto de las opciones marcadas.

IMPORTANTE: Solo JSON válido, sin texto adicional.`;
}

 generarResumen(resultados) {
    const resumen = {
      total_elementos_procesados: 0,
      elementos_exitosos: 0,
      elementos_con_error: 0,
      total_preguntas_individuales: 0,
      paginas_datos_personales: 0
    };

    Object.entries(resultados).forEach(([key, datos]) => {
      resumen.total_elementos_procesados++;
      
      if (datos.procesada) {
        resumen.elementos_exitosos++;
        
        if (key.startsWith('pagina_')) {
          resumen.paginas_datos_personales++;
        } 
        else {
          resumen.total_preguntas_individuales++;
        }
      } else {
        resumen.elementos_con_error++;
      }
    });

    return resumen;
  }
  async limpiarDirectorioTemporal(directorio) {
    try {
      const archivos = fs.readdirSync(directorio);
      for (const archivo of archivos) {
        const rutaArchivo = path.join(directorio, archivo);
        fs.unlinkSync(rutaArchivo);
      }
      fs.rmdirSync(directorio);
      console.log(`Directorio temporal limpiado: ${directorio}`);
    } catch (error) {
      console.warn(`Advertencia limpiando directorio: ${error.message}`);
    }
  }

    parsearJSON(contenido) {
    try {
      return JSON.parse(contenido);
    } catch (error) {
      const match = contenido.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (e) {
          console.error('Error parseando JSON:', e);
        }
      }
      return {};
    }
  }

  validarPaginaUno(resultado) { return resultado; }
  validarPaginaCuatro(resultado) { return resultado; }
  validarPaginaCinco(resultado) { return resultado; }

}

export default ProcesadorFormularioPsicosocial;
