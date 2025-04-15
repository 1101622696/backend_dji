// controllers/fileDownload.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';

class FileDownloadController {
  async downloadFile(req, res) {
    try {
      // Simulación: reemplaza esto con un object_key real cuando lo tengas
      const objectKey = "simulated/object_key.log";

      const orgKey = process.env.ORG_KEY; // Ya lo tienes en .env
      const url = `https://flighthub2.djivinci.com/api/v1/media/download?object_key=${objectKey}`;

      const response = await axios.get(url, {
        responseType: 'stream',
        headers: {
          'x-org-key': orgKey
        }
      });

      const outputPath = path.resolve(`./downloads/${Date.now()}_flightlog.dat`);
      const writer = fs.createWriteStream(outputPath);

      response.data.pipe(writer);

      writer.on('finish', () => {
        console.log("Archivo guardado en:", outputPath);
        res.status(200).json({ message: 'Descarga completa', path: outputPath });
      });

      writer.on('error', (err) => {
        console.error("Error al guardar el archivo:", err);
        res.status(500).json({ message: 'Error al guardar el archivo' });
      });

    } catch (error) {
      console.error("Error al descargar archivo:", error);
      res.status(500).json({ message: 'Error al descargar archivo' });
    }
  }
}

export default new FileDownloadController();
