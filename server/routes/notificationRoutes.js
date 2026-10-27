const router = require('express').Router();
const { list, readAll } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', protect, list);
router.patch('/read-all', protect, readAll);

module.exports = router;
