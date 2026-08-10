const Notification = require("../models/Notification");

// GET /api/notifications/:userId  -> notification history/status for a user
const getNotificationsForUser = async (req, res) => {
  const notifications = await Notification.find({ userId: req.params.userId }).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, count: notifications.length, data: notifications });
};

module.exports = { getNotificationsForUser };
