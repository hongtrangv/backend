class Logger {
  constructor(requestId) {
    this.requestId = requestId;
  }

  _log(level, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.requestId}] [${level.toUpperCase()}] ${message}`);
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

module.exports = Logger;
