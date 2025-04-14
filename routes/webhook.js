import { Router } from 'express';

import receiveFileNotification from '../controllers/webhook.js';

const router = Router();

router.post('/flighthub', receiveFileNotification.receiveFileNotification);

export default router;




// código de intento para cloud api 
// import { Router } from 'express';
// import WebhookController from '../controllers/webhook.js';

// const router = Router();
// router.post('/webhook/flighthub', WebhookController.handleFileUploaded);

// export default router;
