const router = require('express').Router();
const c = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('freelancer'), c.create);
router.get('/my', protect, authorize('freelancer'), c.my);
router.patch('/:id/status', protect, authorize('client'), c.updateStatus);

module.exports = router;
