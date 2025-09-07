import { configureStore } from "@reduxjs/toolkit";

// reducer
import stepReducer from "./stepReducer";
import itemNameReducer from "./itemNameReducer";

const store = configureStore({
  reducer: { stepReducer, itemNameReducer },
});

export default store;
