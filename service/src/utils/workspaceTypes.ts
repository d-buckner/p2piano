export type User = {
  userId: string,
  displayName: string,
  color: string,
  instrument: string,
};

export type Room = {
  roomId: string,
  users: {
    [userId: string]: User,
  },
  createdAt: Date,
};
