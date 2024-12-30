import express from 'express';
import formController from '../controllers/formResponseController.js'; // Ensure the controller uses ES module syntax

const router = express.Router();

// Routes
router.post('/:formId/responses/start', formController.startFormResponse);
router.put('/:formId/responses/:responseId', formController.updateFormResponse);
router.post('/:formId/view', formController.trackFormView);
router.get('/:formId/analytics', formController.getFormAnalytics);
router.get('/:formId/responses', formController.getFormResponses);

// Export the router as default
export default router;
