// models/Folder.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const folderSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  workspace: {
    type: Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  formbots: [{  // Add formbots here
    type: Schema.Types.ObjectId,
    ref: 'Formbot'
  }]
  // Add any other fields you need
}, { timestamps: true });

const Folder = mongoose.model('Folder', folderSchema);

export default Folder;
