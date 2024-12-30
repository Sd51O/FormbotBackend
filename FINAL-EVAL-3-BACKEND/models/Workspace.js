// models/Workspace.js
import mongoose from 'mongoose';
import User from './User.js';

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  folders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder'
  }],
  formbots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formbot'
  }],
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: {
      type: String,
      ref: 'User'
    },
    email: {
      type: String,
      ref: 'User'
    },
    permissions: {
      type: String
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export the Workspace model
const Workspace = mongoose.model('Workspace', workspaceSchema);

export default Workspace;
