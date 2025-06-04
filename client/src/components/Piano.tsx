import React, { PureComponent, createRef } from 'react';
import ClaytonPiano from 'clayton-piano';
import * as NoteActions from '../actions/NoteActions';

import type { Note } from '../constants';

type Props = {
  notes: Note[],
};

export default class Piano extends PureComponent<Props> {
  private piano?: ClaytonPiano;
  private activeNotes = new Map<number, Note>();
  private containerRef = createRef<HTMLDivElement>();

  componentDidMount() {
    if (this.piano) {
      return;
    }

    this.piano = new ClaytonPiano({
      container: this.containerRef.current!,
      onKeyDown: NoteActions.keyDown,
      onKeyUp: NoteActions.keyUp,
    });
  }

  componentDidUpdate() {
    const currentNotes = this.props.notes.reduce(
      (arr, note) => arr.set(note.midi, note),
      new Map<number, Note>()
    );

    this.activeNotes.forEach(note => {
      const currentEntry = currentNotes.get(note.midi);
      if (!currentEntry || currentEntry.peerId !== note.peerId) {
        this.activeNotes.delete(note.midi);
        this.piano?.keyUp(note.midi);
      }
    });

    currentNotes.forEach(note => {
      const prevEntry = this.activeNotes.get(note.midi);
      if (!prevEntry) {
        this.activeNotes.set(note.midi, note);
        this.piano?.keyDown(note.midi, note.color);
      }
    });
  }

  render() {
    return <div
      style={{ height: '100%', width: '100%' }}
      ref={this.containerRef}
    />;
  }
}
