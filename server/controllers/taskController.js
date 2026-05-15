const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create a task in a project
// @route   POST /api/projects/:projectId/tasks
// @access  Private (Admin only)
exports.createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { title, description, priority, dueDate, assignedTo } = req.body;

    // If assigning, verify user is a project member
    if (assignedTo) {
      const project = req.project;
      const isMember = project.members.some(
        (m) => m.user.toString() === assignedTo
      );
      if (!isMember) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user must be a project member',
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      project: req.params.projectId,
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
      priority,
      dueDate,
    });

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks in a project
// @route   GET /api/projects/:projectId/tasks
// @access  Private (Member+)
exports.getTasks = async (req, res, next) => {
  try {
    const { status, priority, assignedTo } = req.query;

    // Build filter
    const filter = { project: req.params.projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/projects/:projectId/tasks/:taskId
// @access  Private (Member+)
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      project: req.params.projectId,
    })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/projects/:projectId/tasks/:taskId
// @access  Private (Admin only)
exports.updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { title, description, priority, dueDate } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, project: req.params.projectId },
      updateData,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status
// @route   PATCH /api/projects/:projectId/tasks/:taskId/status
// @access  Private (Member+ — assigned user or Admin)
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { status } = req.body;

    const task = await Task.findOne({
      _id: req.params.taskId,
      project: req.params.projectId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Members can only update status of tasks assigned to them
    if (req.userRole === 'Member') {
      if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update status of tasks assigned to you',
        });
      }
    }

    task.status = status;
    await task.save();

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Task status updated',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign task to a member
// @route   PATCH /api/projects/:projectId/tasks/:taskId/assign
// @access  Private (Admin only)
exports.assignTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { assignedTo } = req.body;

    // Verify assigned user is a project member
    const project = req.project;
    const isMember = project.members.some(
      (m) => m.user.toString() === assignedTo
    );

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: 'User must be a project member to be assigned tasks',
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.taskId, project: req.params.projectId },
      { assignedTo },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task assigned successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/projects/:projectId/tasks/:taskId
// @access  Private (Admin only)
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.taskId,
      project: req.params.projectId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get all projects the user is a member of
    const projects = await Project.find({
      'members.user': req.user._id,
    });

    const projectIds = projects.map((p) => p._id);

    // Get all tasks across user's projects
    const allTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'name');

    // Stats
    const totalTasks = allTasks.length;
    const todoTasks = allTasks.filter((t) => t.status === 'To Do').length;
    const inProgressTasks = allTasks.filter((t) => t.status === 'In Progress').length;
    const doneTasks = allTasks.filter((t) => t.status === 'Done').length;

    // Overdue tasks (due date past, not done)
    const now = new Date();
    const overdueTasks = allTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done'
    );

    // Tasks assigned to current user
    const myTasks = allTasks.filter(
      (t) => t.assignedTo && t.assignedTo._id.toString() === req.user._id.toString()
    );

    res.status(200).json({
      success: true,
      data: {
        totalProjects: projects.length,
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueTasks: overdueTasks.length,
        overdueTasksList: overdueTasks,
        myTasks,
        recentProjects: projects.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};
