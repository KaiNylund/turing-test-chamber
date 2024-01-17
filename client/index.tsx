import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import './styles/index.css';
import App from './view/App';
import store from "./model/store";
import { connectToServer } from "./utils/ServerInteractionUtils";

connectToServer();

let rootElem = document.getElementById('root');
//@ts-ignore: rootElem should be cast with as HTMLElement,
// but for some reason the "as" keyword is giving a syntax error...
const root = ReactDOM.createRoot(rootElem);

root.render(
  <Provider store={store}>
    <App/>
  </Provider>
);