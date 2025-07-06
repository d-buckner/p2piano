type KeyHandler = (midi: number) => void;

const KEY_MAP: Record<string, number> = {
  a: 60,
  w: 61,
  s: 62,
  e: 63,
  d: 64,
  f: 65,
  t: 66,
  g: 67,
  y: 68,
  h: 69,
  u: 70,
  j: 71,
  k: 72,
  o: 73,
  l: 74,
  p: 75,
  ';': 76,
  "'": 77,
  A: 60,
  W: 61,
  S: 62,
  E: 63,
  D: 64,
  F: 65,
  T: 66,
  G: 67,
  Y: 68,
  H: 69,
  U: 70,
  J: 71,
  K: 72,
  O: 73,
  L: 74,
  P: 75,
  ':': 76,
  '"': 77,
};

export default class KeyboardController {
  private static instance?: KeyboardController;
  private onKeyDown?: KeyHandler;
  private onKeyUp?: KeyHandler;
  private activeMidi = new Set<number>();

  static getInstance(): KeyboardController {
    if (!KeyboardController.instance) {
      KeyboardController.instance = new KeyboardController();
    }

    return KeyboardController.instance;
  }

  private constructor() {
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onKeyRelease = this.onKeyRelease.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    window.addEventListener('keydown', this.onKeyPress);
    window.addEventListener('keyup', this.onKeyRelease);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  registerKeyDownHandler(onKeyDown: KeyHandler) {
    this.onKeyDown = onKeyDown;
  }

  registerKeyUpHandler(onKeyUp: KeyHandler) {
    this.onKeyUp = onKeyUp;
  }

  private onVisibilityChange() {
    if (document.hidden) {
      this.activeMidi.forEach(midi => {
        this.onKeyUp?.(midi);
      });
    }
  }

  private onKeyPress(e: KeyboardEvent) {
    const midi = KEY_MAP[e.key];
    const hasModifier = e.metaKey || e.shiftKey || e.altKey;
    const { activeElement } = document;
    const hasActiveBlockingElement = activeElement?.tagName === 'SELECT';
    if (hasActiveBlockingElement
      || hasModifier
      || !this.onKeyDown
      || midi === undefined
      || this.activeMidi.has(midi)
    ) {
      return;
    }

    e.preventDefault();
    this.activeMidi.add(midi);
    this.onKeyDown(midi);
  }

  private onKeyRelease(e: KeyboardEvent) {
    const midi = KEY_MAP[e.key];
    if (!this.onKeyUp || midi === undefined) {
      return;
    }

    this.activeMidi.delete(midi);
    this.onKeyUp(midi);
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyPress);
    window.removeEventListener('keyup', this.onKeyRelease);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    KeyboardController.instance = undefined;
  }
}
