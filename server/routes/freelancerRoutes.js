const router = require('express').Router();
const { list, getOne, updateProfile } = require('../controllers/freelancerController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', list);
router.put('/profile', protect, updateProfile); // must be above "/:id"
router.get('/:id', optionalAuth, getOne);

module.exports = router;
