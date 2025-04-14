import { getMantenimientos } from '../helpers/mantenimiento.js';
 
const httpMantenimiento = {
  listarMantenimientos: async (req, res) => {
        try {
          const data = await getMantenimientos();
          res.json({ data });
        } catch (e) {
          res.status(500).json({ error: 'Error leyendo mantenimientos' });
        }
      },
};
export default httpMantenimiento;
