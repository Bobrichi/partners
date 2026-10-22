(() => {
  if ('serviceWorker' in navigator) {
    const showOfflineStatus = () => {
      let status = document.getElementById('offline-status');
      if (!status) {
        status = document.createElement('div');
        status.id = 'offline-status';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        status.style.cssText = 'position:fixed;z-index:900;right:14px;bottom:14px;padding:8px 12px;border:1px solid rgba(112,77,10,.28);border-radius:999px;background:#fff8e6;color:#47350d;box-shadow:0 4px 18px rgba(30,24,10,.15);font:700 12px system-ui,sans-serif';
        document.body.appendChild(status);
      }
      status.textContent = navigator.onLine ? 'Offline access ready' : 'Offline mode - data stays on this device';
    };
    window.addEventListener('online', showOfflineStatus);
    window.addEventListener('offline', showOfflineStatus);
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js')
        .then(() => navigator.serviceWorker.ready)
        .then(showOfflineStatus)
        .catch(error => console.warn('Offline app support could not be enabled.', error));
    });
  }

  let installPrompt = null;
  const button = document.getElementById('install-app');
  const status = document.getElementById('install-status');
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (button && standalone()) {
    button.hidden = true;
    if (status) status.textContent = 'WFP is installed on this device.';
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    if (button) button.hidden = false;
  });

  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    if (button) button.hidden = true;
    if (status) status.textContent = 'WFP is installed. Open it once online to prepare offline access.';
  });

  document.addEventListener('click', async event => {
    const target = event.target.closest('#install-app');
    if (!target) return;
    if (!installPrompt) {
      if (status) status.textContent = 'Open your browser menu and choose Install app or Add to Home Screen. The site must be opened online once to download its offline pages.';
      return;
    }
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    installPrompt = null;
    if (choice.outcome === 'accepted') {
      target.hidden = true;
      if (status) status.textContent = 'WFP is installing. Open it once online to prepare offline access.';
    } else if (status) {
      status.textContent = 'Installation was cancelled. You can try again from the browser menu.';
    }
  });
})();
