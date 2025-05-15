import { mantenimientoHelper } from '../helpers/mantenimiento.js';


const ORDENAMIENTO_HANDLERS = {
  fecha: mantenimientoHelper.getMantenimientosPorFecha,
  costo: mantenimientoHelper.getMantenimientosPorCosto,
};

const FILTRO_HANDLERS = {
  observacion: mantenimientoHelper.getMantenimientosByObservacion,
  identificacion: mantenimientoHelper.getMantenimientosByPiloto,
  numeroserie: mantenimientoHelper.getMantenimientosBynumeroserie
};
const TIPOS_ORDENAMIENTO = Object.keys(ORDENAMIENTO_HANDLERS);

const TIPOS_FILTRO = Object.keys(FILTRO_HANDLERS);

const httpMantenimiento = {

crearMantenimiento: async (req, res) => {
  try {
    const {numeroserie, fechaMantenimiento, valor, empresaresponsable, idPiloto, descripcion, observaciones, pruebas } = req.body;
 
    const fechadeCreacion = new Date().toISOString().split('T')[0];

    const codigomantenimiento = await mantenimientoHelper.getSiguienteCodigo();

    let Link = null;
    if (req.files && req.files.length > 0) {
        const carpetanombre = codigomantenimiento;
        Link = await mantenimientoHelper.procesarArchivos(req.files, carpetanombre);
      
    const resultado = await mantenimientoHelper.guardarMantenimiento({numeroserie, fechaMantenimiento, valor, empresaresponsable, idPiloto, descripcion, observaciones, pruebas, Link, fechadeCreacion, codigomantenimiento });

    res.status(200).json({
      mensaje: 'Mantenimiento guardado correctamente',
      CodigoMantenimiento: resultado.CodigoMantenimiento
    });
     } else {
            const resultado = await mantenimientoHelper.guardarMantenimiento({ 
              numeroserie, 
              fechaMantenimiento, 
              valor,
              empresaresponsable,
              idPiloto,
              descripcion,
              observaciones,
              pruebas,
              fechadeCreacion,
              codigomantenimiento
            });
        
            res.status(200).json({ 
              mensaje: 'Mantenimiento guardado correctamente', 
              numeroserie: resultado.numeroserie, 
            });
          }
  } catch (error) {
    console.error('Error al guardar mantenimiento:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
},

obtenerMantenimientos: async (req, res) => {
  try {
    const data = await mantenimientoHelper.getMantenimientos();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ mensaje: 'Error al obtener mantenimientos' });
  }
},

obtenerMantenimientoPorCodigo: async (req, res) => {
  try {
    const { codigomantenimiento } = req.params;
    const mantenimiento = await mantenimientoHelper.getMantenimientoByCodigo(codigomantenimiento);

    if (!mantenimiento) {
      return res.status(404).json({ mensaje: 'mantenimiento no encontrado' });
    }

    res.json(mantenimiento);
  } catch (error) {
    console.error('Error al obtener mantenimiento:', error);
    res.status(500).json({ mensaje: 'Error al obtener mantenimiento' });
  }
},

  obtenerMantenimientosOrdenadosPorValor: async (req, res) => {
    try {
      const { orden = 'desc' } = req.query;
      
      if (orden !== 'asc' && orden !== 'desc') {
        return res.status(400).json({ mensaje: 'El parámetro orden debe ser "asc" o "desc"' });
      }
      
      const mantenimientos = await mantenimientoHelper.getMantenimientosOrdenadosPorValor(orden);
      
      res.json(mantenimientos);
    } catch (error) {
      console.error('Error al obtener mantenimientos ordenados:', error);
      res.status(500).json({ mensaje: 'Error al obtener mantenimientos' });
    }
  },

  obtenerTotalValorMantenimientos: async (req, res) => {
    try {
      const total = await mantenimientoHelper.getValorTotal();
      
      res.status(200).json({
        total,
        mensaje: 'Total calculado correctamente'
      });
    } catch (error) {
      console.error('Error al calcular el total de mantenimientos:', error);
      res.status(500).json({ mensaje: 'Error al calcular el total de mantenimientos' });
    }
  },

  obtenerMantenimientosOrdenados: async (req, res) => {
  try {
    const { tipo = "costo", orden = "desc" } = req.query;
    
    if (orden !== "asc" && orden !== "desc") {
      return res
        .status(400)
        .json({ mensaje: 'El parámetro orden debe ser "asc" o "desc"' });
    }
    
    const tipoLower = tipo.toLowerCase();
    if (!TIPOS_ORDENAMIENTO.includes(tipoLower)) {
      return res
        .status(400)
        .json({ 
          mensaje: `El parámetro tipo debe ser uno de: ${TIPOS_ORDENAMIENTO.join(', ')}`,
          tiposPermitidos: TIPOS_ORDENAMIENTO
        });
    }
    
    const handlerFn = ORDENAMIENTO_HANDLERS[tipoLower];
    const mantenimientos = await handlerFn(orden);
    
    res.json(mantenimientos);
  } catch (error) {
    console.error("Error al obtener mantenimientos ordenados:", error);
    res.status(500).json({ mensaje: "Error al obtener mantenimientos" });
  }
},

  obtenerMantenimientosFiltrados: async (req, res) => {
  try {
    const { tipo, valor } = req.query;
    
    console.log("Parámetros recibidos:", req.query);
    console.log(`tipo: "${tipo}", valor: "${valor}"`);
    
    if (!tipo || !valor) {
      return res
        .status(400)
        .json({ mensaje: 'Se requieren los parámetros tipo y valor' });
    }
    
    const tipoLower = tipo.toLowerCase();
    if (!TIPOS_FILTRO.includes(tipoLower)) {
      return res
        .status(400)
        .json({ 
          mensaje: `El parámetro tipo debe ser uno de: ${TIPOS_FILTRO.join(', ')}`,
          tiposPermitidos: TIPOS_FILTRO
        });
    }
    
    const handlerFn = FILTRO_HANDLERS[tipoLower];
    const mantenimientos = await handlerFn(valor);
    
    res.json(mantenimientos);
  } catch (error) {
    console.error("Error al obtener mantenimientos filtrados:", error);
    res.status(500).json({ mensaje: "Error al obtener mantenimientos", error: error.message });
  }
},

  editarMantenimiento: async (req, res) => {
    try {
      const { codigomantenimiento } = req.params;
      const nuevosDatos = req.body;
  
          if (req.files && req.files.length > 0) {
            // Procesará los archivos reutilizando la carpeta si existe
            const Link = await mantenimientoHelper.procesarArchivos(req.files, codigomantenimiento);
            nuevosDatos.Link = Link;
          }
      
      const resultado = await mantenimientoHelper.editarMantenimiento(codigomantenimiento, nuevosDatos);
  
      if (!resultado) {
        return res.status(404).json({ mensaje: 'Mantenimiento no encontrado' });
      }
  
      res.status(200).json({ mensaje: 'Mantenimiento actualizado correctamente' });
    } catch (error) {
      console.error('Error al editar Mantenimiento:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  },

}
export default httpMantenimiento;
