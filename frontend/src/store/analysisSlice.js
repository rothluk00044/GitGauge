import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  recentAnalyses: [],
  currentAnalysis: null,
  loading: false,
  error: null,
};

export const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    startAnalysis: (state) => {
      state.loading = true;
      state.error = null;
    },
    analysisSuccess: (state, action) => {
      state.loading = false;
      state.currentAnalysis = action.payload;
      state.recentAnalyses.unshift(action.payload);
    },
    analysisFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { startAnalysis, analysisSuccess, analysisFailure } = analysisSlice.actions;
export default analysisSlice.reducer;