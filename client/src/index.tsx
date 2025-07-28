import { Router } from '@solidjs/router';
import { render } from 'solid-js/web';
import App from './App';
import { StoreProvider } from './app/store';
import './styles/global.css';
import { root as rootClass } from './index.css';
import { themeClass } from './styles/theme.css';

// Apply theme class to body element
document.body.classList.add(themeClass, rootClass);

render(() => (
  <StoreProvider>
    <Router>
      <App />
    </Router>
  </StoreProvider>
), document.body);
