import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config(); // Carga las variables de entorno desde el archivo .env

const dbConexion = async () => {
  try {
    await mongoose.connect(process.env.CNX_MONGO, {
    });
    console.log("Conexión a la base de datos establecida");
  } catch (error) {
    console.error("Error al conectar a la base de datos", error);
  }
};

export default dbConexion;