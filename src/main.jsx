import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';
import './i18n/i18n';
import './index.css';

// SockJS expects a Node-like global; ensure it exists in browser.
if (typeof global === 'undefined') {
  window.global = window;
}
// Some ws clients also probe process.env; provide a minimal stub in browser.
if (typeof process === 'undefined') {
  window.process = { env: {} };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);