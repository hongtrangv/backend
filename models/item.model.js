const { body } = require('express-validator');

// Define validation rules for creating an item
const createItemRules = () => [
    body('name')
        .trim()
        .notEmpty().withMessage('Item name is required')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long')
        .escape(), // Sanitize input
    body('description')
        .optional()
        .trim()
        .escape(),
    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ gt: 0 }).withMessage('Price must be a positive number')
];

// Define validation rules for updating an item (fields are optional)
const updateItemRules = () => [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Item name cannot be empty if provided')
        .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long')
        .escape(),
    body('description')
        .optional()
        .trim()
        .escape(),
    body('price')
        .optional()
        .isFloat({ gt: 0 }).withMessage('Price must be a positive number if provided')
];

module.exports = {
    createItemRules,
    updateItemRules
};