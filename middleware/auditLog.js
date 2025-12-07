const crypto = require('crypto');
const asyncLocalStorage = require('../utils/context');
const logger = require('../utils/logger');

const auditLog = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomBytes(8).toString('hex');
  
  asyncLocalStorage.run({ requestId }, () => {
    const start = new Date();
    const { method, originalUrl } = req;

    // 1. Log khi bắt đầu xử lý yêu cầu
    logger.info(`BEGIN ${method} ${originalUrl} | Request Start`);

    res.on('finish', () => {
      const duration = new Date() - start;
      const { statusCode } = res;
      // 2. Log khi kết thúc yêu cầu (đã bao gồm status code và thời gian xử lý)
      logger.info(`END ${method} ${originalUrl} | ${statusCode} | ${duration}ms | Request End`);
    });

    next();
  });
};

module.exports = auditLog;
