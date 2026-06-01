// sidepanel.js
async function init() {
  // Inject Cached Fonts
  const storage = await chrome.storage.local.get(['fontCss', 'temporaryApps']);
  if (storage.fontCss) {
    const fontStyle = document.createElement('style');
    fontStyle.textContent = storage.fontCss;
    document.head.appendChild(fontStyle);
  }

  // Render Sidebar
  const sidebar = new DockitSidebar(true);
  const sidebarEl = await sidebar.render();
  document.getElementById('sidebar-container').appendChild(sidebarEl);

  const iframe = document.getElementById('app-frame');

  // Load latest temporary app if available
  if (storage.temporaryApps && storage.temporaryApps.length > 0) {
    iframe.src = storage.temporaryApps[storage.temporaryApps.length - 1].url;
  }

  // Listen to navigation events from sidebar clicks
  document.addEventListener('dockit-navigate', (e) => {
    iframe.src = e.detail;
  });

  // Listen for messages from background (e.g. newly added temp app)
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'LOAD_APP') {
      iframe.src = msg.app.url;
      sidebar.loadData();
    }
  });

  // Re-render when storage changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.pinnedApps || changes.temporaryApps || changes.lucideIcons) {
      if (changes.lucideIcons) sidebar.injectIcons();
      sidebar.loadData();
    }
  });

  // Notify Background of Connection for state tracking
  chrome.windows.getCurrent((win) => {
    const port = chrome.runtime.connect({ name: 'sidepanel' });
    port.postMessage({ type: 'INIT', windowId: win.id });
    
    // Keep reference to prevent GC
    window._dockitPort = port;
    
    // Ping to keep the Service Worker awake while the panel is open
    setInterval(() => {
      try {
        port.postMessage({ type: 'PING' });
      } catch(e) {}
    }, 20000);
  });
}

document.addEventListener('DOMContentLoaded', init);
