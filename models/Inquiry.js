const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    companyName: { type: String, trim: true, default: '' },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    serviceNeeded: {
      type: String,
      enum: [
        'general-contracting',
        'general-merchandise',
        'fabrication',
        'agricultural-machines',
        'irrigation-systems',
        'drying-heating-systems',
        '',
      ],
      default: '',
    },
    projectDescription: { type: String, required: true },
    location: { type: String, default: '' },
    budgetRange: { type: String, default: '' },
    referenceImageUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);
