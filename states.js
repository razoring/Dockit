// sidepanel.js
async function init() {
  // Inject Cached Fonts
  const storage = await chrome.storage.local.get(['fontCss', 'temporaryApps', 'dockitMobileDefault']);
  if (storage.fontCss) {
    const fontStyle = document.createElement('style');
    fontStyle.textContent = storage.fontCss;
    document.head.appendChild(fontStyle);
  }

  // Render Sidebar
  const sidebar = new DockitSidebar(true);
  const sidebarEl = await sidebar.render();
  document.getElementById('sidebar-container').appendChild(sidebarEl);

  const iframeContainer = document.querySelector('.dockit-iframe-container');
  const controlBar = document.createElement('div');
  controlBar.className = 'dockit-control-bar';
  controlBar.style.display = 'none';

  const isMobileDefault = storage.dockitMobileDefault !== false;
  const viewportWrapper = document.createElement('div');
  viewportWrapper.className = `dockit-iframe-viewport-wrapper ${isMobileDefault ? 'mobile-mode' : 'desktop-mode'}`;

  if (iframeContainer) {
    iframeContainer.innerHTML = '';
    iframeContainer.style.display = 'flex';
    iframeContainer.style.flexDirection = 'column';
    iframeContainer.appendChild(viewportWrapper);
    iframeContainer.appendChild(controlBar);
  }

  //retrieve and parse lucide icons for buttons
  const storageData = await chrome.storage.local.get(['lucideIcons']);
  const reloadSvg = (storageData.lucideIcons && storageData.lucideIcons['rotate-cw']) || '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>';
  const externalSvg = (storageData.lucideIcons && storageData.lucideIcons['external-link']) || '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>';
  const smartphoneSvg = (storageData.lucideIcons && storageData.lucideIcons['smartphone']) || '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>';
  const monitorSvg = (storageData.lucideIcons && storageData.lucideIcons['monitor']) || '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>';
  const lockSvg = (storageData.lucideIcons && storageData.lucideIcons['lock']) || '<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
  const lockOpenSvg = (storageData.lucideIcons && storageData.lucideIcons['lock-open']) || '<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>';
  const cookieSvg = (storageData.lucideIcons && storageData.lucideIcons['cookie']) || '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5Z"></path><path d="M12 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3Zm-4 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3Zm8 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3Z"></path></svg>';
  const copySvg = (storageData.lucideIcons && storageData.lucideIcons['copy']) || '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';

  controlBar.style.position = 'relative';
  controlBar.innerHTML = `
    <div class="dockit-url-container" id="dockit-url-click" title="View Connection Information">
      <div class="dockit-lock-icon" id="dockit-lock-container">
        ${lockSvg}
      </div>
      <div class="dockit-control-url" id="dockit-url-text"></div>
    </div>
    <button class="dockit-control-btn" id="dockit-btn-reload" title="Reload Site">
      ${reloadSvg}
    </button>
    <button class="dockit-control-btn" id="dockit-btn-external" title="Open in Browser">
      ${externalSvg}
    </button>
    <button class="dockit-control-btn" id="dockit-btn-device" title="Toggle Mobile View">
      ${smartphoneSvg}
    </button>
    
    <!-- connection dropdown info popup -->
    <div class="dockit-connection-menu" id="dockit-connection-dropdown">
      <div class="dockit-menu-section">
        <div id="dockit-menu-lock-icon" style="color: var(--color-foreground); opacity: 0.7; flex-shrink:0; display:flex; align-items:center;">
          ${lockSvg}
        </div>
        <div>
          <div class="dockit-menu-title" id="dockit-menu-conn-title">Connection is secure</div>
          <div class="dockit-menu-desc" id="dockit-menu-conn-desc">Your information (for example, passwords or credit card numbers) is private when it is sent to this site.</div>
        </div>
      </div>
      <div class="dockit-menu-divider"></div>
      <div class="dockit-menu-section">
        <div style="color: var(--color-foreground); opacity: 0.7; flex-shrink:0; display:flex; align-items:center;">
          ${cookieSvg}
        </div>
        <div>
          <div class="dockit-menu-title" id="dockit-menu-cookie-title">Cookies</div>
          <div class="dockit-menu-desc" id="dockit-menu-cookie-desc">Checking in use...</div>
        </div>
      </div>
      <div class="dockit-menu-divider"></div>
      <button class="dockit-menu-btn" id="dockit-menu-copy">
        ${copySvg}
        <span id="dockit-copy-text">Copy URL</span>
      </button>
    </div>
  `;

  const _iframes = new Map();
  let _activeUrl = '';

  //helper to update sidebar opacity indicators based on in-page and in-memory status
  const _updateInMemoryIndicator = (isInPageOpen) => {
    const urls = Array.from(_iframes.keys());
    sidebar.setInMemoryUrls(urls, isInPageOpen);
  };

  //wrap system app toggle methods to update memory loaded highlights
  const originalOpen = sidebar.openSystemApp.bind(sidebar);
  sidebar.openSystemApp = async function(name) {
    await originalOpen(name);
    _updateInMemoryIndicator(true);
  };

  const originalClose = sidebar.closeSystemApp.bind(sidebar);
  sidebar.closeSystemApp = function() {
    originalClose();
    _updateInMemoryIndicator(false);
  };

  //reload action click handler
  const reloadBtn = controlBar.querySelector('#dockit-btn-reload');
  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => {
      if (_activeUrl) {
        const frame = _iframes.get(_activeUrl);
        if (frame) frame.src = _activeUrl;
      }
    });
  }

  //open in new tab click handler
  const externalBtn = controlBar.querySelector('#dockit-btn-external');
  if (externalBtn) {
    externalBtn.addEventListener('click', () => {
      if (_activeUrl) {
        window.open(_activeUrl, '_blank');
      }
    });
  }

  //toggle mobile view mode click handler
  const deviceBtn = controlBar.querySelector('#dockit-btn-device');
  if (deviceBtn) {
    const isMobileInitial = viewportWrapper.classList.contains('mobile-mode');
    deviceBtn.innerHTML = isMobileInitial ? monitorSvg : smartphoneSvg;
    deviceBtn.title = isMobileInitial ? 'Toggle Desktop View' : 'Toggle Mobile View';

    deviceBtn.addEventListener('click', () => {
      const isMobile = viewportWrapper.classList.contains('mobile-mode');
      if (isMobile) {
        viewportWrapper.classList.remove('mobile-mode');
        viewportWrapper.classList.add('desktop-mode');
        deviceBtn.innerHTML = smartphoneSvg;
        deviceBtn.title = 'Toggle Mobile View';
        
        //disable mobile user agent and reload active frame
        chrome.runtime.sendMessage({ type: 'SET_MOBILE_USER_AGENT', enabled: false }, () => {
          if (_activeUrl) {
            const frame = _iframes.get(_activeUrl);
            if (frame) frame.src = _activeUrl;
          }
        });
      } else {
        viewportWrapper.classList.remove('desktop-mode');
        viewportWrapper.classList.add('mobile-mode');
        deviceBtn.innerHTML = monitorSvg;
        deviceBtn.title = 'Toggle Desktop View';
        
        //enable mobile user agent and reload active frame
        chrome.runtime.sendMessage({ type: 'SET_MOBILE_USER_AGENT', enabled: true, url: _activeUrl }, () => {
          if (_activeUrl) {
            const frame = _iframes.get(_activeUrl);
            if (frame) frame.src = _activeUrl;
          }
        });
      }
    });
  }

  const urlClick = controlBar.querySelector('#dockit-url-click');
  const dropdown = controlBar.querySelector('#dockit-connection-dropdown');

  if (urlClick && dropdown) {
    urlClick.addEventListener('click', () => {
      const isVisible = dropdown.style.display === 'flex';
      if (isVisible) {
        dropdown.style.display = 'none';
      } else {
        dropdown.style.display = 'flex';
        
        //update connection security text
        const isSecure = _activeUrl.startsWith('https://');
        const connTitle = dropdown.querySelector('#dockit-menu-conn-title');
        const connDesc = dropdown.querySelector('#dockit-menu-conn-desc');
        const menuLockIcon = dropdown.querySelector('#dockit-menu-lock-icon');
        
        if (isSecure) {
          if (connTitle) connTitle.textContent = 'Connection is secure';
          if (connDesc) connDesc.textContent = 'Your information (for example, passwords or credit card numbers) is private when it is sent to this site.';
          if (menuLockIcon) {
            menuLockIcon.innerHTML = lockSvg;
          }
        } else {
          if (connTitle) connTitle.textContent = 'Connection is not secure';
          if (connDesc) connDesc.textContent = 'You should not enter any sensitive information on this site (for example, passwords or credit cards), as it could be stolen by attackers.';
          if (menuLockIcon) {
            menuLockIcon.innerHTML = lockOpenSvg;
          }
        }

        //update dynamic cookie usage count
        try {
          const u = new URL(_activeUrl);
          chrome.cookies.getAll({ domain: u.hostname }, (cookies) => {
            const count = cookies ? cookies.length : 0;
            const cookieTitle = dropdown.querySelector('#dockit-menu-cookie-title');
            const cookieDesc = dropdown.querySelector('#dockit-menu-cookie-desc');
            if (cookieTitle) cookieTitle.textContent = 'Cookies';
            if (cookieDesc) cookieDesc.textContent = `${count} cookie${count === 1 ? '' : 's'} in use`;
          });
        } catch (e) {
          const cookieDesc = dropdown.querySelector('#dockit-menu-cookie-desc');
          if (cookieDesc) cookieDesc.textContent = 'Unable to read cookies';
        }
      }
    });
  }

  //copy url click handler
  const copyBtn = controlBar.querySelector('#dockit-menu-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (_activeUrl) {
        navigator.clipboard.writeText(_activeUrl).then(() => {
          const copyText = controlBar.querySelector('#dockit-copy-text');
          if (copyText) {
            copyText.textContent = 'Copied!';
            setTimeout(() => {
              copyText.textContent = 'Copy URL';
              dropdown.style.display = 'none';
            }, 1000);
          }
        });
      }
    });
  }

  //close connection info dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (dropdown && urlClick && !dropdown.contains(e.target) && !urlClick.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  //helper to set active iframe reactively and update loaded indicators
  const _setIframeSrc = async (url) => {
    const targetUrl = url || '';
    _activeUrl = targetUrl;
    
    if (dropdown) {
      dropdown.style.display = 'none';
    }

    _iframes.forEach((frame) => {
      frame.style.display = 'none';
    });

    if (targetUrl) {
      //update dynamic user agent rules depending on current view mode
      const isMobile = viewportWrapper.classList.contains('mobile-mode');
      if (isMobile) {
        await new Promise((resolve) => {
          chrome.runtime.sendMessage({ type: 'SET_MOBILE_USER_AGENT', enabled: true, url: targetUrl }, resolve);
        });
      } else {
        await new Promise((resolve) => {
          chrome.runtime.sendMessage({ type: 'SET_MOBILE_USER_AGENT', enabled: false }, resolve);
        });
      }

      let frame = _iframes.get(targetUrl);
      if (!frame) {
        frame = document.createElement('iframe');
        frame.className = 'dockit-iframe';
        frame.src = targetUrl;
        frame.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
        frame.style.cssText = 'width: 100%; height: 100%; border: none; display: none;';
        if (viewportWrapper) {
          viewportWrapper.appendChild(frame);
        }
        _iframes.set(targetUrl, frame);
      }
      frame.style.display = 'block';
      
      //display url cleanly and toggle lock icon state
      try {
        const u = new URL(targetUrl);
        const urlText = controlBar.querySelector('#dockit-url-text');
        if (urlText) urlText.textContent = u.hostname + u.pathname;
        
        const isSecure = targetUrl.startsWith('https://');
        const lockIcon = controlBar.querySelector('#dockit-lock-container');
        if (lockIcon) {
          lockIcon.style.display = 'flex';
          lockIcon.innerHTML = isSecure ? lockSvg : lockOpenSvg;
        }
      } catch (e) {
        const urlText = controlBar.querySelector('#dockit-url-text');
        if (urlText) urlText.textContent = targetUrl;
        const lockIcon = controlBar.querySelector('#dockit-lock-container');
        if (lockIcon) {
          lockIcon.style.display = 'flex';
          lockIcon.innerHTML = lockOpenSvg;
        }
      }
      
      const storage = await chrome.storage.local.get(['dockitShowUrlBar']);
      if (storage.dockitShowUrlBar !== false) {
        controlBar.style.display = 'flex';
      } else {
        controlBar.style.display = 'none';
      }
    } else {
      controlBar.style.display = 'none';
    }

    const inPage = document.querySelector('.dockit-in-page');
    const isSystemOpen = inPage && !inPage.classList.contains('dockit-hidden');
    _updateInMemoryIndicator(isSystemOpen);
  };

  //initialize empty state
  _setIframeSrc('');

  // Check if opening with a specific app or system app
  const currentOpen = await chrome.storage.local.get(['activeSystemApp', 'activeApp']);
  if (currentOpen.activeSystemApp) {
    sidebar.openSystemApp(currentOpen.activeSystemApp);
    chrome.storage.local.remove('activeSystemApp');
  } else if (currentOpen.activeApp) {
    _setIframeSrc(currentOpen.activeApp.url);
    chrome.storage.local.remove('activeApp');
  }

  // Listen to navigation events from sidebar clicks
  document.addEventListener('dockit-navigate', (e) => {
    _setIframeSrc(e.detail);
  });

  // Listen for messages from background (e.g. newly added temp app)
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'LOAD_APP') {
      _setIframeSrc(msg.app.url);
      sidebar.loadData();
    } else if (msg.type === 'LOAD_SYSTEM_APP') {
      sidebar.openSystemApp(msg.systemApp);
    }
  });

  // Re-render when storage changes
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.dockitShowUrlBar) {
      const show = changes.dockitShowUrlBar.newValue !== false;
      if (_activeUrl && show) {
        controlBar.style.display = 'flex';
      } else {
        controlBar.style.display = 'none';
      }
    }

    if (changes.dockitMobileDefault) {
      const isMobileDefault = changes.dockitMobileDefault.newValue !== false;
      const deviceBtn = controlBar.querySelector('#dockit-btn-device');
      if (isMobileDefault) {
        viewportWrapper.classList.remove('desktop-mode');
        viewportWrapper.classList.add('mobile-mode');
        if (deviceBtn) {
          deviceBtn.innerHTML = monitorSvg;
          deviceBtn.title = 'Toggle Desktop View';
        }
        chrome.runtime.sendMessage({ type: 'SET_MOBILE_USER_AGENT', enabled: true, url: _activeUrl }, () => {
          if (_activeUrl) {
            const frame = _iframes.get(_activeUrl);
            if (frame) frame.src = _activeUrl;
          }
        });
      } else {
        viewportWrapper.classList.remove('mobile-mode');
        viewportWrapper.classList.add('desktop-mode');
        if (deviceBtn) {
          deviceBtn.innerHTML = smartphoneSvg;
          deviceBtn.title = 'Toggle Mobile View';
        }
        chrome.runtime.sendMessage({ type: 'SET_MOBILE_USER_AGENT', enabled: false }, () => {
          if (_activeUrl) {
            const frame = _iframes.get(_activeUrl);
            if (frame) frame.src = _activeUrl;
          }
        });
      }
    }

    if (changes.pinnedApps || changes.temporaryApps || changes.lucideIcons) {
      if (changes.lucideIcons) sidebar.injectIcons();
      sidebar.loadData();
      sidebar.refreshActiveSite();

      let didDelete = false;
      _iframes.forEach((frame, url) => {
        let isDeleted = false;
        if (changes.pinnedApps) {
          const oldList = changes.pinnedApps.oldValue || [];
          const newList = changes.pinnedApps.newValue || [];
          const wasInOld = oldList.some(app => app.url === url);
          const isInNew = newList.some(app => app.url === url);
          if (wasInOld && !isInNew) {
            isDeleted = true;
          }
        }
        if (changes.temporaryApps) {
          const oldList = changes.temporaryApps.oldValue || [];
          const newList = changes.temporaryApps.newValue || [];
          const wasInOld = oldList.some(app => app.url === url);
          const isInNew = newList.some(app => app.url === url);
          if (wasInOld && !isInNew) {
            isDeleted = true;
          }
        }

        if (isDeleted) {
          frame.remove();
          _iframes.delete(url);
          didDelete = true;
          if (_activeUrl === url) {
            _setIframeSrc('');
          }
        }
      });

      if (didDelete) {
        const inPage = document.querySelector('.dockit-in-page');
        const isSystemOpen = inPage && !inPage.classList.contains('dockit-hidden');
        _updateInMemoryIndicator(isSystemOpen);
      }
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
