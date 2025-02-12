import axios from 'axios';

class DJIAuthService {
    constructor() {
        // Updated to use DJI's cloud API endpoint
        this.baseURL = 'https://developer.dji.com/api/v1';
    }

    async getAccessToken() {
        try {
            console.log('Attempting to get DJI access token...');
            console.log('Using APP_ID:', process.env.APP_ID);
            // Don't log the full APP_KEY for security
            console.log('APP_KEY length:', process.env.APP_KEY?.length);

            const response = await axios.post(`${this.baseURL}/oauth/token`, {
                grant_type: 'client_credentials',
                client_id: process.env.APP_ID,
                client_secret: process.env.APP_KEY
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });

            console.log('DJI token response:', JSON.stringify(response.data, null, 2));

            if (response.data && response.data.access_token) {
                return response.data.access_token;
            }

            throw new Error('Invalid token response from DJI');
        } catch (error) {
            console.error('Detailed error in getAccessToken:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
            
            if (error.code === 'ENOTFOUND') {
                throw new Error('Cannot connect to DJI API. Please check your internet connection and DNS settings.');
            }
            
            throw new Error(`Failed to obtain DJI access token: ${error.message}`);
        }
    }
}

export default new DJIAuthService();