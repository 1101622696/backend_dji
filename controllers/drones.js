import { dronHelper } from "../helpers/drones.js";


const ORDENAMIENTO_HANDLERS = {
  fecha: dronHelper.getDronesOrdenadosPorFechaPoliza,
  tiempo: dronHelper.getDronOrdenadosPorTiempo,
  distancia: dronHelper.getDronOrdenadosPorDistancia,
  vuelos: dronHelper.getDronOrdenadosPorVuelos,
  peso: dronHelper.getDronOrdenadosPorPeso,
  velocidad: dronHelper.getDronOrdenadosPorVelocidad
};

const FILTRO_HANDLERS = {
  ocupacion: dronHelper.getDronesPorOcupacion,
  estado: dronHelper.getDronesPorEstado
};
const TIPOS_ORDENAMIENTO = Object.keys(ORDENAMIENTO_HANDLERS);
const TIPOS_FILTRO = Object.keys(FILTRO_HANDLERS);

const httpDrones = {
  crearDron: async (req, res) => {
    try {
      const {
        numeroSerie,
        marca,
        modelo,
        peso,
        dimensiones,
        autonomiavuelo,
        alturaMaxima,
        velocidadMaxima,
        fechaCompra,
        capacidadBateria,
        tipoCamarasSensores,
        fechapoliza,
        tiempoacumulado,
        distanciaacumulada,
        vuelosrealizados,
        contratodron,
        ubicaciondron,
      } = req.body;

      const estado = req.body.estado || "Activo";
      const fechadecreacion = new Date().toISOString().split("T")[0];
      const ocupadodron = req.body.estado || "No";

      let Link = null;
      if (req.files && req.files.length > 0) {
        // Primero obtener la numeroSerie para usarlo como nombre de la carpeta
        const numeroserienombre = numeroSerie;
        Link = await dronHelper.procesarArchivos(req.files, numeroserienombre);

        const resultado = await dronHelper.guardarDron({
          numeroSerie,
          marca,
          modelo,
          peso,
          dimensiones,
          autonomiavuelo,
          alturaMaxima,
          velocidadMaxima,
          fechaCompra,
          capacidadBateria,
          tipoCamarasSensores,
          Link,
          fechadecreacion,
          estado,
          fechapoliza,
          tiempoacumulado,
          distanciaacumulada,
          vuelosrealizados,
          contratodron,
          ubicaciondron,
          ocupadodron,
        });

        res.status(200).json({
          mensaje: "dron guardado con link correctamente",
          codigo: resultado.codigo,
        });
      } else {
        const resultado = await dronHelper.guardarDron({
          numeroSerie,
          marca,
          modelo,
          peso,
          dimensiones,
          autonomiavuelo,
          alturaMaxima,
          velocidadMaxima,
          fechaCompra,
          capacidadBateria,
          tipoCamarasSensores,
          Link: null,
          fechadecreacion,
          estado,
          fechapoliza,
          tiempoacumulado,
          distanciaacumulada,
          vuelosrealizados,
          contratodron,
          ubicaciondron,
          ocupadodron,
        });

        res.status(200).json({
          mensaje: "Dron guardado sin archivos correctamente",
          codigo: resultado.codigo,
        });
      }
    } catch (error) {
      console.error("Error al guardar dron:", error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },

  obtenerdron: async (req, res) => {
    try {
      const data = await dronHelper.getDrones();
      res.json(data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      res.status(500).json({ mensaje: "Error al obtener dron" });
    }
  },

  obtenerDronesActivos: async (req, res) => {
    try {
      const data = await dronHelper.getDronesByStatus("Activo");
      res.json(data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      res.status(500).json({ mensaje: "Error al obtener drones activos" });
    }
  },

  obtenerDronesActivosyNoOcupados: async (req, res) => {
    try {
      const data = await dronHelper.getDronesByStatusyOcupado("Activo", "No");
      res.json(data);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      res
        .status(500)
        .json({ mensaje: "Error al obtener drones activos no ocupados" });
    }
  },

  obtenerDronporNumeroserie: async (req, res) => {
    try {
      const { numeroserie } = req.params;
      const dron = await dronHelper.getDronByNumeroserie(numeroserie);

      if (!dron) {
        return res.status(404).json({ mensaje: "dron no encontrado" });
      }

      res.json(dron);
    } catch (error) {
      console.error("Error al obtener dron:", error);
      res.status(500).json({ mensaje: "Error al obtener dron" });
    }
  },

 obtenerDronesOrdenados: async (req, res) => {
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
    const drones = await handlerFn(orden);
    
    res.json(drones);
  } catch (error) {
    console.error("Error al obtener drones ordenados:", error);
    res.status(500).json({ mensaje: "Error al obtener drones" });
  }
},

  obtenerDronesFiltrados: async (req, res) => {
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
    const drones = await handlerFn(valor);
    
    res.json(drones);
  } catch (error) {
    console.error("Error al obtener drones filtrados:", error);
    res.status(500).json({ mensaje: "Error al obtener drones", error: error.message });
  }
},

  editarDron: async (req, res) => {
    try {
      const { numeroserie } = req.params;
      const nuevosDatos = req.body;

      if (req.files && req.files.length > 0) {
        const Link = await dronHelper.procesarArchivos(req.files, numeroserie);
        nuevosDatos.Link = Link;
      }

      const resultado = await dronHelper.editarDronporNumeroserie(
        numeroserie,
        nuevosDatos
      );

      if (!resultado) {
        return res.status(404).json({ mensaje: "Dron no encontrado" });
      }

      res.status(200).json({ mensaje: "Dron actualizado correctamente" });
    } catch (error) {
      console.error("Error al editar Dron:", error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },

  activarDron: async (req, res) => {
    try {
      const { numeroserie } = req.params;
      const { estado } = req.body; // Opcional, puedes obtener el estado del body o usar "aprobado" por defecto

      const resultado = await dronHelper.actualizarEstadoEnSheets(
        numeroserie,
        estado || "Activo"
      );

      res.status(200).json({ mensaje: "Estado actualizado correctamente" });
    } catch (error) {
      console.error("Error al editar estado del dron:", error);
      res.status(500).json({
        mensaje: "Error al actualizar estado",
        error: error.message,
      });
    }
  },

  desactivarDron: async (req, res) => {
    try {
      const { numeroSerie } = req.params;
      const { estado } = req.body; // Opcional, puedes obtener el estado del body o usar "aprobado" por defecto

      const resultado = await dronHelper.actualizarEstadoEnSheets(
        numeroSerie,
        estado || "Inactivo"
      );

      res.status(200).json({ mensaje: "Estado actualizado correctamente" });
    } catch (error) {
      console.error("Error al editar estado del dron:", error);
      res.status(500).json({
        mensaje: "Error al actualizar estado",
        error: error.message,
      });
    }
  },
};
export default httpDrones;
