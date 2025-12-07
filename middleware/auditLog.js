const crypto = require('crypto');
const asyncLocalStorage = require('../utils/context');
const logger = require('../utils/logger');

const auditLog = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomBytes(8).toString('hex');
  
  asyncLocalStorage.run({ requestId }, () => {
    const start = new Date();
    const { method, originalUrl } = req;

    res.on('finish', () => {
      const duration = new Date() - start;
      const { statusCode } = res;
      logger.info(`${method} ${originalUrl} ${statusCode} - ${duration}ms`);
    });
    next();
  });
};

module.exports = auditLog;
