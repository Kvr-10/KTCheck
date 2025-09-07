import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
// redux
import { Provider } from "react-redux";
import store from "./Redux/store";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
  {/* <React.StrictMode> */}
    <App />
  {/* </React.StrictMode> */}
  </Provider>
);

// import React from "react";
// import ReactDOM from "react-dom";

// // component
// import App from "./App";

// // redux
// import { Provider } from "react-redux";
// import store from "./Redux/store";

// ReactDOM.render(
//   <Provider store={store}>
//     <App />
//   </Provider>,
//   document.getElementById("root")
// );

