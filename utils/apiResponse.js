const apiOk = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const apiError = (res, message = 'An error occurred', statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

module.exports = {
  apiOk,
  apiError,
};
