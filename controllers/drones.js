import {getDrones} from '../helpers/drones.js';

const httpDrones = {
    listarDrones: async (req, res) => {
        try {
          const data = await getDrones();
          res.json({ data });
        } catch (e) {
          res.status(500).json({ error: 'Error leyendo Drones' });
        }
      },
};
export default httpDrones;
