import axios from "axios";

class AuthController {
    async authenticateDJI(req, res) {
        const { app_key, app_secret } = req.body;

        try {
            // Solicitar token a la API de DJI
            const { data } = await axios.post("https://open-api.dji.com/api/v1/auth/token", {
                app_key,
                app_secret
            });

            if (data.access_token) {
                res.status(200).json({ token: data.access_token });
            } else {
                res.status(400).json({ error: "Error de autenticación", detalle: data });
            }
        } catch (error) {
            console.error("Error autenticando con DJI:", error?.response?.data || error.message);
            res.status(500).json({ 
                error: "Error interno del servidor", 
                detalle: error?.response?.data || error.message 
            });
        }
    }
}

export default new AuthController();
