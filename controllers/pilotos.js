import {pilotoHelper} from '../helpers/pilotos.js';

const ORDENAMIENTO_HANDLERS = {
  fecha: pilotoHelper.getPilotoOrdenadosPorFechaPoliza,
  tiempo: pilotoHelper.getPilotoOrdenadosPorTiempo,
  distancia: pilotoHelper.getPilotoOrdenadosPorDistancia,
  vuelos: pilotoHelper.getPilotoOrdenadosPorVuelos,
};

const FILTRO_HANDLERS = {
  estado: pilotoHelper.getPilotosPorEstado
};

const TIPOS_ORDENAMIENTO = Object.keys(ORDENAMIENTO_HANDLERS);
const TIPOS_FILTRO = Object.keys(FILTRO_HANDLERS);

const httpPilotos = {

  crearPiloto: async (req, res) => {
    try {
      const {nombreCompleto, primerApellido, SegundoApellido, tipoDocumento, identificacion, paisExpedicion, ciudadExpedicion, fechaExpedicion, paisNacimiento, ciudadNacimiento, fechaNacimiento, grupoSanguineo, factorRH, genero, estadoCivil, ciudadOrigen, direccion, telefonoMovil, fechaExamen, email, contratopiloto, tiempoacumulado, distanciaacumulada, vuelosrealizados} = req.body;

    const estado = req.body.estado || "Activo";
    const fechadecreacion = new Date().toISOString().split('T')[0];

        let Link = null;
        if (req.files && req.files.length > 0) {
          // Primero obtener la identificacion para usarlo como nombre de la carpeta
          const identificacionnombre = identificacion;
          Link = await pilotoHelper.procesarArchivos(req.files, identificacionnombre);
      
    const resultado = await pilotoHelper.guardarPiloto({ nombreCompleto, primerApellido, SegundoApellido, tipoDocumento, identificacion, paisExpedicion, ciudadExpedicion, fechaExpedicion, paisNacimiento, ciudadNacimiento, fechaNacimiento, grupoSanguineo, factorRH, genero, estadoCivil, ciudadOrigen, direccion, telefonoMovil, fechaExamen, email, contratopiloto, Link, fechadecreacion, tiempoacumulado, distanciaacumulada, vuelosrealizados, estado });
  
      res.status(200).json({
        mensaje: 'piloto guardado  con link correctamente',
        idPiloto: resultado.idPiloto,
       
      });
  } else {
    const resultado = await pilotoHelper.guardarPiloto({ 
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
      estadoCivil, 
      ciudadOrigen, 
      direccion, 
      telefonoMovil, 
      fechaExamen, 
      email, 
      contratopiloto, 
      Link:null, 
      fechadecreacion, 
      tiempoacumulado, 
      distanciaacumulada, 
      vuelosrealizados, 
      estado
    });
    
    res.status(200).json({ 
      mensaje: 'Piloto guardado sin archivos correctamente', 
      idPiloto: resultado.idPiloto, 
    });
  }
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
  obtenerPilotosActivos: async (req, res) => {
    try {
      const data = await pilotoHelper.getPilotoByStatus('Activo');
      res.json(data);
    } catch (error) {
      console.error('Error al obtener datos:', error);
      res.status(500).json({ mensaje: 'Error al obtener pilotos activos' });
    }
  },

    obtenerPilotosInactivos: async (req, res) => {
    try {
      const data = await pilotoHelper.getPilotoByStatus('Inactivo');
      res.json(data);
    } catch (error) {
      console.error('Error al obtener datos:', error);
      res.status(500).json({ mensaje: 'Error al obtener pilotos inactivos' });
    }
  },

   obtenerPilotosOrdenados: async (req, res) => {
  try {
    const { tipo = "tiempo", orden = "desc" } = req.query;
    
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
    const pilotos = await handlerFn(orden);
    
    res.json(pilotos);
  } catch (error) {
    console.error("Error al obtener pilotos ordenados:", error);
    res.status(500).json({ mensaje: "Error al obtener pilotos" });
  }
},

  obtenerPilotosFiltrados: async (req, res) => {
  try {
    const { tipo, valor } = req.query;
    
    // console.log("Parámetros recibidos:", req.query);
    // console.log(`tipo: "${tipo}", valor: "${valor}"`);
    
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
    const pilotos = await handlerFn(valor);
    
    res.json(pilotos);
  } catch (error) {
    console.error("Error al obtener pilotos filtrados:", error);
    res.status(500).json({ mensaje: "Error al obtener pilotos", error: error.message });
  }
},

  obtenerPilotoporIdentificacion: async (req, res) => {
    try {
      const { identificacion } = req.params;
      const piloto = await pilotoHelper.getPilotoById(identificacion);
  
      if (!piloto) {
        return res.status(404).json({ mensaje: 'piloto no encontrado' });
      }
  
      res.json(piloto);
    } catch (error) {
      console.error('Error al obtener piloto:', error);
      res.status(500).json({ mensaje: 'Error al obtener piloto' });
    }
  },

  editarPiloto: async (req, res) => {
    try {
      const { identificacion } = req.params;
      const nuevosDatos = req.body;
    if (req.files && req.files.length > 0) {
      // Procesará los archivos reutilizando la carpeta si existe
      const Link = await pilotoHelper.procesarArchivos(req.files, identificacion);
      nuevosDatos.Link = Link;
    }

    const resultado = await pilotoHelper.editarPilotoporIdentificacion(identificacion, nuevosDatos);

      if (!resultado) {
        return res.status(404).json({ mensaje: 'Piloto no encontrado' });
      }
  
      res.status(200).json({ mensaje: 'Piloto actualizado correctamente' });
    } catch (error) {
      console.error('Error al editar Piloto:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  },
  
activarPiloto: async (req, res) => {
  try {
    const { identificacion } = req.params;
    const { estado } = req.body; // Opcional, puedes obtener el estado del body o usar "aprobado" por defecto
    
    const resultado = await pilotoHelper.actualizarEstadoEnSheets(identificacion, estado || "Activo");

    res.status(200).json({ mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar estado del piloto:', error);
    res.status(500).json({ 
      mensaje: 'Error al actualizar estado', 
      error: error.message 
    });
  }
},

desactivarPiloto: async (req, res) => {
  try {
    const { identificacion } = req.params;
    const { estado } = req.body; // Opcional, puedes obtener el estado del body o usar "aprobado" por defecto
    
    const resultado = await pilotoHelper.actualizarEstadoEnSheets(identificacion, estado || "Inactivo");

    res.status(200).json({ mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al editar estado del piloto:', error);
    res.status(500).json({ 
      mensaje: 'Error al actualizar estado', 
      error: error.message 
    });
  }
},

  }
export default httpPilotos;
