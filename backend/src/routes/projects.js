const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/projects');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', requireAdmin, create);
router.put('/:id', requireAdmin, update);
router.delete('/:id', requireAdmin, remove);

module.exports = router;
