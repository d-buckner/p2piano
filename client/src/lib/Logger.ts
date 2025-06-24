const LOG_LEVEL = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  NONE: 'none',
} as const;


type LogMethod = Parameters<typeof console.log>[0];

const searchParams = new URLSearchParams(location.search);
// @ts-expect-error LOG_LEVEL isn't on window, this gets replaced at build time
const logLevel = searchParams.get('log') || window.LOG_LEVEL;
const infoLevels = new Set([LOG_LEVEL.DEBUG, LOG_LEVEL.INFO]);
const noop = () => { };

const Logger = {
  get DEBUG() {
    return getLogMethod(console.debug, logLevel === LOG_LEVEL.DEBUG);
  },
  get INFO() {
    return getLogMethod(console.info, infoLevels.has(logLevel));
  },
  get WARN() {
    return getLogMethod(console.warn, logLevel !== LOG_LEVEL.ERROR);
  },
  get ERROR() {
    return getLogMethod(console.error);
  }
};

function getLogMethod(
  method: LogMethod,
  enabled: boolean = true) {
  return enabled && logLevel !== LOG_LEVEL.NONE
    ? method
    : noop;
}

export default Logger;

