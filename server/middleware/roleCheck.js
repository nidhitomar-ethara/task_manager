const Project = require('../models/Project');

// Check if user has required role in a project
const roleCheck = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id || req.params.projectId;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Project ID is required',
        });
      }

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      // Find user's membership in the project
      const membership = project.members.find(
        (m) => m.user.toString() === req.user._id.toString()
      );

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this project',
        });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        });
      }

      // Attach project and user's role to request for downstream use
      req.project = project;
      req.userRole = membership.role;

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions',
      });
    }
  };
};

module.exports = roleCheck;
