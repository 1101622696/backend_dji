import jwt from 'jsonwebtoken';
import {usuarioHelper}  from '../helpers/usuarios.js'; // asegúrate que sea exportada

const validarJWT = async (req, res, next) => {
    const token = req.header("x-token");
    if (!token) {
      return res.status(401).json({ msg: "No hay token en la petición" });
    }
  
    try {
        const decoded = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        console.log("Token decodificado:", decoded);
        const { id, perfil } = decoded;  
      const usuarios = await usuarioHelper.getUsuarios();
      // Buscar por id o email, dependiendo de lo que hayas usado para generar el token
      const usuario = usuarios.find(u => u.id === id || u.email === id);
  
      if (!usuario) {
        return res.status(401).json({ msg: "Token no válido - usuario no existe" });
      }
  
      if (usuario.estado === 'inactivo') {
        return res.status(401).json({ msg: "Token no válido - usuario desactivado" });
      }
  
      req.usuariobdtoken = {
        id: usuario.id,
        email: usuario.email,
        perfil: usuario.perfil,
        nombre: usuario.nombre || ''
      };
  
      next();
  
    } catch (error) {
      console.error(error);
      res.status(401).json({ msg: "Token no válido" });
    }
  };

export { validarJWT };
