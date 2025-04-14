import File from "../models/file.js";

class FileController {
    async getAllFiles(req, res) {
      try {
        const files = await File.find().sort({ createdAt: -1 });
        res.status(200).json(files);
      } catch (error) {
        console.error('Error getting files:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
  
  export default new FileController();
  