import File from "../models/file.js";

class WebhookController {
    async receiveFileNotification(req, res) {
      try {
        const data = req.body;
        console.log("Webhook recibido:", data);
        const saved = await File.create({
          notify_type: data.notify_type,
          notify_time: data.notify_time,
          organization_id: data.data.organization_id,
          workspace_id: data.data.workspace_id,
          file: data.data.file,
        });
  
        res.status(200).json({ message: 'File info saved', file: saved });
      } catch (error) {
        console.error('Error saving file info:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
  
  export default new WebhookController();
  





// código de intento para cloud api 
// class WebhookController {
//     async handleFileUploaded(req, res) {
//       try {
//         const { notify_type, notify_time, data } = req.body;
  
//         if (notify_type === "file_uploaded") {
//           const fileInfo = data.file;
  
//           console.log("✅ Archivo subido por DJI:", fileInfo);
  
//           return res.status(200).json({ success: true });
//         }
  
//         res.status(400).json({ success: false, message: "Tipo de notificación no manejado" });
//       } catch (error) {
//         console.error("❌ Error en webhook:", error.message);
//         res.status(500).json({ success: false, error: error.message });
//       }
//     }
//   }
  
//   export default new WebhookController();
  