// routes/download.js
import { Router } from 'express';
import fileDownloadController from '../controllers/filedownload.js';

const router = Router();

router.get('/download', fileDownloadController.downloadFile);

export default router;
