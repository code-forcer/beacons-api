const express = require('express');
const { body, validationResult } = require('express-validator');
const slugify = require('slugify');
const auth = require('../middleware/auth');
const BlogPost = require('../models/BlogPost');

const router = express.Router();

// GET /api/blog — public list
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [posts, total] = await Promise.all([
      BlogPost.find({ isPublished: true })
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-content'),
      BlogPost.countDocuments({ isPublished: true }),
    ]);
    res.json({ success: true, data: posts, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/blog/all — admin list all
router.get('/all', auth, async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 }).select('-content');
    res.json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/blog/:slug — public single post
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, isPublished: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/blog — admin create
router.post(
  '/',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title is required.'),
    body('content').trim().notEmpty().withMessage('Content is required.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const { title, content, excerpt, coverImage, tags, isPublished } = req.body;
      let slug = slugify(title, { lower: true, strict: true });
      const existing = await BlogPost.findOne({ slug });
      if (existing) slug = `${slug}-${Date.now()}`;

      const post = await BlogPost.create({
        title, slug, content, excerpt, coverImage, tags,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
      });
      res.status(201).json({ success: true, data: post });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

// PUT /api/blog/:id — admin update
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, isPublished, ...rest } = req.body;
    const update = { ...rest, isPublished };
    if (title) {
      update.title = title;
      let slug = slugify(title, { lower: true, strict: true });
      const existing = await BlogPost.findOne({ slug, _id: { $ne: req.params.id } });
      if (existing) slug = `${slug}-${Date.now()}`;
      update.slug = slug;
    }
    const current = await BlogPost.findById(req.params.id);
    if (isPublished && !current?.isPublished) update.publishedAt = new Date();

    const post = await BlogPost.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/blog/:id — admin delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
