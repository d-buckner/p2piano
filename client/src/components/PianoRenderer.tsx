import PianoVisualizer from 'piano-visualizer';
import { createSignal, createEffect, onCleanup } from 'solid-js';
import * as NoteActions from '../actions/NoteActions';
import { NoteManager } from '../lib/NoteManager';
import { oceanTheme } from '../styles/theme.css';
import * as styles from './PianoRenderer.css';


export default function PianoRenderer() {
    const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
    let renderer: PianoVisualizer | undefined;

    // Initialize renderer when container is available
    createEffect(() => {
        const container = containerRef();
        if (container && !renderer) {
            // Use raw hex value from ocean theme
            const backgroundColor = oceanTheme.background;
            
            renderer = new PianoVisualizer({
                container,
                backgroundColor,
                onKeyDown: NoteActions.keyDown,
                onKeyUp: NoteActions.keyUp,
            });
        }
    });

    // Set up event bus listeners
    createEffect(() => {
        const handleNoteStart = (data: { midi: number; color: string }) => {
            renderer?.startNote(data.midi, data.color);
        };

        const handleNoteEnd = (data: { midi: number }) => {
            renderer?.endNote(data.midi);
        };

        NoteManager.onNoteStart(handleNoteStart);
        NoteManager.onNoteEnd(handleNoteEnd);

        onCleanup(() => {
            NoteManager.offNoteStart(handleNoteStart);
            NoteManager.offNoteEnd(handleNoteEnd);
        });
    });

    return (
        <div
            class={styles.pianoRendererContainer}
            ref={setContainerRef}
        />
    );
}
