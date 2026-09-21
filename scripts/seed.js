require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

const AdminUser = require('../models/AdminUser');
const Project = require('../models/Project');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@beaconsagro.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'BeaconsAdmin2026!';

// Authentic indigenous projects seeded with web-safe images exclusively from public/images/Beacons-project-images/
const sampleProjects = [
  {
    title: 'Industrial Yam Pounding Machine (150kg/hr)',
    category: 'fabrication',
    description:
      'Heavy-duty commercial yam pounding machine designed and fabricated in our Akure workshop. Built with food-grade stainless steel contact parts and high-torque electric motor for commercial kitchens, hotels, and caterers.',
    fullDescription:
      'Designed and engineered locally in Akure by Beacons Agro & Industrial Engineering Ltd., this high-capacity Yam Pounding Machine automates commercial yam processing for hotels, restaurants, institutions, and catering facilities. The unit features heavy food-grade stainless steel contact parts, an unyielding structural chassis, and a heavy-duty gearbox that delivers smooth, lump-free pounded yam in minutes without manual effort.',
    specs: [
      { key: 'Materials', value: 'Food-grade stainless steel drum, carbon steel frame' },
      { key: 'Capacity', value: '150kg / hour (batch size: 15–20kg)' },
      { key: 'Power Requirement', value: '7.5HP 3-Phase Electric Motor / Heavy Gearbox' },
      { key: 'Dimensions', value: '1.4m × 0.8m × 1.2m' },
    ],
    images: [
      {
        url: '/images/Beacons-project-images/yam-pounding-machine-1.jpg',
        alt: 'Industrial Yam Pounding Machine side profile',
        isCover: true,
      },
      {
        url: '/images/Beacons-project-images/yam-pounding-machine-2.jpg',
        alt: 'Yam pounding chamber detail',
        isCover: false,
      },
    ],
    location: 'Akure, Ondo State',
    dateCompleted: new Date('2026-08-15'),
    client: 'Commercial Food & Hospitality Operators',
    isPublished: true,
  },
  {
    title: '200kg Industrial Rice Parboiler & Vessel',
    category: 'drying-heating-systems',
    description:
      'Custom fabricated 200kg capacity rice parboiling and pre-steaming vessel featuring insulated double-wall cladding and uniform steam distribution manifolds.',
    fullDescription:
      'Fabricated specifically to eliminate paddy chalkiness and improve rice milling recovery rates, the Beacons 200kg Industrial Rice Parboiler provides precise thermal treatment for commercial rice processors across Nigeria. Constructed with a heavy-gauge inner vessel, calibrated steam manifold, and thermal insulation layer.',
    specs: [
      { key: 'Vessel Capacity', value: '200kg paddy rice per batch' },
      { key: 'Construction', value: 'Stainless steel inner drum, heavy steel outer jacket' },
      { key: 'Cycle Time', value: '45–60 minutes per batch' },
    ],
    images: [
      {
        url: '/images/Beacons-project-images/rice-parboiler-1.jpg',
        alt: '200kg Industrial Rice Parboiler Vessel',
        isCover: true,
      },
    ],
    location: 'Ondo State, Nigeria',
    dateCompleted: new Date('2026-07-20'),
    client: 'Rice Milling & Processing Cooperative',
    isPublished: true,
  },
  {
    title: 'Palm Kernel Digester, Oil Extractor & Shaft Separator',
    category: 'agricultural-machines',
    description:
      'Integrated palm kernel oil extraction system including kernel digester, mechanical screw oil press, and pneumatic shaft separator.',
    fullDescription:
      'Complete palm kernel oil (PKO) processing plant engineered and assembled by Beacons Engineering. Takes cracked palm kernels through heating/digesting, mechanical screw pressing, and pneumatic shaft separation.',
    specs: [
      { key: 'Processing Capacity', value: '500kg kernel / hour' },
      { key: 'Plant Components', value: 'Kernel Digester, Screw Press Extractor, Shaft Separator' },
      { key: 'Drive Mechanism', value: 'Heavy industrial motor & reduction gearbox' },
    ],
    images: [
      {
        url: '/images/Beacons-project-images/palm-fruit-digester.jpeg',
        alt: 'Palm Fruit & Kernel Digester Unit',
        isCover: true,
      },
      {
        url: '/images/Beacons-project-images/palm-kernel-oil-extractor.jpeg',
        alt: 'Palm Kernel Oil Extractor Press',
        isCover: false,
      },
      {
        url: '/images/Beacons-project-images/palm-kernel-shaft-separator.jpeg',
        alt: 'Palm Kernel Shaft Separator',
        isCover: false,
      },
      {
        url: '/images/Beacons-project-images/palm-oil-clarifier-1.jpeg',
        alt: 'Palm Oil Clarifier Tank 1',
        isCover: false,
      },
      {
        url: '/images/Beacons-project-images/palm-oil-clarifier-2.jpeg',
        alt: 'Palm Oil Clarifier Tank 2',
        isCover: false,
      },
      {
        url: '/images/Beacons-project-images/palm-fruit-sterilizer-side.jpeg',
        alt: 'Palm Fruit Sterilizer Side Profile',
        isCover: false,
      },
    ],
    location: 'Owo, Ondo State',
    dateCompleted: new Date('2026-06-10'),
    client: 'Agro-Allied Oil Mill Producers',
    isPublished: true,
  },
  {
    title: 'Manual Interlocking Brick & Paving Molding Press',
    category: 'fabrication',
    description:
      'Lever-action manual interlocking soil-cement brick press designed for durable brick and paving block production without electricity.',
    fullDescription:
      'Engineered for maximum soil compression, the Beacons Manual Interlocking Brick Molding Machine allows block makers, property developers, and NGOs to produce high-density interlocking bricks directly on site using compressed stabilized earth soil.',
    specs: [
      { key: 'Daily Output', value: '800 – 1,200 interlocking bricks / day' },
      { key: 'Compaction Method', value: 'Manual double-lever mechanical press' },
      { key: 'Mold Types', value: 'Interlocking wall brick & paving block dies' },
    ],
    images: [
      {
        url: '/images/Beacons-project-images/brick-molding-machine-1.jpg',
        alt: 'Manual Interlocking Brick Molding Machine',
        isCover: true,
      },
      {
        url: '/images/Beacons-project-images/brick-molding-machine-2.jpg',
        alt: 'Brick Machine Lever Arm',
        isCover: false,
      },
      {
        url: '/images/Beacons-project-images/brick-molding-machine-3.jpg',
        alt: 'Mold Box and Compression Plate',
        isCover: false,
      },
      {
        url: '/images/Beacons-project-images/brick-molding-machine-4.jpg',
        alt: 'Brick Machine Profile View',
        isCover: false,
      },
      {
        url: '/images/Beacons-project-images/brick-molding-machine-5.jpg',
        alt: 'Completed Brick Machine Assembly',
        isCover: false,
      },
    ],
    location: 'Akure, Ondo State',
    dateCompleted: new Date('2026-05-18'),
    client: 'Building Contractors & Earth Block Producers',
    isPublished: true,
  },
  {
    title: 'High-Capacity Maize Dehusker & Sheller',
    category: 'agricultural-machines',
    description:
      'Dual-action maize husking and threshing unit equipped with an adjustable concave drum and high-velocity chaff ejection fan.',
    fullDescription:
      'The Beacons Maize Dehusker & Sheller combines husk stripping and grain threshing into a single continuous pass. Built with heat-treated pegs, heavy-duty pulleys, and an integrated blower fan.',
    specs: [
      { key: 'Capacity', value: '1,500 – 2,000kg / hour' },
      { key: 'Power Options', value: '10HP Diesel Engine or 7.5HP Electric Motor' },
      { key: 'Shelling Efficiency', value: '98.5%' },
    ],
    images: [
      {
        url: '/images/Beacons-project-images/maize-dehusker-sheller.jpeg',
        alt: 'High Capacity Maize Dehusker and Sheller Machine',
        isCover: true,
      },
    ],
    location: 'Ibadan, Oyo State',
    dateCompleted: new Date('2026-04-30'),
    client: 'Commercial Grain Farmers',
    isPublished: true,
  },
  {
    title: 'Multipurpose Soybean & Grain Shelling Machine',
    category: 'agricultural-machines',
    description:
      'Precision legume thresher and winnower engineered specifically for soybean, cowpea, and bean grain processing.',
    fullDescription:
      'Engineered to solve post-harvest bean threshing bottlenecks, this multipurpose sheller gently strips soybeans and cowpeas from pods without splitting seed coats.',
    specs: [
      { key: 'Capacity', value: '800kg soybean / hour' },
      { key: 'Purity Level', value: '96% clean grain yield' },
    ],
    images: [
      {
        url: '/images/Beacons-project-images/soybean-shelling-machine.jpeg',
        alt: 'Soybean Shelling Machine',
        isCover: true,
      },
    ],
    location: 'Osogbo, Osun State',
    dateCompleted: new Date('2026-04-12'),
    client: 'Legume Farmers Association',
    isPublished: true,
  },
  {
    title: 'Heavy-Duty Stainless Steel Catering Transport Trolley',
    category: 'general-merchandise',
    description:
      'Custom fabricated multi-shelf stainless steel food service and transport trolley with lockable heavy-duty swivel casters.',
    fullDescription:
      'Hand-crafted from industrial grade food-safe stainless steel, this 3-tier catering trolley is engineered for heavy transport duties in hotel kitchens, event centers, hospitals, and bakeries.',
    specs: [
      { key: 'Material Grade', value: 'Food-Grade 304 Stainless Steel' },
      { key: 'Shelving', value: '3-tier deep rim tray shelves' },
      { key: 'Load Rating', value: '250kg total load capacity' },
    ],
    images: [
      {
        url: '/images/Beacons-project-images/catering-trolley.jpeg',
        alt: 'Stainless Steel Catering Trolley',
        isCover: true,
      },
    ],
    location: 'Akure, Ondo State',
    dateCompleted: new Date('2026-03-25'),
    client: 'Event Catering & Hospitality Firm',
    isPublished: true,
  },
  {
    title: 'Custom Structural Steel Security Gates & Access Doors',
    category: 'general-contracting',
    description:
      'Heavy-gauge architectural steel double security gates and pedestrian access door systems fabricated for commercial facilities.',
    fullDescription:
      'Precision welded structural steel gate and security door installation delivered for industrial warehouse facilities. Built using thick structural hollow sections and anti-pry lock boxes.',
    specs: [
      { key: 'Materials', value: 'Heavy structural hollow section (HSS) tubes & sheet steel' },
      { key: 'Coating', value: 'Zinc chromate anti-rust primer + industrial enamel' },
    ],
    images: [
      {
        url: '/images/Beacons-project-images/iron-security-door.jpeg',
        alt: 'Custom Steel Security Gate & Access Door',
        isCover: true,
      },
    ],
    location: 'Akure, Ondo State',
    dateCompleted: new Date('2026-03-10'),
    client: 'Commercial Logistics & Warehouse Facility',
    isPublished: true,
  },
  {
    title: 'Heavy Machine Chassis & Industrial Metal Workshop Builds',
    category: 'fabrication',
    description:
      'Custom precision steel framing, lathe machining, structural welding, and heavy machinery bed fabrication at our Akure workshop.',
    fullDescription:
      'A showcase of custom industrial engineering capabilities at Beacons Agro & Industrial Engineering Ltd in Akure. Our workshop handles structural I-beam cutting, lathe shaft turning, CNC metal shearing, and MIG welding for custom machine bases.',
    specs: [
      { key: 'Machining Capabilities', value: 'Lathe turning, milling, heavy plasma cutting & MIG welding' },
      { key: 'Raw Materials', value: 'Mild steel, stainless steel, cast iron & alloy steel shafts' },
    ],
    images: [
      {
        url: '/images/Beacons-project-images/project-workshop-1.jpeg',
        alt: 'Industrial Machine Fabrication Site',
        isCover: true,
      },
      {
        url: '/images/Beacons-project-images/project-assembly-2.jpeg',
        alt: 'Machinery Installation & Piping',
        isCover: false,
      },
      {
        url: '/images/Beacons-project-images/cassava-grater.jpg',
        alt: 'Cassava Grater Unit',
        isCover: false,
      },
      {
        url: '/images/Beacons-project-images/cassava-mash-pulverizer-sifter.jpg',
        alt: 'Cassava Mash Pulverizer Sifter',
        isCover: false,
      },
      {
        url: '/images/Beacons-project-images/workshop-machine-chassis.jpeg',
        alt: 'Metal Component Assembly',
        isCover: false,
      },
    ],
    location: 'Akure Workshop, Ondo State',
    dateCompleted: new Date('2026-02-28'),
    client: 'Industrial Equipment & Plant Clients',
    isPublished: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // ── Seed admin user ───────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await AdminUser.deleteMany({}); // Reset AdminUser collection so only the official email exists
    await AdminUser.create({ email: ADMIN_EMAIL.toLowerCase(), passwordHash, role: 'admin' });
    console.log(`✅ Admin user created/updated: ${ADMIN_EMAIL}`);

    // Clear old records to ensure clean web-safe URLs are stored
    await Project.deleteMany({});
    console.log('🧹 Cleared existing Project collection for clean web-safe URL re-seed.');

    for (const projectData of sampleProjects) {
      const slug = slugify(projectData.title, { lower: true, strict: true });
      await Project.create({ ...projectData, slug });
      console.log(`✅ Seeded project with clean images: ${projectData.title}`);
    }

    console.log('\n🎉 Seed complete! All indigenous project photos successfully saved to MongoDB database with 100% web-safe URLs.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
