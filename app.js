import express from "express";
import 'dotenv/config';
import dbConexion from "./database/cnxmongoose.js";
import cors from "cors";
import webhookRoutes from "./routes/webhook.js";
import fileRoutes from "./routes/file.js";
import fileDownload from "./routes/download.js";
import usuarios from "./routes/usuarios.js"
import solicitudes from "./routes/solicitudes.js"
import pilotos from "./routes/pilotos.js"
import prevuelos from "./routes/prevuelos.js"
import postvuelos from "./routes/postvuelos.js"
import drones from "./routes/drones.js"
import mantenimiento from "./routes/mantenimiento.js"
import validarpostvuelo from "./routes/validarpostvuelo.js"
import validarprevuelo from "./routes/validarprevuelo.js"
import validacionprevuelo from "./routes/validarprevuelo.js"
import { firebaseHelper } from "./helpers/firebase.js";

const app = express();

firebaseHelper.initializeFirebaseAdmin();

// con esto funciona todo menos desde localhost9000 entocnes agregaré el 9000 pero dejar esto quieto 
// const whitelist = ['https://localhost', 'http://localhost', 'http://localhost:3000', 'capacitor://localhost', 'ionic://localhost'];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || whitelist.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
// };

// app.use(cors(corsOptions));

const whitelist = ['https://localhost','http://localhost:9000', 'http://localhost', 'http://localhost:3000', 'capacitor://localhost', 'ionic://localhost'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// esto lo comenté para no tener tantos console pero con esto funcionó en la app
// el commit de que funcionó la app fue la 42
// app.use((req, res, next) => {
//   console.log("Nueva solicitud:");
//   console.log("Origen:", req.headers.origin);
//   console.log("Método:", req.method);
//   console.log("Ruta:", req.path);
//   console.log("Headers:", req.headers);
//   console.log("Body:", req.body);
//   next();
// });



// Routes
app.use('/api/webhook', webhookRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/fileDownload', fileDownload);
app.use("/api/usuarios",usuarios)
app.use("/api/mantenimiento",mantenimiento)
app.use("/api/drones",drones)
app.use("/api/postvuelos",postvuelos)
app.use("/api/prevuelos",prevuelos)
app.use("/api/pilotos",pilotos)
app.use("/api/solicitudes",solicitudes)
app.use("/api/validarpostvuelo",validarpostvuelo)
app.use("/api/validarprevuelo",validarprevuelo)
app.use("/api/validacionprevuelo",validacionprevuelo)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    dbConexion();
});

export default app;



// código de intento para cloud api 
// import express from "express";
// import 'dotenv/config';
// import dbConexion from "./database/cnxmongoose.js";
// import cors from "cors";
// import Djiruta from "./routes/telemetria.js";
// import Authruta from "./routes/auth.js";
// import Webhookruta from "./routes/webhook.js";

// const app = express();

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// app.use(cors({
//     origin: ['https://api.dji.com', 'https://front-apji-dji-3.vercel.app'],
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['Content-Type', 'Authorization']
//   }));

//   app.use(cors({
//     origin: ["https://api.dji.com", "https://front-apji-dji-3.vercel.app"], 
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"]
// }));

// app.use((req, res, next) => {
//     console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//     console.log('Headers:', req.headers);
//     console.log('Body:', req.body);
//     next();
// });

// app.get('/', (req, res) => {
//     res.status(200).json({ message: "DJI Cloud API Service Running" });
// });

// app.use("/api/dji", Djiruta);
// app.use("/api/dji", Authruta);
// app.use("/api/dji", Webhookruta);

// app.use((req, res) => {
//     console.log(`Ruta no encontrada: ${req.method} ${req.path}`);
//     res.status(404).json({ error: "Ruta no encontrada" });
// });

// app.use((err, req, res, next) => {
//     console.error('Error global:', err);
//     res.status(500).json({ 
//         error: "Error interno del servidor", 
//         details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
//     });
// });

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//     console.log(`Servidor escuchando en el puerto ${PORT}`);
//     dbConexion();
// });

// export default app;

