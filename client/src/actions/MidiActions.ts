import { setStore } from '../app/store';


export function setMidiEnabled(enabled: boolean) {
  setStore('midi', 'enabled', enabled);
}
