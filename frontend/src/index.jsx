import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { Provider } from "react-redux";
import { createStore } from "redux";

let reducer = function(state, action) {
  if (action.type === "signIn") {
    return { ...state, signedIn: true };
  }
  if (action.type === "updateSessionId") {
    return { ...state, sessionId: action.sessionId, signedIn: true };
  }
  if (action.type === "disconnect") {
    return { ...state, connected: false };
  }
  return state;
};

const store = createStore(
  reducer, // reducer
  {
    signedIn: false,
    sessionId: "",
    connected:true
  }, // initial state
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const mainApp = (
  <Provider store={store}>
    <App />
  </Provider>
);
ReactDOM.render(mainApp, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
