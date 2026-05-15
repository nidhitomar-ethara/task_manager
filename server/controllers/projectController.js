const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'Admin' }],
    });

    await project.populate('members.user', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects for current user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id,
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private (Member+)
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user is a member
    const isMember = project.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this project',
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin only)
exports.updateProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { name, description } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Delete all tasks associated with the project
    await Task.deleteMany({ project: req.params.id });

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Project and all associated tasks deleted',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Admin only)
exports.addMember = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { email, role = 'Member' } = req.body;
    const project = req.project;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User with this email not found',
      });
    }

    // Check if already a member
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project',
      });
    }

    // Add member
    project.members.push({ user: user._id, role });
    await project.save();

    await project.populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Admin only)
exports.removeMember = async (req, res, next) => {
  try {
    const project = req.project;
    const { userId } = req.params;

    // Cannot remove the owner
    if (project.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the project owner',
      });
    }

    // Find member index
    const memberIndex = project.members.findIndex(
      (m) => m.user.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this project',
      });
    }

    // Remove member
    project.members.splice(memberIndex, 1);
    await project.save();

    // Unassign any tasks assigned to the removed user
    await Task.updateMany(
      { project: project._id, assignedTo: userId },
      { assignedTo: null }
    );

    await project.populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change member role
// @route   PUT /api/projects/:id/members/:userId/role
// @access  Private (Admin only)
exports.changeMemberRole = async (req, res, next) => {
  try {
    const project = req.project;
    const { userId } = req.params;
    const { role } = req.body;

    if (!['Admin', 'Member'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be Admin or Member',
      });
    }

    // Cannot change owner's role
    if (project.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change the project owner\'s role',
      });
    }

    // Find and update member role
    const member = project.members.find(
      (m) => m.user.toString() === userId
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this project',
      });
    }

    member.role = role;
    await project.save();

    await project.populate('members.user', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};
