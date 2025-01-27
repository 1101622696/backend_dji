import mongoose from "mongoose";

const telemetriaSchema = new mongoose.Schema({
  droneId: String, // ID único del dron
  timestamp: { type: Date, default: Date.now }, 
  latitud: Number,
  longitud: Number,
  altitud: Number,
  velocidad: Number,
  nivelbateria: Number,
  posicion_vuelo: String, 
});

export default mongoose.model("Telemetria", telemetriaSchema);
