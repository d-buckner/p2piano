import { configureStore } from '@reduxjs/toolkit';
import { connectionReducer } from '../slices/connectionSlice';
import { notesReducer } from '../slices/notesSlice';
import { workspaceReducer } from '../slices/workspaceSlice';


const store = configureStore({
  reducer: {
    workspace: workspaceReducer,
    notesByMidi: notesReducer,
    connection: connectionReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export const dispatch = store.dispatch;

export default store;

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof store.getState>;
