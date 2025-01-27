import express from "express";
import 'dotenv/config';
import dbConexion from "./database/cnxmongoose.js";
import cors from "cors";

import Djiruta from "./routes/telemetria.js"

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/rutas",Djiruta)

app.listen(process.env.PORT, () => {
  console.log(`Servidor escuchando en el puerto ${process.env.PORT}`);
  dbConexion();
});
