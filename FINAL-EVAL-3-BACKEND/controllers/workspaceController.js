import mongoose from 'mongoose';
import Workspace from '../models/Workspace.js';
import Folder from '../models/Folder.js'; // Import Folder model
import Formbot from '../models/Formbot.js'; // Import Formbot model
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const workspaceController = {
  // Get workspace by ID
  getWorkspace: async (req, res) => {
    const workspaceId = req.params.workspaceId;
    console.log('Workspace route hit! Received workspaceId:', workspaceId);
  
    try {
      // Validate workspace ID
      if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        console.error('Invalid workspaceId:', workspaceId);
        return res.status(400).json({ message: 'Invalid workspace ID' });
      }
  
      // Try to find existing workspace
      let workspace = await Workspace.findOne({ _id: workspaceId })
        .populate('owner', 'username')
        .populate({
          path: 'folders',
          populate: {
            path: 'formbots',
            select: 'name'
          }
        })
        .populate('formbots', 'name')
        .populate('sharedWith.userId', 'username');
  
      // If workspace doesn't exist and we have creation data
      if (!workspace && req.body.name && req.user) {
        workspace = new Workspace({
          name: req.body.name,
          owner: req.user._id,
        });
        await workspace.save();
        
        // Populate the newly created workspace
        workspace = await Workspace.findOne({ _id: workspace._id })
          .populate('owner', 'username')
          .populate('folders', 'name')
          .populate('formbots', 'name')
          .populate('sharedWith.userId', 'username');
      }
      
      // If no workspace found and no creation data
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
  
      console.log('Workspace:', workspace);
      return res.json(workspace);
  
    } catch (error) {
      console.error('Error in workspace handler:', error);
      return res.status(500).json({ 
        message: 'Internal server error',
        error: error.message 
      });
    }
  },

  getWorkspacesForUser: async (req, res) => {
    try {
      console.log('Workspace route hit! Received workspaceId:');
      const username = req.params.username;
      console.log(username);
      const userToShareWith = await User.findOne({ username });
      console.log(userToShareWith);
      const userId = userToShareWith._id;
      // Find workspaces owned by user
      const ownedWorkspaces = await Workspace.find({ owner: userId })
        .populate('owner', 'username')
        .populate('sharedWith.userId', 'username email');
  
      // Find workspaces shared with user
      const sharedWorkspaces = await Workspace.find({
        'sharedWith.userId': userId
      })
        .populate('owner', 'username')
        .populate('sharedWith.userId', 'username email');
  
      res.json({
        owned: ownedWorkspaces,
        shared: sharedWorkspaces
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new workspace
  createWorkspace: async (req, res) => {
    try {
      console.log("Workspace route hitsssssssssssssss!");
      const workspace = new Workspace({
        name: req.body.name,
        owner: req.user._id,
      });
      
      const newWorkspace = await workspace.save();
      res.status(201).json(newWorkspace);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Add Folder to Workspace
  addFolder: async (req, res) => {
    try {
      const workspaceId = req.params.workspaceId;
      const { name } = req.body;
  
      console.log('Adding folder to workspace:', workspaceId);
      console.log('Folder name:', name);
      console.log('User:', req.user);
  
      // Validate inputs
      if (!name) {
        return res.status(400).json({ message: 'Folder name is required' });
      }
  
      if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).json({ message: 'Invalid workspace ID format' });
      }
  
      // Get userId from token payload
      const userId = req.user.userId; // Changed from req.user._id to req.user.userId
  
      if (!userId) {
        return res.status(400).json({ message: 'User ID not found in token' });
      }
  
      // Find the workspace first
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
  
      // Create new folder with correct userId
      const newFolder = new Folder({
        name,
        workspace: workspaceId,
        createdBy: userId  // Using userId from token
      });
  
      // Save the folder
      await newFolder.save();
  
      // Add folder to workspace
      workspace.folders.push(newFolder._id);
      await workspace.save();
  
      // Return populated folder
      const populatedFolder = await Folder.findById(newFolder._id)
        .populate('createdBy', 'username')
        .populate('workspace', 'name');
  
      res.status(201).json(populatedFolder);
  
    } catch (error) {
      console.error('Error in addFolder:', error);
      res.status(500).json({ 
        message: 'Failed to add folder', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  // Add Formbot to Workspace
  addFormbot: async (req, res) => {
    try {
      const workspaceId = req.params.workspaceId;
      const { name } = req.body;
  
      // Validate workspace ID
      if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).json({ message: 'Invalid workspace ID format' });
      }
  
      // Create formbot with workspace ID
      const newFormbot = new Formbot({
        name,
        workspace: workspaceId,  // Add the workspace reference
        ...(req.user && { createdBy: req.user._id })
      });
  
      // Save the formbot
      await newFormbot.save();
  
      // Find the workspace and add the formbot
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        await Formbot.findByIdAndDelete(newFormbot._id);
        return res.status(404).json({ message: 'Workspace not found' });
      }
  
      // Initialize formbots array if it doesn't exist
      if (!workspace.formbots) {
        workspace.formbots = [];
      }
  
      workspace.formbots.push(newFormbot._id);
      await workspace.save();
  
      return res.status(201).json({
        id: newFormbot._id,
        name: newFormbot.name,
      });
  
    } catch (error) {
      console.error('Error in addFormbot:', error);
      
      // Send more detailed error information
      return res.status(500).json({ 
        message: 'Failed to add formbot', 
        error: error.message,
        validationErrors: error.errors  // Include validation errors if they exist
      });
    }
  },

  deleteFolder: async (req, res) => {
    try {
      const { workspaceId, folderId } = req.params;
      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Remove folder from workspace
      workspace.folders = workspace.folders.filter(f => f.toString() !== folderId);
      await workspace.save();
      
      // Optionally, delete the folder document itself (if necessary)
      await Folder.findByIdAndDelete(folderId);

      res.status(200).json(workspace);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete formbot from workspace
  deleteFormbot: async (req, res) => {
    try {
      const { workspaceId, formbotId } = req.params;
      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      
      // Remove formbot from workspace
      workspace.formbots = workspace.formbots.filter(f => f.toString() !== formbotId);
      await workspace.save();
      
      // Optionally, delete the formbot document itself (if necessary)
      await Formbot.findByIdAndDelete(formbotId);

      res.status(200).json(workspace);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  
  addFormbotToFolder: async (req, res) => {
    const { workspaceId, folderId } = req.params;
    const { name } = req.body; // Changed from formbotName to name
    
    try {
      const folder = await Folder.findById(folderId);
      const workspace = await Workspace.findById(workspaceId);
  
      if (!folder || !workspace) {
        return res.status(404).json({ message: 'Workspace or Folder not found' });
      }
  
      const newFormbot = new Formbot({
        name,
        workspace: workspaceId,
        folder: folderId
      });
  
      await newFormbot.save();
      folder.formbots.push(newFormbot._id);
      await folder.save();
  
      res.status(201).json(newFormbot);
    } catch (error) {
      console.error('Error in addFormbotToFolder:', error);
      res.status(500).json({ message: 'Error adding formbot to folder', error: error.message });
    }
  },

  // Share workspace with another user
  shareWorkspace: async (req, res) => {
    const { workspaceId } = req.params;
    const { username } = req.body;
  
    try {
      const workspace = await Workspace.findById(workspaceId);
  
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
  
      const userToShareWith = await User.findOne({ username });
  
      if (!userToShareWith) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (workspace.sharedWith.some(shared => shared.userId.toString() === userToShareWith._id.toString())) {
        return res.status(400).json({ message: 'Workspace already shared with this user' });
      }
  
      workspace.sharedWith.push({ userId: userToShareWith._id });
      await workspace.save();
  
      res.status(200).json({ message: `Workspace shared with ${username}` });
    } catch (error) {
      res.status(500).json({ message: 'Error sharing workspace', error: error.message });
    }
  }
};

export default workspaceController;
