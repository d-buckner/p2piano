import { Router } from '@solidjs/router';
import { render } from 'solid-js/web';
import App from './App';
import { StoreProvider } from './app/store';
import { appContainer } from './core/AppContainer';
import { ServiceProvider } from './core/providers/ServiceProvider';
import './styles/global.css';
import { root as rootClass } from './index.css';
import { themeClass } from './styles/theme.css';

// Apply theme class to body element
document.body.classList.add(themeClass, rootClass);

// Initialize services
appContainer.initialize();

render(() => (
  <ServiceProvider container={appContainer}>
    <StoreProvider>
      <Router>
        <App />
      </Router>
    </StoreProvider>
  </ServiceProvider>
), document.body);
