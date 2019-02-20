const winston = require('winston');

class Logger {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      defaultMeta: { service: 'user-service' },
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
      ]
    });
  }

  errorHandler(error) {
    this.logger.log({
      level: 'error',
      message: error
    });
  }

  consoleHandler(message) {
    this.logger.log({
      level: 'info',
      message: message
    });
  }
}

module.exports = Logger;