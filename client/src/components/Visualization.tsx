import { Box } from '@chakra-ui/react';
import PianoVisualizer from 'piano-visualizer';
import React, { PureComponent } from 'react';
import * as NoteActions from '../actions/NoteActions';
import RightOverlay from './RightOverlay';
import type { Note } from '../constants';


type Props = {
    notes: Note[],
};

export default class Visualization extends PureComponent<Props> {
    private containerRef = React.createRef<HTMLDivElement>();
    private renderer?: PianoVisualizer;
    private activeNotes = new Map<number, Note>();

    componentDidMount() {
        const container = this.containerRef.current;
        if (container && !this.renderer) {
            this.renderer = new PianoVisualizer({
                container,
                onKeyDown: NoteActions.keyDown,
                onKeyUp: NoteActions.keyUp,
            });
        }
    }

    componentDidUpdate() {
        const currentNotes = this.props.notes.reduce((arr, note) => arr.set(note.midi, note),
            new Map<number, Note>()
        );

        this.activeNotes.forEach(note => {
            const currentEntry = currentNotes.get(note.midi);
            if (!currentEntry || currentEntry.peerId !== note.peerId) {
                this.activeNotes.delete(note.midi);
                this.renderer?.endNote(note.midi);
            }
        });

        currentNotes.forEach(note => {
            const prevEntry = this.activeNotes.get(note.midi);
            if (!prevEntry) {
                this.activeNotes.set(note.midi, note);
                this.renderer?.startNote(note.midi, note.color || 'blue');
            }
        });
    }

    render() {
        return (
            <Box
                w='100%'
                h='100%'
                pos='relative'
                ref={this.containerRef}
            >
                <RightOverlay />
            </Box>
        );
    }
}
