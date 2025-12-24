const logger = require('../utils/logger');
const authService = require('../services/authService');
const asyncLocalStorage = require('../utils/context');

const basicAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.warn('Missing Authorization Header');
    res.setHeader('WWW-Authenticate', 'Basic realm="restricted area"');
    return res.status(401).json({ message: 'Unauthorized: Missing credentials' });
  }

  const [authType, credentials] = authHeader.split(' ');

  if (authType !== 'Basic' || !credentials) {
    logger.warn('Invalid Authorization Header format');
    res.setHeader('WWW-Authenticate', 'Basic realm="restricted area"');
    return res.status(401).json({ message: 'Unauthorized: Invalid authentication format' });
  }

  const decodedCredentials = Buffer.from(credentials, 'base64').toString('utf8');
  const [username, password] = decodedCredentials.split(':');

  try {
    const userContext = await authService.login(username, password);
    logger.info(`Authenticated user: ${username}`);
    
    // Store user context for the duration of the request
    asyncLocalStorage.run({ user: userContext }, () => {
      next();
    });
  } catch (error) {
    logger.warn(`Failed authentication attempt for user: ${username}. Reason: ${error.message}`);
    res.setHeader('WWW-Authenticate', 'Basic realm="restricted area"');
    return res.status(401).json({ message: `Unauthorized: ${error.message}` });
  }
};

module.exports = basicAuth;
