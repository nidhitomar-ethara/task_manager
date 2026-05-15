const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/taskController');
const auth = require('../middleware/auth');

router.get('/stats', auth, getDashboardStats);

module.exports = router;
