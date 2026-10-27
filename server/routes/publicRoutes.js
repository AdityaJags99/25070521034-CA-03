const router = require('express').Router();
const { stats, contact } = require('../controllers/publicController');

router.get('/stats', stats);
router.post('/contact', contact);

module.exports = router;
