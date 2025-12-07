const asyncLocalStorage = require('./context');

class Logger {
  _log(level, message) {
    const store = asyncLocalStorage.getStore();
    const requestId = store ? store.requestId : 'N/A';
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${requestId}] [${level.toUpperCase()}] ${message}`);
  }

  info(message) {
    this._log('info', message);
  }

  warn(message) {
    this._log('warn', message);
  }

  error(message) {
    this._log('error', message);
  }
}

module.exports = new Logger(); // Export a single instance
