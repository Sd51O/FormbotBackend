// models/FormAnalytics.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const formAnalyticsSchema = new Schema({
  formId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Form',
    unique: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  startCount: {
    type: Number,
    default: 0
  },
  completionCount: {
    type: Number,
    default: 0
  },
  averageCompletionTime: {
    type: Number,
    default: 0
  }
});

export default mongoose.model('FormAnalytics', formAnalyticsSchema);
