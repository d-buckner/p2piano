const Logger = {
  INFO(message: string) {
    console.info(`[INFO] ${message}`);
  },
  WARN(message: string) {
    console.warn(`[WARN] ${message}`);
  },
  ERROR(message: string) {
    console.warn(`[ERROR] ${message}`);
  }
}

export default Logger;