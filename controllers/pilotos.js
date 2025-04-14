import {getPilotos} from '../helpers/pilotos.js';

const httpPilotos = {
    listarPilotos: async (req, res) => {
        try {
          const data = await getPilotos();
          res.json({ data });
        } catch (e) {
          res.status(500).json({ error: 'Error leyendo Pilotos' });
        }
      },
};
export default httpPilotos;
