const crypto = require('crypto');
const asyncLocalStorage = require('../utils/context');
const logger = require('../utils/logger');

const auditLog = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomBytes(8).toString('hex');
  const store = { requestId };

  asyncLocalStorage.run(store, () => {
    const start = new Date();
    const { method, originalUrl } = req;

    // 1. Log khi bắt đầu xử lý yêu cầu
    logger.info(`BEGIN ${method} ${originalUrl} | Request Start`);

    res.on('finish', () => {
      // Callback 'finish' chạy bên ngoài ngữ cảnh không đồng bộ ban đầu.
      // Chúng ta cần chạy lại bên trong ngữ cảnh để đảm bảo requestId có sẵn cho logger.
      asyncLocalStorage.run(store, () => {
        const duration = new Date() - start;
        const { statusCode } = res;
        // 2. Log khi kết thúc yêu cầu
        logger.info(`END ${method} ${originalUrl} | ${statusCode} | ${duration}ms | Request End`);
      });
    });

    next();
  });
};

module.exports = auditLog;
