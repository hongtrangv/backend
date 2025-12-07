const crypto = require('crypto');
const Logger = require('../utils/logger');

const auditLog = (req, res, next) => {
  const start = new Date();
  const { method, originalUrl } = req;
  const requestId = req.headers['x-request-id'] || crypto.randomBytes(8).toString('hex');
  
  // Create a new logger instance and attach it to the request
  req.logger = new Logger(requestId);

  res.on('finish', () => {
    const duration = new Date() - start;
    const { statusCode } = res;
    // Use the logger to log the request
    req.logger.info(`${method} ${originalUrl} ${statusCode} - ${duration}ms`);
  });

  next();
};

module.exports = auditLog;
