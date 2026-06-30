const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Issue = require('../models/Issue');
const { protect, adminOnly } = require('../middleware/auth');

// @route  POST /api/issues
// @desc   Citizen creates a new issue
// @access Private (citizen)
router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category')
      .isIn(['Road', 'Water', 'Electricity', 'Garbage'])
      .withMessage('Category must be Road, Water, Electricity, or Garbage'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, category, photoURL, location } = req.body;

    try {
      const issue = await Issue.create({
        title,
        description,
        category,
        photoURL: photoURL || null,
        location: location || { lat: null, lng: null, address: '' },
        submittedBy: req.user._id,
      });

      const populated = await issue.populate('submittedBy', 'name email');
      res.status(201).json({ success: true, issue: populated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route  GET /api/issues/mine
// @desc   Get issues submitted by the logged-in citizen
// @access Private (citizen)
router.get('/mine', protect, async (req, res) => {
  try {
    const issues = await Issue.find({ submittedBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('submittedBy', 'name email');

    res.status(200).json({ success: true, count: issues.length, issues });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route  GET /api/issues/analytics
// @desc   Admin analytics: counts by category, status, avg resolution time
// @access Private (admin)
router.get('/analytics', protect, adminOnly, async (req, res) => {
  try {
    // Issues by category
    const byCategory = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Issues by status
    const byStatus = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Issues over time (last 30 days, grouped by day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const overTime = await Issue.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Average resolution time (in hours) for resolved issues
    const resolutionData = await Issue.aggregate([
      {
        $match: {
          status: 'Resolved',
          resolvedAt: { $ne: null },
        },
      },
      {
        $project: {
          resolutionTimeHours: {
            $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 3600000],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionHours: { $avg: '$resolutionTimeHours' },
          totalResolved: { $sum: 1 },
        },
      },
    ]);

    const totalIssues = await Issue.countDocuments();

    res.status(200).json({
      success: true,
      analytics: {
        totalIssues,
        byCategory,
        byStatus,
        overTime,
        avgResolutionHours: resolutionData[0]?.avgResolutionHours
          ? Math.round(resolutionData[0].avgResolutionHours)
          : null,
        totalResolved: resolutionData[0]?.totalResolved || 0,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route  GET /api/issues
// @desc   Admin gets all issues with optional filters
// @access Private (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { category, status, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const total = await Issue.countDocuments(filter);
    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('submittedBy', 'name email');

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      issues,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route  GET /api/issues/:id
// @desc   Get single issue by ID
// @access Private
router.get('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('submittedBy', 'name email');
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    // Citizens can only see their own issues
    if (req.user.role === 'citizen' && issue.submittedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, issue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route  PATCH /api/issues/:id/status
// @desc   Admin updates issue status
// @access Private (admin)
router.patch(
  '/:id/status',
  protect,
  adminOnly,
  [
    body('status')
      .isIn(['Open', 'In Progress', 'Resolved'])
      .withMessage('Status must be Open, In Progress, or Resolved'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const issue = await Issue.findById(req.params.id);
      if (!issue) {
        return res.status(404).json({ success: false, message: 'Issue not found' });
      }

      issue.status = req.body.status;
      await issue.save();

      const updated = await issue.populate('submittedBy', 'name email');
      res.status(200).json({ success: true, issue: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

module.exports = router;
