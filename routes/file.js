import { Router } from 'express';

import getAllFiles from '../controllers/file.js';

const router = Router();

router.get('/', getAllFiles.getAllFiles);

export default router;
