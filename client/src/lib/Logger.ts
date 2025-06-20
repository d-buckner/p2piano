const LOG_LEVEL = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  NONE: 'none',
} as const;


const infoLevels = new Set([LOG_LEVEL.DEBUG, LOG_LEVEL.INFO]);

const Logger = {
  DEBUG(message: string) {
    // @ts-expect-error
    if (window.LOG_LEVEL === LOG_LEVEL.DEBUG) {
      console.debug(`[DEBUG]: ${message}`);
    }
  },
  INFO(message: string) {
  // @ts-expect-error
    if (infoLevels.has(window.LOG_LEVEL)) {
      console.info(`[INFO] ${message}`);
    }
  },
  WARN(message: string) {
    // @ts-expect-error
    if (window.LOG_LEVEL !== LOG_LEVEL.ERROR) {
      console.warn(`[WARN] ${message}`);
    }
  },
  ERROR(message: string) {
    // @ts-expect-error
    if (window.LOG_LEVEL !== LOG_LEVEL.NONE) {
      console.error(`[ERROR] ${message}`);
    }
  }
}

export default Logger;