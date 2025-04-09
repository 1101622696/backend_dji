// services/djiauth.js (actualizado para FlightHub)

import axios from "axios";

// ✅ Función para obtener el token
export async function getAccessToken() {
  try {
    const response = await axios.post(
      `${process.env.BASE_URL}/api/oauth/token`,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.APP_KEY,
        client_secret: process.env.APP_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Organization-Key": process.env.ORG_KEY,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Error al obtener token:", error.response?.data || error.message);
    throw new Error(`Request failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
  }
}

// ✅ Función para suscribirse a topics
export async function subscribeToTopics(callbackUrl) {
  try {
    const token = await getAccessToken();

    const response = await axios.post(
      `${process.env.BASE_URL}/api/v1/cloud-pilot/topics`,
      {
        topics: ["osd", "state"], // o los que necesites
        callback_url: callbackUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Organization-Key": process.env.ORG_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error al suscribirse a topics:", error.response?.data || error.message);
    throw new Error(`Suscripción fallida: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
  }
}




// import axios from "axios";
// import qs from "qs";

// const FH_AUTH_URL = "https://es-flight-api-us.djigate.com/api/oauth/token";
// const FH_SUBSCRIBE_URL = "https://es-flight-api-us.djigate.com/api/v1/cloud-api/push/subscribe";

// let cachedToken = null;
// let tokenExpiry = null;

// export async function getAccessToken() {
//   if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
//     return cachedToken;
//   }

//   try {
//     const data = qs.stringify({
//       grant_type: "client_credentials",
//       client_id: process.env.APP_KEY,
//       client_secret: process.env.APP_SECRET,
//     });

//     const headers = {
//       "Content-Type": "application/x-www-form-urlencoded",
//       "X-Organization-Key": process.env.ORG_KEY
//     };

//     const response = await axios.post(FH_AUTH_URL, data, { headers });

//     cachedToken = response.data.access_token;
//     const expiresIn = response.data.expires_in;
//     tokenExpiry = new Date(Date.now() + expiresIn * 1000);

//     console.log("✅ Nuevo token obtenido de FlightHub 2");
//     return cachedToken;
//   } catch (error) {
//     console.error("❌ Error al obtener token DJI:", error.response?.data || error.message);
//     throw error;
//   }
// }

// export async function subscribeToTopics(callbackUrl) {
//   try {
//     const token = await getAccessToken();

//     const response = await axios.post(
//       FH_SUBSCRIBE_URL,
//       {
//         topics: ["osd", "state"],
//         callback_url: callbackUrl,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//           "X-Organization-Key": process.env.ORG_KEY,
//         },
//       }
//     );

//     console.log("✅ Suscripción exitosa a los topics de FlightHub:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error al suscribirse a los topics:", error.response?.data || error.message);
//     throw error;
//   }
// }
