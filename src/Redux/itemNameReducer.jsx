import { createSlice } from "@reduxjs/toolkit";

const initialState = { sellItemName: "", priceItemName: "" };

const itemNameReducer = createSlice({
  name: "item name",
  initialState,
  reducers: {
    add: (state, action) => {
      state[action.payload.for] = action.payload.name;
    },
  },
});

export const itemNameReducerActions = itemNameReducer.actions;
export default itemNameReducer.reducer;
