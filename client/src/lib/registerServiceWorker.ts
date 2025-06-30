import Logger from '../lib/Logger';


async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    Logger.WARN('Service worker not supported');
    return;
  }

  try {
    await navigator.serviceWorker.register(process.env.SERVICE_WORKER_PATH ?? '');
    Logger.DEBUG('Service worker registered');

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;
    Logger.DEBUG('Service Worker ready');
  } catch (error) {
    Logger.ERROR('Failed to register service Worker:', error);
  }
}


export default registerServiceWorker;
