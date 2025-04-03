import express from "express";
import 'dotenv/config';
import dbConexion from "./database/cnxmongoose.js";
import cors from "cors";
import Djiruta from "./routes/telemetria.js";
import Authruta from "./routes/auth.js";

const app = express();

// Increase payload size limit for webhook data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure CORS to accept requests from DJI
// app.use(cors({
//     origin: ['https://api.dji.com', process.env.BASE_URL],
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use(cors({
    origin: ['https://api.dji.com', 'https://front-apji-dji-3.vercel.app'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(cors({
    origin: ["https://api.dji.com", "https://front-apji-dji-3.vercel.app"], // Asegúrate de que el dominio está correcto
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));


// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.status(200).json({ message: "DJI Cloud API Service Running" });
});

// Mount DJI routes - Make sure this comes BEFORE the 404 handler
app.use("/api/dji", Djiruta);
app.use("/api/dji", Authruta);

// 404 handler
app.use((req, res) => {
    console.log(`Ruta no encontrada: ${req.method} ${req.path}`);
    res.status(404).json({ error: "Ruta no encontrada" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error global:', err);
    res.status(500).json({ 
        error: "Error interno del servidor", 
        details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    dbConexion();
});

export default app;

// import express from "express";
// import 'dotenv/config';
// import dbConexion from "./database/cnxmongoose.js";
// import cors from "cors";
// import Djiruta from "./routes/telemetria.js"

// const app = express();

// app.use(express.json());
// app.use(cors());

// app.use((req, res, next) => {
//     console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Headers:`, req.headers);
//     next();
// });

// app.get('/', (req, res) => {
//     console.log("Accediendo a ruta raíz principal");
//     res.status(200).json({ message: "DJI Cloud API Service Running" });
// });

// app.use("/api/dji", Djiruta);

// app.use((req, res) => {
//     console.log(`Ruta no encontrada: ${req.method} ${req.path}`);
//     res.status(404).json({ error: "Ruta no encontrada" });
// });

// app.use((err, req, res, next) => {
//     console.error('Error global:', err);
//     res.status(500).json({ error: "Error interno del servidor", details: err.message });
// });

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//     console.log(`Servidor escuchando en el puerto ${PORT}`);
//     dbConexion();
// });