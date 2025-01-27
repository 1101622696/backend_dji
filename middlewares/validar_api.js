const validarApiKey = (req, res, next) => {
    const apiKey = req.header("x-api-key"); // Obtén la clave de los headers
    const validApiKey = process.env.API_KEY; // Clave configurada en el servidor
  
    if (!apiKey || apiKey !== validApiKey) {
      return res.status(403).json({ error: "Acceso denegado. Clave de API inválida." });
    }
  
    next(); // Continúa al siguiente middleware o controlador
  };
  
  export default validarApiKey;
  