import express from 'express';
import workspaceController from '../controllers/workspaceController.js'; // Make sure this is an ES module export
import authMiddleware from '../middleware/auth.js'; // Ensure authMiddleware is also exported as an ES module

const router = express.Router();

// Routes for workspace-related actions

// Get workspace by ID or create if not found
router.get('/:workspaceId', authMiddleware, workspaceController.getWorkspace);
router.get('/:username/user', authMiddleware, workspaceController.getWorkspacesForUser);

// Create a new workspace
router.post('/', authMiddleware, workspaceController.createWorkspace);

// Share workspace with other users
router.post('/:workspaceId/share', authMiddleware, workspaceController.shareWorkspace);

// Add folder to a workspace
router.post('/:workspaceId/addFolder', authMiddleware, workspaceController.addFolder);

// Add formbot to a workspace
router.post('/:workspaceId/addFormbot', authMiddleware, workspaceController.addFormbot);

// Delete a folder from a workspace
router.delete('/:workspaceId/folder/:folderId', authMiddleware, workspaceController.deleteFolder);

// Delete a formbot from a workspace
router.delete('/:workspaceId/formbot/:formbotId', authMiddleware, workspaceController.deleteFormbot);

// Add formbot to a folder within a workspace
router.post('/:workspaceId/folder/:folderId/addFormbot', authMiddleware, workspaceController.addFormbotToFolder);

// Share workspace link
router.post('/:workspaceId/sharelink', authMiddleware, workspaceController.shareWorkspace);

// Export router as default
export default router;
