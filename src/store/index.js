import { configureStore } from '@reduxjs/toolkit';
import createEventReducer from './createEventSlice';

export const store = configureStore({
  reducer: {
    createEvent: createEventReducer,
  },
});
