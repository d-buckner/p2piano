export default class MidiDeviceController {
    private static instance?: MidiDeviceController;
    private access?: WebMidi.MIDIAccess;
    private eventHandlers = new Map<string, Function[]>();

    public static getInstance(): MidiDeviceController {
        if (!MidiDeviceController.instance) {
            MidiDeviceController.instance = new MidiDeviceController();
        }

        return MidiDeviceController.instance;
    }

    private constructor() {
        this.onAccess = this.onAccess.bind(this);
        this.onAccessError = this.onAccessError.bind(this);
        this.onStateChange = this.onStateChange.bind(this);
        this.onMessage = this.onMessage.bind(this);

        navigator.requestMIDIAccess().then(
            this.onAccess,
            this.onAccessError,
        );
    }

    private onAccess(access: WebMidi.MIDIAccess) {
        this.access = access;
        this.access.onstatechange = this.onStateChange;
        this.access.inputs.forEach(input => {
            input.onmidimessage = this.onMessage;
        });
    }

    private onAccessError() {
        console.error('Unable to establish midi access');
    }

    private onStateChange(event: WebMidi.MIDIConnectionEvent) {
        this.emitEvent('STATE_CHANGE', event);
    }

    private onMessage({ data }: WebMidi.MIDIMessageEvent) {
        const command = data[0];
        const midi = data[1];
        const velocity = data[2];

        if (command !== 144) {
            return;
        }

        if (velocity) {
            this.emitEvent('KEY_DOWN', {
                midi,
                velocity,
            });

            return;
        }

        this.emitEvent('KEY_UP', { midi });
    }

    private emitEvent(action: string, payload: Record<string, any>) {
        this.eventHandlers.get(action)?.forEach(handler => handler(payload));
    }

    public on(action: string, handler: Function) {
        if (!this.eventHandlers.get(action)) {
            this.eventHandlers.set(action, []);
        }

        this.eventHandlers.get(action)?.push(handler);
    }
}
