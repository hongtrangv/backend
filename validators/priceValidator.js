const { body, validationResult } = require('express-validator');

const validatePrice = [
  body('product_name').isString().notEmpty().withMessage('Product name must be a non-empty string'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),
  body('effective_date').isISO8601().toDate().withMessage('Invalid promotion date format'),
  body('quotingUnit').isString().notEmpty().withMessage('Quoting unit must be a non-empty string'),
  body('supplier').isString().notEmpty().withMessage('Supplier must be a non-empty string'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validatePrice };
