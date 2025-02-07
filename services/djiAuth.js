// services/djiAuth.js
import axios from 'axios';

class DJIAuthService {
    constructor() {
        this.baseURL = 'https://api.dji.com/api/v1';
        this.appId = process.env.APP_ID;
        this.appKey = process.env.APP_KEY;
        this.accessToken = null;
        this.tokenExpiration = null;
    }

    async getAccessToken() {
        // Si el token existe y no ha expirado, retornarlo
        if (this.accessToken && this.tokenExpiration > Date.now()) {
            return this.accessToken;
        }

        try {
            const response = await axios.post(`${this.baseURL}/oauth/token`, {
                app_id: this.appId,
                app_key: this.appKey
            });

            this.accessToken = response.data.access_token;
            // Asumiendo que el token expira en 2 horas
            this.tokenExpiration = Date.now() + (2 * 60 * 60 * 1000);
            
            return this.accessToken;
        } catch (error) {
            console.error('Error obtaining DJI access token:', error);
            throw new Error('Failed to obtain DJI access token');
        }
    }
}

export default new DJIAuthService();