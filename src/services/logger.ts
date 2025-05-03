/**
 * Logger utility to standardize logging across the application
 * with different levels of granularity and environment-specific behavior.
 */

// Log levels from most to least severe
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

// Current log level based on environment
const currentLogLevel = process.env.NODE_ENV === 'production' 
  ? LogLevel.ERROR 
  : (process.env.REACT_APP_LOG_LEVEL 
    ? parseInt(process.env.REACT_APP_LOG_LEVEL) 
    : LogLevel.DEBUG);

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
}

/**
 * Format a log entry for consistent output
 */
const formatLogEntry = (level: string, message: string, data?: any): LogEntry => {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data && { data }),
  };
};

/**
 * Log error messages
 */
export const error = (message: string, data?: any): void => {
  if (currentLogLevel >= LogLevel.ERROR) {
    const entry = formatLogEntry('ERROR', message, data);
    console.error(`${entry.timestamp} [ERROR] ${entry.message}`, data ? entry.data : '');
    
    // In a production app, you might want to send critical errors to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: send to error tracking service
      // errorTrackingService.captureError(entry);
    }
  }
};

/**
 * Log warning messages
 */
export const warn = (message: string, data?: any): void => {
  if (currentLogLevel >= LogLevel.WARN) {
    const entry = formatLogEntry('WARN', message, data);
    console.warn(`${entry.timestamp} [WARN] ${entry.message}`, data ? entry.data : '');
  }
};

/**
 * Log informational messages
 */
export const info = (message: string, data?: any): void => {
  if (currentLogLevel >= LogLevel.INFO) {
    const entry = formatLogEntry('INFO', message, data);
    console.info(`${entry.timestamp} [INFO] ${entry.message}`, data ? entry.data : '');
  }
};

/**
 * Log debug messages (only in development)
 */
export const debug = (message: string, data?: any): void => {
  if (currentLogLevel >= LogLevel.DEBUG) {
    const entry = formatLogEntry('DEBUG', message, data);
    console.debug(`${entry.timestamp} [DEBUG] ${entry.message}`, data ? entry.data : '');
  }
};

export default {
  error,
  warn,
  info,
  debug,
  LogLevel
}; 