const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/tasks');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getAll);
router.post('/', requireAdmin, create);
router.patch('/:id', update);
router.delete('/:id', requireAdmin, remove);

module.exports = router;
