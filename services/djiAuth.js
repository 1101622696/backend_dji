// import axios from 'axios';
// import 'dotenv/config';

// let accessToken = null;
// let tokenExpiry = null;

// export const authenticateDJI = async () => {
//   try {
//     const response = await axios.post('https://open.dji.com/api/oauth/token', {
//       app_key: process.env.DJI_APP_KEY,
//       app_secret: process.env.DJI_APP_SECRET,
//       grant_type: 'client_credentials'
//     });

//     accessToken = response.data.access_token;
//     tokenExpiry = Date.now() + (response.data.expires_in * 1000);
//     console.log('✅ Access token obtenido:', accessToken);
//     return accessToken;
//   } catch (error) {
//     console.error('❌ Error obteniendo token DJI:', error.response?.data || error);
//     throw error;
//   }
// };

// export const getAccessToken = async () => {
//   if (!accessToken || Date.now() >= tokenExpiry) {
//     return await authenticateDJI();
//   }
//   return accessToken;
// };


import axios from "axios";
import qs from "qs";

const DJI_AUTH_URL = "https://open.dji.com/api/oauth/token";
const DJI_SUBSCRIBE_URL = "https://open.dji.com/api/v1/cloud-api/push/subscribe";

let cachedToken = null;
let tokenExpiry = null;

export async function getAccessToken() {
  // Si ya tenemos un token y no ha expirado, lo devolvemos
  if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const data = qs.stringify({
      grant_type: "client_credentials",
      client_id: process.env.APP_KEY,
      client_secret: process.env.APP_SECRET,
    });

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const response = await axios.post(DJI_AUTH_URL, data, { headers });

    cachedToken = response.data.access_token;
    const expiresIn = response.data.expires_in;
    tokenExpiry = new Date(Date.now() + expiresIn * 1000);

    console.log("✅ Nuevo token obtenido de DJI Cloud API");
    return cachedToken;
  } catch (error) {
    console.error("❌ Error al obtener token DJI:", error.response?.data || error.message);
    throw error;
  }
}

export async function subscribeToTopics(callbackUrl) {
  try {
    const token = await getAccessToken();

    const response = await axios.post(
      DJI_SUBSCRIBE_URL,
      {
        topics: ["osd", "state"], // puedes añadir más topics si es necesario
        callback_url: callbackUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Suscripción exitosa a los topics de DJI:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al suscribirse a los topics:", error.response?.data || error.message);
    throw error;
  }
}
