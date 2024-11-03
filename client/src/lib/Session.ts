const SESSION_ID_KEY = 'sessionId';

export default class Session {
  private constructor() {}

  static getSessionId() {
    return sessionStorage.getItem(SESSION_ID_KEY);
  }

  static setSessionId(sessionId: string) {
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
}