const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  alt: { type: String, default: '' },
  isCover: { type: Boolean, default: false },
});

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true },
    category: {
      type: String,
      required: true,
      enum: [
        'general-contracting',
        'general-merchandise',
        'fabrication',
        'agricultural-machines',
        'irrigation-systems',
        'drying-heating-systems',
      ],
    },
    description: { type: String, required: true },
    specs: {
      materials: { type: String, default: '' },
      dimensions: { type: String, default: '' },
      capacity: { type: String, default: '' },
    },
    images: [imageSchema],
    location: { type: String, default: '' },
    dateCompleted: { type: Date },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
