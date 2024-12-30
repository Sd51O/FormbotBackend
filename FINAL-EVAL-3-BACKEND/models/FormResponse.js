// models/FormResponse.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const formResponseSchema = new Schema({
  formId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Form'
  },
  responses: {
    type: Map,
    of: Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['started', 'completed', 'abandoned'],
    default: 'started'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
});

// Export the FormResponse model
const FormResponse = mongoose.model('FormResponse', formResponseSchema);

export default FormResponse;
