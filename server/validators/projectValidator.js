const { body } = require('express-validator');

exports.createProjectValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 100 })
    .withMessage('Project name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

exports.updateProjectValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Project name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
];

exports.addMemberValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Member email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('role')
    .optional()
    .isIn(['Admin', 'Member'])
    .withMessage('Role must be Admin or Member'),
];
