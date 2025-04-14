// import Usuario from "../models/usuarios.js";
import { generarJWT } from "../helpers/generar-jwt.js";
import { usuarioHelper } from '../helpers/usuarios.js';

const httpUsuarios = {
  getUsuariosDesdeSheets: async (req, res) => {
    try {
      const usuarios = await usuarioHelper.getUsuarios();
      res.json({ usuarios });
    } catch (error) {
      console.error('Error leyendo hoja de usuarios', error);
      res.status(500).json({ error: 'Error al leer hoja de cálculo' });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const { token, usuario } = await usuarioHelper.loginUsuario({ email, password });
  
      return res.json({
        token,
        usuario
      });
  
    } catch (error) {
      console.error("Error en login:", error.message);
      res.status(400).json({ msg: error.message });
    }
  }
  

};
export default httpUsuarios;
