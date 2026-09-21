const express = require('express');
const { body, query, validationResult } = require('express-validator');
const slugify = require('slugify');
const auth = require('../middleware/auth');
const Project = require('../models/Project');

const router = express.Router();

// Helper
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return null;
};

// GET /api/projects — public list with filter & pagination
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    const filter = { isPublished: true };
    if (category && category !== 'all') filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [projects, total] = await Promise.all([
      Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Project.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: projects,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/projects/all — admin list (all, including unpublished)
router.get('/all', auth, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/projects/:slug — public single project
router.get('/:slug', async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug, isPublished: true });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    // Fetch related (same category, not same project, max 3)
    const related = await Project.find({
      category: project.category,
      _id: { $ne: project._id },
      isPublished: true,
    })
      .limit(3)
      .select('title slug category images description createdAt');

    res.json({ success: true, data: project, related });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/projects — admin create
router.post(
  '/',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('category').isIn([
      'general-contracting', 'general-merchandise', 'fabrication',
      'agricultural-machines', 'irrigation-systems', 'drying-heating-systems',
    ]).withMessage('Invalid category.'),
    body('description').trim().notEmpty().withMessage('Description is required.'),
  ],
  async (req, res) => {
    const err = handleValidation(req, res);
    if (err) return;
    try {
      const { title, category, description, specs, images, location, dateCompleted, isPublished } = req.body;
      let slug = slugify(title, { lower: true, strict: true });
      // Ensure uniqueness
      const existing = await Project.findOne({ slug });
      if (existing) slug = `${slug}-${Date.now()}`;

      const project = await Project.create({
        title, slug, category, description, specs, images, location, dateCompleted, isPublished,
      });
      res.status(201).json({ success: true, data: project });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

// PUT /api/projects/:id — admin update
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, ...rest } = req.body;
    const updateData = { ...rest };
    if (title) {
      updateData.title = title;
      let slug = slugify(title, { lower: true, strict: true });
      const existing = await Project.findOne({ slug, _id: { $ne: req.params.id } });
      if (existing) slug = `${slug}-${Date.now()}`;
      updateData.slug = slug;
    }
    const project = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/projects/:id — admin delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });
    res.json({ success: true, message: 'Project deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
