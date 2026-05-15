const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  changeMemberRole,
} = require('../controllers/projectController');
const {
  createProjectValidator,
  updateProjectValidator,
  addMemberValidator,
} = require('../validators/projectValidator');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Import task routes for nesting
const taskRoutes = require('./taskRoutes');

// Re-route to task routes: /api/projects/:projectId/tasks
router.use('/:projectId/tasks', taskRoutes);

// Project CRUD
router.post('/', auth, createProjectValidator, createProject);
router.get('/', auth, getProjects);
router.get('/:id', auth, getProject);
router.put('/:id', auth, roleCheck('Admin'), updateProjectValidator, updateProject);
router.delete('/:id', auth, roleCheck('Admin'), deleteProject);

// Member management
router.post('/:id/members', auth, roleCheck('Admin'), addMemberValidator, addMember);
router.delete('/:id/members/:userId', auth, roleCheck('Admin'), removeMember);
router.put('/:id/members/:userId/role', auth, roleCheck('Admin'), changeMemberRole);

module.exports = router;
