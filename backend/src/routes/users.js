const express = require('express');
const router = express.Router();
const { getAll, updateRole } = require('../controllers/users');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getAll);
router.patch('/:id/role', requireAdmin, updateRole);

module.exports = router;
