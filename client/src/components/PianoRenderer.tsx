import PianoVisualizer from 'piano-visualizer';
import { createSignal, createEffect } from 'solid-js';
import * as NoteActions from '../actions/NoteActions';
import * as styles from './PianoRenderer.css';
import RoomSidebar from './RoomSidebar';
import type { Note } from '../constants';


type Props = {
    notes: Note[],
};

export default function PianoRenderer(props: Props) {
    const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
    let renderer: PianoVisualizer | undefined;
    const activeNotes = new Map<number, Note>();

    // Initialize renderer when container is available
    createEffect(() => {
        const container = containerRef();
        if (container && !renderer) {
            renderer = new PianoVisualizer({
                container,
                onKeyDown: NoteActions.keyDown,
                onKeyUp: NoteActions.keyUp,
            });
        }
    });

    createEffect(() => {
        const currentNotes = props.notes.reduce((arr, note) => arr.set(note.midi, note),
            new Map<number, Note>()
        );

        activeNotes.forEach(note => {
            const currentEntry = currentNotes.get(note.midi);
            if (!currentEntry || currentEntry.peerId !== note.peerId) {
                activeNotes.delete(note.midi);
                renderer?.endNote(note.midi);
            }
        });

        currentNotes.forEach(note => {
            const prevEntry = activeNotes.get(note.midi);
            if (!prevEntry) {
                activeNotes.set(note.midi, note);
                renderer?.startNote(note.midi, note.color || 'blue');
            }
        });
    });

    return (
        <div
            class={styles.pianoRendererContainer}
            ref={setContainerRef}
        >
            <RoomSidebar />
        </div>
    );
}
