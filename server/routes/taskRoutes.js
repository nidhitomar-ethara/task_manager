const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :projectId
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  assignTask,
  deleteTask,
} = require('../controllers/taskController');
const {
  createTaskValidator,
  updateTaskValidator,
  updateStatusValidator,
  assignTaskValidator,
} = require('../validators/taskValidator');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
// Note: :projectId comes from the parent router (projectRoutes)

router.post('/', auth, roleCheck('Admin'), createTaskValidator, createTask);
router.get('/', auth, roleCheck('Admin', 'Member'), getTasks);
router.get('/:taskId', auth, roleCheck('Admin', 'Member'), getTask);
router.put('/:taskId', auth, roleCheck('Admin'), updateTaskValidator, updateTask);
router.patch('/:taskId/status', auth, roleCheck('Admin', 'Member'), updateStatusValidator, updateTaskStatus);
router.patch('/:taskId/assign', auth, roleCheck('Admin'), assignTaskValidator, assignTask);
router.delete('/:taskId', auth, roleCheck('Admin'), deleteTask);

module.exports = router;
