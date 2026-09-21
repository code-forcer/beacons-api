const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { publicPostLimiter } = require('../middleware/rateLimiter');
const ContactMessage = require('../models/ContactMessage');
const { sendContactNotification } = require('../utils/mailer');

const router = express.Router();

// POST /api/contact — public
router.post(
  '/',
  publicPostLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
    body('message').trim().notEmpty().withMessage('Message is required.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const message = await ContactMessage.create(req.body);
      sendContactNotification(message).catch((err) =>
        console.error('Mailer error (contact):', err.message)
      );
      res.status(201).json({
        success: true,
        message: 'Message received! We will get back to you soon.',
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
  }
);

// GET /api/contact — admin list
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [messages, total] = await Promise.all([
      ContactMessage.find().sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      ContactMessage.countDocuments(),
    ]);
    res.json({ success: true, data: messages, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
