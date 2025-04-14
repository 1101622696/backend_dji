import {getValidarPostvuelo} from '../helpers/validarpostvuelo.js';

const httpValidarPostvuelo = {
    listarvalidarPostvuelo: async (req, res) => {
        try {
          const data = await getValidarPostvuelo();
          res.json({ data });
        } catch (e) {
          res.status(500).json({ error: 'Error leyendo validarpostvuelo' });
        }
      },
};
export default httpValidarPostvuelo;
