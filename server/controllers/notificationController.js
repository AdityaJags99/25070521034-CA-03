const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/notifications
exports.list = asyncHandler(async (req, res) => {
  const [notifications, unread] = await Promise.all([
    Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20),
    Notification.countDocuments({ userId: req.user._id, read: false }),
  ]);
  res.json({ notifications, unread });
});

// PATCH /api/notifications/read-all
exports.readAll = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
  res.json({ message: 'All notifications marked as read' });
});
