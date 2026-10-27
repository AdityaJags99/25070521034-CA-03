const router = require('express').Router();
const c = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', c.list);
router.post('/', protect, authorize('client'), c.create);
router.get('/mine', protect, authorize('client'), c.mine);         // above "/:id"
router.get('/hired', protect, authorize('freelancer'), c.hired);   // above "/:id"
router.get('/:id', c.getOne);
router.put('/:id', protect, authorize('client'), c.update);
router.delete('/:id', protect, authorize('client'), c.remove);
router.get('/:id/applications', protect, authorize('client'), c.applications);

module.exports = router;
