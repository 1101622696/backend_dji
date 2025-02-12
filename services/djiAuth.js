import axios from 'axios';

class DJIAuthService {
    constructor() {
        this.baseURL = 'https://api.dji.com/api/v1';
        this.token = null;
        this.tokenExpiry = null;
    }

    async getAccessToken() {
        try {
            // Check if we have a valid token
            if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
                return this.token;
            }

            // Request new token
            const response = await axios.post(`${this.baseURL}/oauth/token`, {
                grant_type: 'client_credentials',
                client_id: process.env.APP_ID,
                client_secret: process.env.APP_KEY
            });

            if (response.data && response.data.access_token) {
                this.token = response.data.access_token;
                // Set token expiry (typically 1 hour from now)
                this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
                return this.token;
            }

            throw new Error('Invalid token response from DJI');
        } catch (error) {
            console.error('Error obtaining DJI access token:', error.response?.data || error.message);
            throw new Error('Failed to obtain DJI access token');
        }
    }
}

export default new DJIAuthService();