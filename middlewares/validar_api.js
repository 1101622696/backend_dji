


// código de intento para cloud api 
// const validarApiKey = (req, res, next) => {
//   console.log('Verificando API Key...');
//   console.log('Headers recibidos:', req.headers);
  
//   if (req.method === 'GET' && req.path === '/') {
//       console.log('Ruta de verificación DJI - permitiendo acceso');
//       return next();
//   }

//   const apiKey = req.header("x-api-key");
//   const validApiKey = process.env.API_KEY;

//   console.log('API Key recibida:', apiKey);
//   console.log('API Key esperada:', validApiKey);

//   if (!apiKey || apiKey !== validApiKey) {
//       console.log('API Key inválida o no proporcionada');
//       return res.status(403).json({ 
//           error: "Acceso denegado. Clave de API inválida.",
//           received: apiKey ? "API Key proporcionada pero inválida" : "No se proporcionó API Key",
//           headerName: "x-api-key"
//       });
//   }

//   console.log('API Key válida - acceso permitido');
//   next();
// };

// export default validarApiKey;