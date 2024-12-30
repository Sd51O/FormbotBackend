// models/Share.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const shareSchema = new Schema({
  formbotId: {
    type: Schema.Types.ObjectId,
    ref: 'Formbot',
    required: true
  },
  shareToken: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export the Share model
const Share = mongoose.model('Share', shareSchema);

export default Share;
