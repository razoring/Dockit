// background.js

chrome.runtime.onInstalled.addListener(async () => {
  // Create context menu
  chrome.contextMenus.create({
    id: "send-to-sidebar",
    title: "Send to Sidebar",
    contexts: ["page", "link"]
  });

  // Clear all local data on install for a fresh start
  await chrome.storage.local.clear();
  
  // Initialize default empty states
  await chrome.storage.local.set({ 
    pinnedApps: [],
    temporaryApps: []
  });

  // Register main world content script
  await registerScrollScript();

  // Cache Assets
  await cacheAssets();
});

chrome.runtime.onStartup.addListener(async () => {
  await registerScrollScript();
});

// Register main world content script dynamically to bypass CSP on sites like Bing/ChatGPT
async function registerScrollScript() {
  try {
    const scripts = await chrome.scripting.getRegisteredContentScripts();
    const exists = scripts.some(s => s.id === 'dockit-scroll-interceptor');
    if (exists) {
      await chrome.scripting.unregisterContentScripts({ ids: ['dockit-scroll-interceptor'] });
    }
    await chrome.scripting.registerContentScripts([
      {
        id: 'dockit-scroll-interceptor',
        js: ['scroll.js'],
        matches: ['<all_urls>'],
        runAt: 'document_start',
        world: 'MAIN',
        allFrames: false
      }
    ]);
    console.log("Main world scroll script registered successfully.");
  } catch (err) {
    console.error('Failed to register main world script:', err);
  }
}

// Cache Fonts and Icons for Offline use
async function cacheAssets() {
  try {
    // 1. Cache specific Lucide SVGs to avoid Manifest V3 CSP dynamic code restrictions
    const iconsToFetch = ['plus', 'puzzle', 'settings', 'trash-2'];
    const lucideIcons = {};
    for (const icon of iconsToFetch) {
      const res = await fetch(`https://unpkg.com/lucide-static@latest/icons/${icon}.svg`);
      lucideIcons[icon] = await res.text();
    }
    await chrome.storage.local.set({ lucideIcons });
    
    // 2. Cache Google Fonts (Inter)
    // First, get the CSS
    const fontCssRes = await fetch('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36' }
    });
    let fontCss = await fontCssRes.text();
    
    // Extract all WOFF2 URLs
    const urlRegex = /url\((https:\/\/[^)]+)\)/g;
    let match;
    const fontPromises = [];
    
    while ((match = urlRegex.exec(fontCss)) !== null) {
      const fontUrl = match[1];
      fontPromises.push(
        fetch(fontUrl)
          .then(res => res.arrayBuffer())
          .then(buffer => {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            return { url: fontUrl, dataUri: 'data:font/woff2;base64,' + base64 };
          })
      );
    }
    
    const fonts = await Promise.all(fontPromises);
    
    // Replace URLs with Data URIs in the CSS
    fonts.forEach(font => {
      fontCss = fontCss.replace(font.url, font.dataUri);
    });

    await chrome.storage.local.set({
      fontCss: fontCss
    });
    
    console.log("Assets cached successfully.");
  } catch (error) {
    console.error("Failed to cache assets:", error);
  }
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'sidepanel') {
    let panelWindowId = null;
    port.onMessage.addListener((msg) => {
      if (msg.type === 'INIT' && msg.windowId) {
        panelWindowId = msg.windowId;
        chrome.storage.local.set({ [`sidePanelOpen_${panelWindowId}`]: true });
      } else if (msg.type === 'PING') {
        // Prevent Service Worker suspension
      }
    });

    port.onDisconnect.addListener(() => {
      if (panelWindowId) {
        chrome.storage.local.set({ 
          [`sidePanelOpen_${panelWindowId}`]: false, 
          temporaryApps: [] 
        });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_WINDOW_ID') {
    if (sender.tab && sender.tab.windowId) {
      sendResponse(sender.tab.windowId);
    }
  } else if (msg.type === 'OPEN_SIDEPANEL') {
    if (sender.tab && sender.tab.windowId) {
      // Must be called synchronously to respect user gesture
      chrome.sidePanel.open({ windowId: sender.tab.windowId }).catch(e => console.error(e));
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'LOAD_APP', app: msg.app }).catch(()=>{});
      }, 500);
    }
  }
});

// Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "send-to-sidebar") {
    // Open the side panel IMMEDIATELY to preserve the user gesture context
    if (tab && tab.windowId) {
      chrome.sidePanel.open({ windowId: tab.windowId }).catch(e => console.error(e));
    }

    let targetUrl = info.linkUrl || info.pageUrl;
    let title = new URL(targetUrl).hostname;
    
    let iconUrl = `https://www.google.com/s2/favicons?domain=${title}&sz=32`;
    try {
      const res = await fetch(iconUrl);
      const buffer = await res.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      iconUrl = 'data:image/png;base64,' + btoa(binary);
    } catch (e) {}

    const appData = {
      id: 'temp_' + Date.now(),
      url: targetUrl,
      title: title,
      iconUrl: iconUrl
    };

    const data = await chrome.storage.local.get(['temporaryApps']);
    const tempApps = data.temporaryApps || [];
    tempApps.push(appData);
    await chrome.storage.local.set({ temporaryApps: tempApps });

    // Tell the sidepanel to immediately navigate to this new temp app
    setTimeout(() => {
      chrome.runtime.sendMessage({ type: 'LOAD_APP', app: appData }).catch(()=> {});
    }, 500);
  }
});
