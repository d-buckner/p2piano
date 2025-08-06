const DISPLAY_NAME = 'displayName';

let tempDisplayName: string | null = null;

const ClientPreferences = {
  getUserDefinedDisplayName() {
    return localStorage.getItem(DISPLAY_NAME) ?? undefined;
  },

  getDisplayName() {
    const userDefinedDisplayName = this.getUserDefinedDisplayName();

    if (userDefinedDisplayName) {
      return userDefinedDisplayName;
    }

    if (!tempDisplayName) {
      tempDisplayName = `Player${Math.floor(Math.random() * 1000)}`;
    }

    return tempDisplayName;
  },

  setDisplayName(displayName: string) {
    localStorage.setItem(DISPLAY_NAME, displayName);
  },

  hasUserDefinedDisplayName(): boolean {
    return Boolean(this.getUserDefinedDisplayName());
  },
};

export default ClientPreferences;
