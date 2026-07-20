import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile } from '@/pages/login/types';

interface AuthState {
  profile: UserProfile | null;
}

const initialState: AuthState = {
  profile: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<UserProfile>) {
      state.profile = action.payload;
    },
    clearProfile(state) {
      state.profile = null;
    },
  },
});

export const { setProfile, clearProfile } = authSlice.actions;
export default authSlice.reducer;
