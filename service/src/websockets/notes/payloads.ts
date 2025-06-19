export type NoteOnPayload = {
  note: number;
  velocity: number;
  targetUserIds: string[],
};

export type NoteOffPayload = {
  note: number,
  targetUserIds: string[],
};
