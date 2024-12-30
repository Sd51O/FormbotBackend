import express from 'express';
import authMiddleware from '../middleware/auth.js'; // Ensure the file is an ES module
import userController from '../controllers/userController.js'; // Make sure userController uses ES module syntax

const router = express.Router();

// Update user settings
router.patch('/:userId', authMiddleware, userController.updateUserSettings);

// Update user password
router.patch('/:userId/password', authMiddleware, userController.updateUserPassword);

// Export the router as default
export default router;
