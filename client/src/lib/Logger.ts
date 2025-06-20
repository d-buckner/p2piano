const LOG_LEVEL = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  NONE: 'none',
} as const;

const infoLevels = new Set([LOG_LEVEL.DEBUG, LOG_LEVEL.INFO]);

const noop = () => { };

const Logger = {
  get DEBUG() {
    // @ts-expect-error
    return getLogMethod(console.debug, window.LOG_LEVEL === LOG_LEVEL.DEBUG);
  },
  get INFO() {
    // @ts-expect-error
    return getLogMethod(console.info, infoLevels.has(window.LOG_LEVEL));
  },
  get WARN() {
    // @ts-expect-error
    return getLogMethod(console.warn, window.LOG_LEVEL !== LOG_LEVEL.ERROR);
  },
  get ERROR() {
    return getLogMethod(console.error);
  }
};

function getLogMethod(method: Function, enabled: boolean = true) {
  // @ts-ignore
  return enabled && window.LOG_LEVEL !== LOG_LEVEL.NONE
    ? method
    : noop;
}

export default Logger;

