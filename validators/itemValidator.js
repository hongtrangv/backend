const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const response = new ApiResponse(res);
    const errorMessages = errors.array().map(error => error.msg);
    response.error(errorMessages, 422); // 422 Unprocessable Entity is a good choice here
  };
};

module.exports = validate;
