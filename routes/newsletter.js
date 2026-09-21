const express = require('express');
const { body, validationResult } = require('express-validator');
const { newsletterLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth');
const Subscriber = require('../models/Subscriber');

const router = express.Router();

// POST /api/newsletter/subscribe — public
router.post(
  '/subscribe',
  newsletterLimiter,
  [body('email').isEmail().withMessage('Valid email is required.').normalizeEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const { email, source = 'website' } = req.body;
      // Dedupe
      const existing = await Subscriber.findOne({ email });
      if (existing) {
        return res.status(200).json({ success: true, message: 'You are already subscribed!' });
      }
      await Subscriber.create({ email, source });
      res.status(201).json({ success: true, message: 'Successfully subscribed! Welcome aboard.' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
  }
);

// GET /api/newsletter — admin list
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [subscribers, total] = await Promise.all([
      Subscriber.find().sort({ subscribedAt: -1 }).skip(skip).limit(parseInt(limit)),
      Subscriber.countDocuments(),
    ]);
    res.json({ success: true, data: subscribers, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
