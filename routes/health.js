import { Router } from 'express';
import httpHealth from '../controllers/health.js';

const router = Router();

router.get('/', httpHealth.getHealth);

export default router;