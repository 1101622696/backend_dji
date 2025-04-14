import { getValidarPrevuelo } from '../helpers/validarprevuelo.js';

const httpValidarPrevuelo = {
    listarvalidarPrevuelo: async (req, res) => {
        try {
          const data = await getValidarPrevuelo();
          res.json({ data });
        } catch (e) {
          res.status(500).json({ error: 'Error leyendo validarprevuelo' });
        }
      },
};
export default httpValidarPrevuelo;
