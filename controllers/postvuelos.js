import {getPostvuelos} from '../helpers/postvuelos.js';

const httpPostvuelos = {
    listarPostvuelos: async (req, res) => {
        try {
          const data = await getPostvuelos();
          res.json({ data });
        } catch (e) {
          res.status(500).json({ error: 'Error leyendo postvuelos' });
        }
      },
};
export default httpPostvuelos;
