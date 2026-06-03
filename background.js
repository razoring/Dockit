// background.js

const SESSION_ID = Date.now().toString();
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

  // Inject content scripts into existing tabs
  try {
    const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
    for (const tab of tabs) {
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://') && !tab.url.startsWith('about:')) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (sessionId) => {
            if (window.DOCKIT_INJECTED === true) return true;
            window.DOCKIT_SESSION_ID = sessionId;
            return false;
          },
          args: [SESSION_ID]
        }).then((results) => {
          if (results && results[0] && results[0].result === true) return;
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['defaults.js', 'sidebar.js', 'content.js']
          }).catch(() => { });
        }).catch(() => { });
      }
    }
  } catch (err) {
    console.error('Failed to query tabs for content script injection:', err);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  await registerScrollScript();
  //clean up stale side panel state
  const storage = await chrome.storage.local.get(null);
  const keysToRemove = Object.keys(storage).filter(key => key.startsWith('sidePanelOpen_'));
  if (keysToRemove.length > 0) {
    await chrome.storage.local.remove(keysToRemove);
  }
});

// Register main world content script dynamically to bypass CSP on sites like Bing/ChatGPT
async function registerScrollScript() {
  try {
    const scripts = await chrome.scripting.getRegisteredContentScripts();
    const exists = scripts.some(s => s.id === 'dockit-scroll-interceptor');
    if (exists) {
      await chrome.scripting.unregisterContentScripts({ ids: ['dockit-scroll-interceptor'] });
    }
  } catch (err) {
    console.error('Failed to unregister main world script:', err);
  }
}

// Cache Fonts and Icons for Offline use
async function cacheAssets() {
  try {
    //cache specific lucide svgs for offline use
    const iconsToFetch = ['plus', 'shapes', 'settings', 'trash-2', 'x', 'pin', 'clock-fading', 'search', 'rotate-cw', 'external-link', 'smartphone', 'monitor', 'lock', 'cookie', 'copy', 'lock-open', 'chevron-down', 'chevron-up'];
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

    // 3. Cache Main Stylesheet
    const stylesCssRes = await fetch(chrome.runtime.getURL('styles.css'));
    const dockitStyles = await stylesCssRes.text();

    await chrome.storage.local.set({
      fontCss: fontCss,
      dockitStyles: dockitStyles
    });

    console.log("Assets cached successfully.");
  } catch (error) {
    console.error("Failed to cache assets:", error);
  }
}

const connectedSidePanels = new Set();

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'sidepanel') {
    let panelWindowId = null;
    port.onMessage.addListener((msg) => {
      if (msg.type === 'INIT' && msg.windowId) {
        panelWindowId = msg.windowId;
        connectedSidePanels.add(panelWindowId);
        chrome.storage.local.set({ [`sidePanelOpen_${panelWindowId}`]: true });
      } else if (msg.type === 'PING') {
        // Prevent Service Worker suspension
      }
    });

    port.onDisconnect.addListener(() => {
      if (panelWindowId) {
        connectedSidePanels.delete(panelWindowId);
        chrome.storage.local.set({
          [`sidePanelOpen_${panelWindowId}`]: false,
          temporaryApps: [],
          dockitSidepanelHovered: false
        });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_SESSION_ID') {
    sendResponse(SESSION_ID);
    return false;
  } else if (msg.type === 'GET_WINDOW_ID') {
    if (sender.tab && sender.tab.windowId) {
      sendResponse(sender.tab.windowId);
    }
  } else if (msg.type === 'CHECK_SIDEPANEL_OPEN') {
    if (msg.windowId) {
      if (connectedSidePanels.has(msg.windowId)) {
        sendResponse(true);
        return false;
      }
      
      //check active side panel contexts
      chrome.runtime.getContexts({ contextTypes: ['SIDE_PANEL'] })
        .then((contexts) => {
          const windowContexts = contexts.filter(c => c.windowId === msg.windowId);
          sendResponse(windowContexts.length > 0);
        })
        .catch((err) => {
          console.error(err);
          sendResponse(false);
        });
      return true;
    } else {
      sendResponse(false);
    }
  } else if (msg.type === 'OPEN_SIDEPANEL') {
    if (sender.tab && sender.tab.windowId) {
      if (msg.systemApp) {
        chrome.storage.local.set({ activeSystemApp: msg.systemApp, activeApp: null });
      } else if (msg.app) {
        chrome.storage.local.set({ activeApp: msg.app, activeSystemApp: null });
      }
      chrome.sidePanel.open({ windowId: sender.tab.windowId }).catch(e => console.error(e));
      setTimeout(() => {
        if (msg.systemApp) {
          chrome.runtime.sendMessage({ type: 'LOAD_SYSTEM_APP', systemApp: msg.systemApp }).catch(() => { });
        } else {
          chrome.runtime.sendMessage({ type: 'LOAD_APP', app: msg.app }).catch(() => { });
        }
      }, 100);
    }
  } else if (msg.type === 'REFETCH_ASSETS') {
    cacheAssets();
  } else if (msg.type === 'FETCH_SEARCH_SUGGESTIONS') {
    //fetch search suggestions from google suggest API
    fetch(`https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(msg.query)}`)
      .then(r => r.json())
      .then(data => sendResponse(data[1] || []))
      .catch(err => {
        console.error(err);
        sendResponse([]);
      });
    return true; //asynchronous response
  } else if (msg.type === 'SET_MOBILE_USER_AGENT') {
    const ruleId = 9999;
    if (msg.enabled && msg.url) {
      try {
        const urlObj = new URL(msg.url);
        const domain = urlObj.hostname;
        const rule = {
          id: ruleId,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            requestHeaders: [
              {
                header: 'user-agent',
                operation: 'set',
                value: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
              }
            ]
          },
          condition: {
            urlFilter: `*://${domain}/*`,
            resourceTypes: ['sub_frame', 'xmlhttprequest', 'script', 'stylesheet', 'image']
          }
        };

        chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: [ruleId],
          addRules: [rule]
        }, () => {
          sendResponse({ success: true });
        });
      } catch (e) {
        sendResponse({ success: false });
      }
    } else {
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [ruleId]
      }, () => {
        sendResponse({ success: true });
      });
    }
    return true; //asynchronous response
  }
});

// Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "send-to-sidebar") {
    // Open the side panel IMMEDIATELY to preserve the user gesture context
    if (tab && tab.windowId && tab.windowId !== -1) {
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
    } catch (e) { }

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
      chrome.runtime.sendMessage({ type: 'LOAD_APP', app: appData }).catch(() => { });
    }, 500);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://') && !tab.url.startsWith('about:')) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (sessionId) => {
          if (window.DOCKIT_INJECTED === true) return true;
          window.DOCKIT_SESSION_ID = sessionId;
          return false;
        },
        args: [SESSION_ID]
      }).then((results) => {
        if (results && results[0] && results[0].result === true) return;
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['defaults.js', 'sidebar.js', 'content.js']
        }).catch(() => { });
      }).catch(() => { });
    }
  } catch (err) {}
});
