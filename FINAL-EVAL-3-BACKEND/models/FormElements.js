// models/FormElement.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const formElementSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['text-bubble', 'image-bubble', 'video-bubble', 'gif-bubble', 
           'text-input', 'number-input', 'email-input', 'phone-input', 
           'date-input', 'rating-input', 'button-input']
  },
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    required: true
  },
  required: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    required: true
  },
  formbot: {
    type: Schema.Types.ObjectId,
    ref: 'Formbot',
    required: true
  }
}, { timestamps: true });

const FormElement = mongoose.model('FormElement', formElementSchema);

export default FormElement;
