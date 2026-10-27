// Creates an in-app notification. Failures never break the main request.
const Notification = require('../models/Notification');

module.exports = async (userId, message, link = '') => {
  try {
    await Notification.create({ userId, message, link });
  } catch (err) {
    console.error('Notification failed:', err.message);
  }
};
