const logger = require('../utils/logger');

const basicAuth = (req, res, next) => {
  // Lấy header 'Authorization'
  const authHeader = req.headers.authorization;

  // Kiểm tra xem header có tồn tại không
  if (!authHeader) {
    logger.warn('Missing Authorization Header');
    res.setHeader('WWW-Authenticate', 'Basic realm="restricted area"');
    return res.status(401).json({ message: 'Unauthorized: Missing credentials' });
  }

  // Header phải có định dạng "Basic <credentials>"
  const [authType, credentials] = authHeader.split(' ');

  if (authType !== 'Basic' || !credentials) {
    logger.warn('Invalid Authorization Header format');
    res.setHeader('WWW-Authenticate', 'Basic realm="restricted area"');
    return res.status(401).json({ message: 'Unauthorized: Invalid authentication format' });
  }

  // Giải mã thông tin xác thực từ base64
  const decodedCredentials = Buffer.from(credentials, 'base64').toString('utf8');
  const [username, password] = decodedCredentials.split(':');

  // Lấy username và password mong muốn từ biến môi trường
  const expectedUsername = process.env.API_USERNAME;
  const expectedPassword = process.env.API_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
      logger.error('API_USERNAME or API_PASSWORD not set in environment variables.');
      // Không tiết lộ chi tiết cấu hình máy chủ cho client
      return res.status(500).json({ message: 'Internal Server Error: Authentication not configured.' });
  }

  // So sánh thông tin xác thực
  if (username === expectedUsername && password === expectedPassword) {
    logger.info(`Authenticated user: ${username}`);
    // Nếu hợp lệ, cho phép yêu cầu đi tiếp
    return next();
  } else {
    logger.warn(`Failed authentication attempt for user: ${username}`);
    res.setHeader('WWW-Authenticate', 'Basic realm="restricted area"');
    return res.status(401).json({ message: 'Unauthorized: Invalid credentials' });
  }
};

module.exports = basicAuth;
