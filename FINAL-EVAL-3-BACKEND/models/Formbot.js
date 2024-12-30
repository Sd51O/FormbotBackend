// models/Formbot.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const formbotSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Make sure this is false since we might not have user info
  },
  workspace: {
    type: Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  elements: [{
    type: Schema.Types.ObjectId,
    ref: 'FormElement'
  }]
  // Add any other required fields here
}, {
  timestamps: true
});

export default mongoose.model('Formbot', formbotSchema);
