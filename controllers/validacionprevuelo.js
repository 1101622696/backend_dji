import {getValidacionPrevuelo} from '../helpers/validacionprevuelo.js';

const httpValidacionPrevuelo = {
    listarvalidacionesprevuelo: async (req, res) => {
        try {
          const data = await getValidacionPrevuelo();
          res.json({ data });
        } catch (e) {
          res.status(500).json({ error: 'Error leyendo validacionprevuelo' });
        }
      },
};
export default httpValidacionPrevuelo;
