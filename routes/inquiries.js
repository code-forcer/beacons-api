const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { publicPostLimiter } = require('../middleware/rateLimiter');
const Inquiry = require('../models/Inquiry');
const { sendInquiryNotification } = require('../utils/mailer');

const router = express.Router();

// POST /api/inquiries — public, submit a quote request
router.post(
  '/',
  publicPostLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
    body('phone').trim().notEmpty().withMessage('Phone number is required.'),
    body('projectDescription').trim().notEmpty().withMessage('Project description is required.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const inquiry = await Inquiry.create(req.body);
      // Send email notification (non-blocking — don't fail the request if mail fails)
      sendInquiryNotification(inquiry).catch((err) =>
        console.error('Mailer error (inquiry):', err.message)
      );
      res.status(201).json({
        success: true,
        message: 'Your quote request has been received. We will be in touch shortly!',
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
  }
);

// GET /api/inquiries — admin list
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Inquiry.countDocuments(filter),
    ]);
    res.json({ success: true, data: inquiries, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PATCH /api/inquiries/:id/status — admin update status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'contacted', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    res.json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
