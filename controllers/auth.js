





// import { getAccessToken, subscribeToTopics } from "../services/djiAuth.js";

// class AuthController {
//   async getAccessToken(req, res) {
//     try {
//       const token = await getAccessToken();
//       res.status(200).json({ success: true, access_token: token });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: "Error al obtener token",
//         error: error.message,
//       });
//     }
//   }

//   async subscribeToTopics(req, res) {
//     try {
//       const callbackUrl = process.env.CALLBACK_URL;

//       if (!callbackUrl) {
//         return res.status(400).json({
//           success: false,
//           message: "Falta definir CALLBACK_URL en .env",
//         });
//       }

//       const result = await subscribeToTopics(callbackUrl);
//       res.status(200).json({ success: true, result });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: "Error al suscribirse a los topics",
//         error: error.message,
//       });
//     }
//   }
// }

// export default new AuthController();
