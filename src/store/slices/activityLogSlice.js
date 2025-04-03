import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  logs: [],
  loading: false,
  error: null,
};

const activityLogSlice = createSlice({
  name: 'activityLogs',
  initialState,
  reducers: {
    addLog: (state, action) => {
      state.logs.unshift(action.payload);
    },
    clearLogs: (state) => {
      state.logs = [];
    },
  },
});

export const { addLog, clearLogs } = activityLogSlice.actions;

export default activityLogSlice.reducer; 