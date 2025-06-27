import type { RootState } from '../app/store';


export const selectWorkspace = (state: RootState) => state.workspace;

export const selectRoom = (state: RootState) => state.workspace.room;

export const selectUsers = (state: RootState) => state.workspace.room?.users ?? {};

export const selectMyUser = (state: RootState) => {
  const { userId, room } = state.workspace;
  if (userId) {
    return room?.users?.[userId];
  }
};

export const selectUserId = (state: RootState) => state.workspace.userId;

export const selectRoomId = (state: RootState) => state.workspace.roomId;

export const selectIsLoading = (state: RootState) => state.workspace.isLoading;

export const selectIsValid = (state: RootState) => state.workspace.isValid;

// Additional selector functions
export const selectUser = (userId: string) => (state: RootState) => 
  selectUsers(state)[userId];

export const selectUserCount = (state: RootState) => 
  Object.keys(selectUsers(state)).length;

export const selectUsersArray = (state: RootState) => 
  Object.values(selectUsers(state));