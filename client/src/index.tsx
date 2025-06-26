import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import store from './app/store';
import './styles/global.css';
import { root as rootClass } from './index.css';
import { themeClass } from './styles/theme.css';


// Apply theme class to body element
document.body.className = `${themeClass} ${rootClass}`;

const root = createRoot(document.body);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
