const validarApiKey = (req, res, next) => {
  if (req.method === 'GET' && req.path === '/') {
      return res.status(200).json({ message: "DJI Cloud API Service Running" });
  }

  const apiKey = req.header("x-api-key");
  const validApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
      return res.status(403).json({ error: "Acceso denegado. Clave de API inválida." });
  }

  next();
};


export default validarApiKey;
  