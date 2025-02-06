const validarApiKey = (req, res, next) => {
  // Si es una solicitud de verificación DJI, permitir sin API key
  if (req.method === 'GET' && req.path === '/') {
      return next();
  }

  const apiKey = req.header("x-api-key");
  const validApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
      return res.status(403).json({ error: "Acceso denegado. Clave de API inválida." });
  }

  next();
};

export default validarApiKey;