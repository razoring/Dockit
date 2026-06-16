function applyTheme(themeObj) {
  let styleEl = document.getElementById('dockit-applied-theme-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dockit-applied-theme-style';
    document.head.appendChild(styleEl);
  }
  if (!themeObj || !themeObj.colors) {
    styleEl.textContent = '';
    return;
  }
  let css = ':root {\n';
  for (const [key, val] of Object.entries(themeObj.colors)) {
    css += `  ${key}: ${val} !important;\n`;
  }
  if (themeObj.options) {
    for (const [key, val] of Object.entries(themeObj.options)) {
      css += `  ${key}: ${val} !important;\n`;
    }
  }
  css += '}';
  styleEl.textContent = css;

  //render theme images into sidebar and in-page panels
  const sidebarEl = document.querySelector('.dockit-sidebar');
  const inPageEl = document.querySelector('.dockit-in-page');

  if (sidebarEl) {
    sidebarEl.querySelectorAll('.dockit-mockup-container').forEach(el => el.remove());
  }
  if (inPageEl) {
    inPageEl.querySelectorAll('.dockit-mockup-container').forEach(el => el.remove());
  }

  if (themeObj.images && themeObj.images.length > 0) {
    const origSidebarWidth = 48;
    const origInPageWidth = 320;
    const origHeight = 500;
    
    let sidebarMockupContainer = null;
    let inPageMockupContainer = null;
    
    themeObj.images.forEach(imgData => {
      const targets = [];
      if (sidebarEl) targets.push({ clipTarget: sidebarEl, origWidth: origSidebarWidth, isSidebar: true });
      if (inPageEl) targets.push({ clipTarget: inPageEl, origWidth: origInPageWidth, isSidebar: false });

      targets.forEach(({ clipTarget, origWidth, isSidebar }) => {
        let targetContainer = null;
        if (isSidebar) {
          if (!sidebarMockupContainer) {
            sidebarMockupContainer = document.createElement('div');
            sidebarMockupContainer.className = 'dockit-mockup-container';
            sidebarMockupContainer.style.position = 'absolute';
            sidebarMockupContainer.style.inset = '0';
            sidebarMockupContainer.style.overflow = 'hidden';
            sidebarMockupContainer.style.zIndex = '-1';
            sidebarMockupContainer.style.borderRadius = 'inherit';
            sidebarMockupContainer.style.setProperty('pointer-events', 'none', 'important');
            sidebarEl.insertBefore(sidebarMockupContainer, sidebarEl.firstChild);
          }
          targetContainer = sidebarMockupContainer;
        } else {
          if (!inPageMockupContainer) {
            inPageMockupContainer = document.createElement('div');
            inPageMockupContainer.className = 'dockit-mockup-container';
            inPageMockupContainer.style.position = 'absolute';
            inPageMockupContainer.style.inset = '0';
            inPageMockupContainer.style.overflow = 'hidden';
            inPageMockupContainer.style.zIndex = '-1';
            inPageMockupContainer.style.borderRadius = 'inherit';
            inPageMockupContainer.style.setProperty('pointer-events', 'none', 'important');
            inPageEl.insertBefore(inPageMockupContainer, inPageEl.firstChild);
          }
          targetContainer = inPageMockupContainer;
        }

        const applyEdgeStickiness = (offset) => {
          const normalized = offset / 50; 
          const curved = Math.sign(normalized) * Math.pow(Math.abs(normalized), 0.35);
          return curved * 50;
        };

        let scaledWidth = imgData.width;
        let scaledHeight = imgData.height;
        let rawOffsetX = imgData.offsetX !== undefined ? imgData.offsetX : (imgData.x ? ((imgData.x + (imgData.width / 2) - (origWidth / 2)) / origWidth) * 100 : 0);
        let rawOffsetY = imgData.offsetY !== undefined ? imgData.offsetY : (imgData.y ? ((imgData.y + (imgData.height / 2) - (origHeight / 2)) / origHeight) * 100 : 0);

        if (imgData.parentId === 'sidebar' && !isSidebar) {
           scaledWidth *= 2;
           scaledHeight *= 2;
           rawOffsetX *= 0.5;
           rawOffsetY *= 0.5;
        } else if (imgData.parentId !== 'sidebar' && isSidebar) {
           scaledWidth *= 0.5;
           scaledHeight *= 0.5;
           rawOffsetX *= 2;
           rawOffsetY *= 2;
        }

        const widthPct = (scaledWidth / origWidth) * 100;
        const heightPct = (scaledHeight / origHeight) * 100;

        const stickyX = applyEdgeStickiness(rawOffsetX);
        const stickyY = applyEdgeStickiness(rawOffsetY);

        if (imgData.isPattern) {
          const patternLayer = document.createElement('div');
          patternLayer.className = 'dockit-mockup-pattern-layer';
          patternLayer.style.position = 'absolute';
          patternLayer.style.left = '0';
          patternLayer.style.top = '0';
          patternLayer.style.width = '100%';
          patternLayer.style.height = '100%';
          patternLayer.style.backgroundImage = `url("${imgData.src}")`;
          patternLayer.style.backgroundRepeat = 'repeat';
          patternLayer.style.setProperty('pointer-events', 'none', 'important');
          patternLayer.style.zIndex = '-1';
          if (isSidebar) {
            patternLayer.style.backgroundSize = `${scaledWidth}px ${scaledHeight}px`;
            patternLayer.style.backgroundPosition = `calc(50% + ${rawOffsetX}% + ${rawOffsetX * scaledWidth / 100}px) calc(50% + ${rawOffsetY}% + ${rawOffsetY * scaledHeight / 100}px)`;
          } else {
            patternLayer.style.backgroundSize = `auto ${heightPct}%`;
            patternLayer.style.backgroundPosition = `calc(50% + ${stickyX}%) calc(50% + ${stickyY}%)`;
          }
          targetContainer.appendChild(patternLayer);
        } else {
          const imgContainer = document.createElement('div');
          imgContainer.className = 'dockit-mockup-image-container';
          imgContainer.style.position = 'absolute';
          if (isSidebar) {
            imgContainer.style.width = `${scaledWidth}px`;
            imgContainer.style.height = `${scaledHeight}px`;
            imgContainer.style.left = `calc(50% + ${rawOffsetX}% - ${scaledWidth / 2}px)`;
            imgContainer.style.top = `calc(50% + ${rawOffsetY}% - ${scaledHeight / 2}px)`;
            imgContainer.style.transform = 'none';
          } else {
            imgContainer.style.width = 'auto';
            imgContainer.style.height = `${heightPct}%`;
            imgContainer.style.left = `calc(50% + ${stickyX}%)`;
            imgContainer.style.top = `calc(50% + ${stickyY}%)`;
            imgContainer.style.transform = 'translate(-50%, -50%)';
          }
          imgContainer.style.setProperty('pointer-events', 'none', 'important');
          imgContainer.style.zIndex = '0';
          imgContainer.style.display = 'flex';
          imgContainer.style.alignItems = 'center';
          imgContainer.style.justifyContent = 'center';

          const imgEl = document.createElement('img');
          imgEl.src = imgData.src;
          imgEl.className = 'dockit-mockup-image';
          imgEl.draggable = false;
          if (isSidebar) {
            imgEl.style.width = '100%';
            imgEl.style.height = '100%';
          } else {
            imgEl.style.width = 'auto';
            imgEl.style.height = '100%';
          }
          imgEl.style.objectFit = 'contain';
          imgEl.style.setProperty('pointer-events', 'none', 'important');
          imgContainer.appendChild(imgEl);

          targetContainer.appendChild(imgContainer);
        }
      });
    });
  }
}

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

  // Inject theme settings after sidebar is in DOM
  const themeData = await chrome.storage.local.get(['dockitTheme']);
  if (themeData.dockitTheme) {
    applyTheme(themeData.dockitTheme);
  }

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
  const xIconSvg = (storageData.lucideIcons && storageData.lucideIcons['x']) || '<svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

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
  let _currentDisplayUrl = '';

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
        if (frame) frame.src = _currentDisplayUrl || _activeUrl;
      }
    });
  }

  //open in new tab click handler
  const externalBtn = controlBar.querySelector('#dockit-btn-external');
  if (externalBtn) {
    externalBtn.addEventListener('click', () => {
      if (_currentDisplayUrl || _activeUrl) {
        window.open(_currentDisplayUrl || _activeUrl, '_blank');
      }
    });
  }

  //toggle mobile view mode click handler
  const deviceBtn = controlBar.querySelector('#dockit-btn-device');
  if (deviceBtn) {
    const isMobileInitial = viewportWrapper.classList.contains('mobile-mode');
    deviceBtn.innerHTML = isMobileInitial ? monitorSvg : smartphoneSvg;
    deviceBtn.title = isMobileInitial ? 'Toggle Desktop View' : 'Toggle Mobile View';

    deviceBtn.addEventListener('click', async () => {
      const isMobile = viewportWrapper.classList.contains('mobile-mode');
      const newViewMode = isMobile ? 'desktop' : 'mobile';
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

      // Spawn contextual popup prompt to add to blocklist
      if (_activeUrl) {
        let hostname = '';
        try {
          hostname = new URL(_activeUrl).hostname.toLowerCase().replace(/^www\./, '');
        } catch(e) {}
        
        if (hostname) {
          // Remove any existing popup
          const existingPopup = controlBar.querySelector('.dockit-forceview-popup');
          if (existingPopup) existingPopup.remove();

          const storage = await chrome.storage.local.get(['dockitForceViewList']);
          const forceViewList = storage.dockitForceViewList || DOCKIT_DEFAULTS.forceViewList;
          
          if (!forceViewList.includes(hostname)) {
            const popup = document.createElement('div');
            popup.className = 'dockit-forceview-popup';
            popup.style.cssText = 'position: absolute; right: 10px; top: 40px; background: color-mix(in srgb, var(--color-background) calc(var(--menu-opacity-value, 1) * 100%), transparent); border: 1px solid color-mix(in srgb, var(--color-border) calc(var(--menu-opacity-value, 1) * 100%), transparent); border-radius: 6px; padding: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 8px; z-index: 100; min-width: 200px;';
            
            popup.innerHTML = `
              <div style="display: flex; justify-content: space-between; align-items: center; color: var(--color-foreground);">
                <span style="font-weight: 500; font-size: 13px;">Force ${newViewMode} view?</span>
                <span class="dockit-forceview-close" style="cursor: pointer; opacity: 0.7;">${xIconSvg}</span>
              </div>
              <div style="font-size: 11px; opacity: 0.7; color: var(--color-foreground);">Always use ${newViewMode} view for ${hostname}</div>
              <button class="dockit-btn" style="background: var(--color-foreground); color: var(--color-background); border: none; padding: 6px; border-radius: 4px; font-weight: 500; cursor: pointer; margin-top: 4px;">Yes, force view</button>
            `;

            popup.querySelector('.dockit-forceview-close').addEventListener('click', () => popup.remove());
            popup.querySelector('button').addEventListener('click', async () => {
              forceViewList.push(hostname);
              await chrome.storage.local.set({ dockitForceViewList: forceViewList });
              popup.innerHTML = `<div style="font-size: 12px; color: var(--color-foreground); text-align: center; padding: 4px;">Added to blocklist!</div>`;
              setTimeout(() => popup.remove(), 1500);
            });

            controlBar.appendChild(popup);
          }
        }
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
    _currentDisplayUrl = targetUrl;
    
    if (dropdown) {
      dropdown.style.display = 'none';
    }

    _iframes.forEach((frame) => {
      frame.style.display = 'none';
    });
    
    // Remove any existing fallback UI
    const existingFallback = viewportWrapper.querySelector('.dockit-fallback-ui');
    if (existingFallback) existingFallback.remove();

    if (targetUrl) {
      let hostname = '';
      try {
        hostname = new URL(targetUrl).hostname.toLowerCase();
      } catch(e) {}

      // 1. Graceful Degradation (Blocklist)
      const strictDomains = ['mail.google.com', 'accounts.google.com', 'github.com'];
      const isStrict = strictDomains.some(d => hostname === d || hostname.endsWith('.' + d));

      if (isStrict) {
        const fallback = document.createElement('div');
        fallback.className = 'dockit-fallback-ui';
        fallback.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: 20px; color: var(--color-foreground);';
        
        fallback.innerHTML = `
          <div style="opacity: 0.5; margin-bottom: 12px;">${lockSvg}</div>
          <div style="font-weight: 500; margin-bottom: 8px;">Restricted Access</div>
          <div style="font-size: 13px; opacity: 0.7; margin-bottom: 16px;">This site restricts embedding for security reasons and cannot be displayed in the sidebar.</div>
          <button class="dockit-btn" style="padding: 8px 16px; background: var(--color-foreground); color: var(--color-background); border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">Open in New Tab</button>
        `;
        
        const btn = fallback.querySelector('button');
        btn.addEventListener('click', () => window.open(targetUrl, '_blank'));
        
        viewportWrapper.appendChild(fallback);
      } else {
        // 2. Force Opposite View (User Blocklist)
        const storageLists = await chrome.storage.local.get(['dockitForceViewList', 'dockitMobileDefault']);
        const forceViewList = storageLists.dockitForceViewList || DOCKIT_DEFAULTS.forceViewList;
        const isMobileDefault = storageLists.dockitMobileDefault !== undefined ? storageLists.dockitMobileDefault : DOCKIT_DEFAULTS.mobileDefault;
        
        const isForcedOpposite = forceViewList.some(d => {
          const cleanItem = d.toLowerCase().trim();
          if (!cleanItem) return false;
          return hostname.includes(cleanItem) || targetUrl.toLowerCase().includes(cleanItem);
        });

        // update dynamic user agent rules depending on current view mode
        let isMobile = viewportWrapper.classList.contains('mobile-mode');
        
        // Only apply force logic if we are rendering for the first time (not when user just clicked the toggle)
        // Wait, if _setIframeSrc is called, it reloads the frame. We should force the wrapper state if it's forced.
        if (isForcedOpposite) {
          isMobile = !isMobileDefault;
          if (isMobile) {
            viewportWrapper.classList.add('mobile-mode');
            viewportWrapper.classList.remove('desktop-mode');
            if (deviceBtn) {
              deviceBtn.innerHTML = monitorSvg;
              deviceBtn.title = 'Toggle Desktop View';
            }
          } else {
            viewportWrapper.classList.add('desktop-mode');
            viewportWrapper.classList.remove('mobile-mode');
            if (deviceBtn) {
              deviceBtn.innerHTML = smartphoneSvg;
              deviceBtn.title = 'Toggle Mobile View';
            }
          }
        }
        
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
          frame.style.cssText = 'width: 100%; height: 100%; border: none; display: none;';
          if (viewportWrapper) {
            viewportWrapper.appendChild(frame);
          }
          _iframes.set(targetUrl, frame);
        }
        frame.style.display = 'block';
      }

      
      //display url cleanly and toggle lock icon state
      try {
        const u = new URL(targetUrl);
        const urlText = controlBar.querySelector('#dockit-url-text');
        if (urlText) urlText.textContent = u.hostname + (u.pathname === '/' ? '' : u.pathname) + u.search + u.hash;
        
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
    if (changes.dockitTheme) {
      applyTheme(changes.dockitTheme.newValue);
    }

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

  // Listen for iframe URL updates
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'DOCKIT_IFRAME_URL') {
      const activeFrame = _iframes.get(_activeUrl);
      if (activeFrame && e.source === activeFrame.contentWindow) {
        const newUrl = e.data.url;
        _currentDisplayUrl = newUrl;

        // update url cleanly
        try {
          const u = new URL(newUrl);
          const urlText = controlBar.querySelector('#dockit-url-text');
          if (urlText) urlText.textContent = u.hostname + (u.pathname === '/' ? '' : u.pathname) + u.search + u.hash;
          
          const isSecure = newUrl.startsWith('https://');
          const lockIcon = controlBar.querySelector('#dockit-lock-container');
          if (lockIcon) {
            lockIcon.style.display = 'flex';
            lockIcon.innerHTML = isSecure ? lockSvg : lockOpenSvg;
          }
        } catch(err) {}
      }
    }
  });

  // Notify Background of Connection for state tracking with automatic reconnection
  const connectPort = (windowId) => {
    try {
      const port = chrome.runtime.connect({ name: 'sidepanel' });
      port.postMessage({ type: 'INIT', windowId });
      window._dockitPort = port;
      
      port.onDisconnect.addListener(() => {
        setTimeout(() => {
          if (chrome.runtime?.id) {
            connectPort(windowId);
          }
        }, 1000);
      });
    } catch (e) {
      setTimeout(() => {
        if (chrome.runtime?.id) {
          connectPort(windowId);
        }
      }, 5000);
    }
  };

  chrome.windows.getCurrent((win) => {
    connectPort(win.id);
    
    // Ping to keep the Service Worker awake while the panel is open
    setInterval(() => {
      try {
        if (window._dockitPort) {
          window._dockitPort.postMessage({ type: 'PING' });
        }
      } catch(e) {}
    }, 20000);
  });
}

document.addEventListener('DOMContentLoaded', init);
