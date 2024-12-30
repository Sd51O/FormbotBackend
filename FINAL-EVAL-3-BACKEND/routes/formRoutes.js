import express from 'express';
import auth from '../middleware/auth.js'; // Ensure the auth middleware is an ES module
import formElementController from '../controllers/formElementController.js'; // Ensure the controller uses ES module syntax

const router = express.Router();

// Routes for form elements
router.post('/:formbotId/elements', auth, formElementController.addFormElements);
router.get('/:formbotId/elements', auth, formElementController.getFormElements);
router.put('/:formbotId/elements/:elementId', auth, formElementController.updateFormElement);
router.delete('/:formbotId/elements/:elementId', auth, formElementController.deleteFormElement);
router.put('/:formbotId/reorder', auth, formElementController.reorderElements);
router.get('/:formbotId/elements/existing', formElementController.getExistingElementIds);

// Export the router as default
export default router;
