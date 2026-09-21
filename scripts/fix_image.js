require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../models/Project');

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const proj = await Project.findOne({ title: 'Custom Cassava Processing Machine' });
    if (proj) {
      proj.images = [
        {
          url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80',
          alt: 'Cassava processing machine in workshop',
          isCover: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=800&q=80',
          alt: 'Workshop fabrication process',
          isCover: false,
        }
      ];
      await proj.save();
      console.log('Fixed Cassava project images');
    } else {
      console.log('Cassava project not found');
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

fix();
