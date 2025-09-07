import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  customerSignUpPersonalStep: 1,
  customerSignUpOrganizationStep: 1,
  dealerSignUpStep: 1,
  forgotPasswordStep: 1,
  cartStep: 1,
};

const stepReducer = createSlice({
  name: "step reducer",
  initialState,
  reducers: {
    forward: (state, action) => {
      state[action.payload] = state[action.payload] + 1;
    },
    backward: (state, action) => {
      state[action.payload] = state[action.payload] - 1;
    },
    reset: (state, action) => {
      state[action.payload] = 1;
    },
  },
});

export const stepReducerActions = stepReducer.actions;
export default stepReducer.reducer;
