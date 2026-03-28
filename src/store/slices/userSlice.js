import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    loading: false,
    error: null,
    updating: false,
  },
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.loading = false;
    },
    updateProfile: (state, action) => {
      if (state.profile) {
        Object.assign(state.profile, action.payload);
      }
      state.updating = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUpdating: (state, action) => {
      state.updating = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.updating = false;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
  },
});

export const { setProfile, updateProfile, setLoading, setUpdating, setError, clearProfile } =
  userSlice.actions;

export default userSlice.reducer;
