const DISPLAY_NAME = 'displayName';

const ClientPreferences = {
  getDisplayName() {
    return localStorage.getItem(DISPLAY_NAME) ?? undefined;
  },

  setDisplayName(displayName: string) {
    localStorage.setItem(DISPLAY_NAME, displayName);
  },

  hasDisplayName(): boolean {
    return Boolean(this.getDisplayName());
  },
};

export default ClientPreferences;
