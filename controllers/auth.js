import axios from "axios";
import qs from "qs"; // Para formatear correctamente los parámetros

class AuthController {
    async authenticateDJI(req, res) {
        const { app_key, app_secret } = req.body;

        try {
            console.log("Enviando solicitud a DJI...");

            // Construir parámetros en formato x-www-form-urlencoded
            const params = qs.stringify({
                app_key,
                app_secret,
                grant_type: "client_credentials"
            });

            // Hacer la solicitud a DJI Cloud API
            const response = await axios.post("https://api.dji.com/v1/oauth/token", params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            console.log("Respuesta recibida:", response.data);

            return res.status(200).json(response.data);
        } catch (error) {
            console.error("Error autenticando con DJI:");
            if (error.response) {
                console.log("Código de estado:", error.response.status);
                console.log("Cuerpo de la respuesta:", error.response.data);
                return res.status(error.response.status).json({ 
                    error: "Error de autenticación", 
                    detalle: error.response.data 
                });
            } else {
                return res.status(500).json({ 
                    error: "Error interno del servidor", 
                    detalle: error.message 
                });
            }
        }
    }
}

export default new AuthController();
