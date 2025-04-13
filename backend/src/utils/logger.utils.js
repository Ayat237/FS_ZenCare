import winston from "winston";


// Define log levels and colors for console output
const logLevels = {
    error: 0,
    warn: 1,
    info: 2, // default
    debug: 3,
  };

export class Logger {
  constructor() {
    this.logger = winston.createLogger({
      levels: logLevels,
      format: winston.format.combine(
        winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        // Console transport for development
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'prod' ? 'info' : 'debug',
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        // File transport for errors (production)
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // File transport for all logs (production)
        new winston.transports.File({
          filename: 'logs/combined.log',
          level: 'info',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });
  }

  // Encapsulated methods for logging
  error(message, meta = {}) {
    this.logger.error({ message, ...meta });
  }

  warn(message, meta = {}) {
    this.logger.warn({ message, ...meta });
  }

  info(message, meta = {}) {
    this.logger.info({ message, ...meta });
  }

  debug(message, meta = {}) {
    this.logger.debug({ message, ...meta });
  }
}

// Singleton instance for the application
export const logger = new Logger();




