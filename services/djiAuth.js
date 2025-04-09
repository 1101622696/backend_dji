





// código de intento para cloud api 
// import axios from "axios";

// export async function getAccessToken() {
//   try {
//     const response = await axios.post(
//       `${process.env.BASE_URL}/api/oauth/token`,
//       new URLSearchParams({
//         grant_type: "client_credentials",
//         client_id: process.env.APP_KEY,
//         client_secret: process.env.APP_SECRET,
//       }),
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//           "X-Organization-Key": process.env.ORG_KEY,
//         },
//       }
//     );

//     return response.data.access_token;
//   } catch (error) {
//     console.error("Error al obtener token:", error.response?.data || error.message);
//     throw new Error(`Request failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
//   }
// }

// export async function subscribeToTopics(callbackUrl) {
//   try {
//     const token = await getAccessToken();

//     const response = await axios.post(
//       `${process.env.BASE_URL}/api/v1/cloud-pilot/topics`,
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

//     return response.data;
//   } catch (error) {
//     console.error("Error al suscribirse a topics:", error.response?.data || error.message);
//     throw new Error(`Suscripción fallida: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
//   }
// }


