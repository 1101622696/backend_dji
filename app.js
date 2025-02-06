import express from "express";
import 'dotenv/config';
import dbConexion from "./database/cnxmongoose.js";
import cors from "cors";
import Djiruta from "./routes/telemetria.js"
import Djirutadiag from "./routes/diagnostico.js"

const app = express();

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Headers:`, req.headers);
    next();
});

app.get('/', (req, res) => {
    console.log("Accediendo a ruta raíz principal");
    res.status(200).json({ message: "DJI Cloud API Service Running" });
});

app.use("/api/dji", Djiruta);
app.use("/api/diagnostico", Djirutadiag);
console.log("Cargando rutas...");
console.log("Djiruta:", Djiruta);
console.log("Djirutadiag:", Djirutadiag);

app.use((req, res) => {
    console.log(`Ruta no encontrada: ${req.method} ${req.path}`);
    res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
    console.error('Error global:', err);
    res.status(500).json({ error: "Error interno del servidor", details: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    dbConexion();
});