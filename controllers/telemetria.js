





// código de intento para cloud api 
// import axios from "axios";
// import Telemetria from "../models/telemetria.js";

// class TelemetriaController {
//     async receiveTelemetry(req, res) {
//         try {
//             console.log('Datos de telemetría recibidos:', req.body);
            
//             const {
//                 sn, 
//                 timestamp,
//                 position,
//                 battery,
//                 speed,
//                 flightStatus
//             } = req.body;

//             const telemetria = new Telemetria({
//                 droneId: sn,
//                 timestamp: new Date(timestamp),
//                 latitud: position?.lat,
//                 longitud: position?.lng,
//                 altitud: position?.alt,
//                 velocidad: speed,
//                 nivelbateria: battery?.capacity,
//                 posicion_vuelo: flightStatus
//             });

//             await telemetria.save();
            
//             res.status(200).json({
//                 success: true,
//                 message: "Datos de telemetría guardados correctamente",
//                 data: telemetria
//             });
//         } catch (error) {
//             console.error('Error procesando datos de telemetría:', error);
//             res.status(500).json({ 
//                 success: false,
//                 error: error.message 
//             });
//         }
//     }
// }

// export default new TelemetriaController();
