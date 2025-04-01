import axios from "axios";

class AuthController {
    async authenticateDJI(req, res) {
        const { app_key, app_secret } = req.body;

        try {
            console.log("Enviando solicitud a DJI...");
            const response = await axios.post("https://open-api.dji.com/api/v1/auth/token", {
                app_key,
                app_secret
            });

            console.log("Respuesta recibida:", response.data);
            
            return res.status(200).json(response.data);
        } catch (error) {
            console.error("Error autenticando con DJI:");
            if (error.response) {
                console.log("Código de estado:", error.response.status);
                console.log("Encabezados:", error.response.headers);
                console.log("Cuerpo de la respuesta:", error.response.data);
            } else {
                console.log("Error sin respuesta:", error.message);
            }

            res.status(500).json({ 
                error: "Error interno del servidor", 
                detalle: error.response ? error.response.data : error.message
            });
        }
    }
}

export default new AuthController();
