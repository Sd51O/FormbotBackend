import express from 'express';
import ShareController from '../controllers/shareController.js';

const router = express.Router();

router.post('/share', ShareController.createShare);
router.get('/shared/:shareToken', ShareController.getSharedForm);

export default router;