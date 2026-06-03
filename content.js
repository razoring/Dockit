//content.js
window.DOCKIT_INJECTED = true;
const SIDEBAR_WIDTH = 48;
const _shouldScanAbsolute = window.location.hostname.includes('mail.google.com') || window.location.hostname.includes('stitch.withgoogle.com');
let _hostElement = null;
let _sidebar = null;
let _isSidebarHidden = false;
let _currentTag = null;
let _isReinstating = false;
let _fixedObserver = null;
const _fixedElementsSet = new Set();
const _SKIPPED_TAGS = new Set([
  'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'li', 'ul', 'ol', 'img', 'svg', 'path', 'g', 'code',
  'pre', 'strong', 'em', 'i', 'b', 'u', 'br', 'hr',
  'script', 'style', 'link', 'meta', 'noscript', 'canvas',
  'rect', 'circle', 'polygon', 'line', 'polyline', 'ellipse', 'use', 'defs', 'symbol',
  'option', 'thead', 'tbody', 'tr', 'td', 'th', 'col', 'colgroup'
]);
const _pendingNodes = new Set();
let _pendingTimeout = null;

let _isAutoHideActive = false;
let _isSidebarVisible = true;
let _hoverProgress = 0;
let _autoHideCheckTimer = null;
let _lastMouseX = 0;
let _indicator = null;
let _recoveryObserver = null;
let _statusCheckInterval = null;
let _scrollListener = null;
let _mouseMoveListener = null;
let _mouseLeaveListener = null;
let _focusListener = null;
let _visibilityListener = null;

async function _createSidebar() {
  if (!chrome.runtime?.id) {
    _destroy();
    return;
  }
  if (_isReinstating) return;
  _isReinstating = true;
  try {
    const existing = document.getElementById('dockit-host-root');
    if (existing) {
      existing.remove();
    }
    _currentTag = Math.floor(Math.random() * 1000000).toString();
    try {
      const sid = await chrome.runtime.sendMessage({ type: 'GET_SESSION_ID' });
      if (sid) _currentTag = sid;
    } catch (e) {}
    _hostElement = document.createElement('div');
    _hostElement.id = 'dockit-host-root';
    if (_isSidebarHidden) {
      _hostElement.style.display = 'none';
    } else {
      _hostElement.style.display = '';
    }
    if (_isAutoHideActive) {
      _hostElement.classList.add('dockit-autohide-hidden');
    }
    const shadowRoot = _hostElement.attachShadow({ mode: 'open' });
    const tagEl = document.createElement('div');
    tagEl.id = 'dockit-tag';
    tagEl.dataset.value = _currentTag;
    tagEl.style.display = 'none';
    shadowRoot.appendChild(tagEl);
    const styleStorage = await chrome.storage.local.get(['fontCss', 'dockitStyles']);
    if (styleStorage.dockitStyles) {
      const mainStyle = document.createElement('style');
      mainStyle.textContent = styleStorage.dockitStyles;
      shadowRoot.appendChild(mainStyle);
    } else {
      // Fallback if cache is missing
      const styleLink = document.createElement('link');
      styleLink.rel = 'stylesheet';
      styleLink.href = chrome.runtime.getURL('styles.css');
      shadowRoot.appendChild(styleLink);
    }

    if (styleStorage.fontCss) {
      const fontStyle = document.createElement('style');
      fontStyle.textContent = styleStorage.fontCss;
      shadowRoot.appendChild(fontStyle);
    }
    _sidebar = new DockitSidebar(false);
    const sidebarEl = await _sidebar.render();
    shadowRoot.appendChild(sidebarEl);
    document.documentElement.appendChild(_hostElement);
  } catch (err) {
    if (err.message && err.message.includes('Extension context invalidated')) {
      _destroy();
    } else {
      console.error('Error reinstating sidebar:', err);
    }
  } finally {
    _isReinstating = false;
  }
}

async function init() {
  window.dispatchEvent(new CustomEvent('dockit-cleanup-old'));
  window.addEventListener('dockit-cleanup-old', _destroy);

  if (window !== window.top) return;

  const storage = await chrome.storage.local.get(['dockitDisableSidebarList', 'dockitForceAutohideList', 'dockitAutoHide']);
  const disableSidebarList = storage.dockitDisableSidebarList || DOCKIT_DEFAULTS.disableSidebarList;
  const currentHost = window.location.hostname.toLowerCase();
  const currentUrl = window.location.href.toLowerCase();

  const isBlocked = disableSidebarList.some((item) => {
    const cleanItem = item.toLowerCase().trim();
    if (!cleanItem) return false;
    return currentHost.includes(cleanItem) || currentUrl.includes(cleanItem);
  });

  if (isBlocked) {
    return;
  }

  const autoHideEnabled = !!storage.dockitAutoHide;
  const forceAutohideList = storage.dockitForceAutohideList || DOCKIT_DEFAULTS.forceAutohideList;
  const isForceAutoHideMatched = forceAutohideList.some((item) => {
    const cleanItem = item.toLowerCase().trim();
    if (!cleanItem) return false;
    return currentHost.includes(cleanItem) || currentUrl.includes(cleanItem);
  });

  _isAutoHideActive = autoHideEnabled || isForceAutoHideMatched;

  if (_isAutoHideActive) {
    document.documentElement.classList.add('dockit-autohide-active');
    _isSidebarVisible = false;
  } else {
    _isSidebarVisible = true;
  }

  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('scroll.js');
  (document.head || document.documentElement).appendChild(script);



  const layoutStyle = document.createElement('style');
  layoutStyle.id = 'dockit-layout-styles';
  layoutStyle.textContent = `
    html:not(.dockit-autohide-active) {
      overflow: hidden !important;
      height: 100% !important;
      scrollbar-gutter: auto !important;
    }
    html:not(.dockit-autohide-active) body {
      width: calc(100% - ${SIDEBAR_WIDTH}px) !important;
      height: 100% !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      position: relative !important;
      margin: 0 !important;
      box-sizing: border-box !important;
    }
    html body.dockit-full-width,
    html:not(.dockit-autohide-active) body.dockit-full-width {
      width: 100% !important;
    }
    #dockit-host-root {
      width: ${SIDEBAR_WIDTH}px;
      height: 100vh;
      position: fixed !important;
      top: 0 !important;
      right: 0 !important;
      z-index: 2147483647;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
    }
    #dockit-host-root.dockit-autohide-hidden {
      transform: translateX(${SIDEBAR_WIDTH}px) !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    @keyframes dockit-pattern-move {
      0% { background-position: 0 0; }
      100% { background-position: 0 400px; }
    }
    #dockit-autohide-indicator {
      position: fixed;
      top: 0;
      right: 0;
      width: 50px;
      height: 100vh;
      pointer-events: none;
      z-index: 2147483646;
      opacity: 0;
      background: linear-gradient(to bottom, var(--color-primary, #3b82f6), hsl(from var(--color-primary, #3b82f6) calc(h + 50) s l), var(--color-primary, #3b82f6));
      background-size: 100% 400px;
      animation: dockit-pattern-move 2.5s linear infinite;
      mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.73) 10%, rgba(0,0,0,0.51) 20%, rgba(0,0,0,0.34) 30%, rgba(0,0,0,0.22) 40%, rgba(0,0,0,0.13) 50%, rgba(0,0,0,0.06) 60%, rgba(0,0,0,0.03) 70%, rgba(0,0,0,0.01) 80%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.73) 10%, rgba(0,0,0,0.51) 20%, rgba(0,0,0,0.34) 30%, rgba(0,0,0,0.22) 40%, rgba(0,0,0,0.13) 50%, rgba(0,0,0,0.06) 60%, rgba(0,0,0,0.03) 70%, rgba(0,0,0,0.01) 80%, rgba(0,0,0,0) 100%);
      transition: opacity 0.05s linear;
    }
  `;
  document.head.appendChild(layoutStyle);

  //gmail targeted patch
  if (window.location.hostname.includes('mail.google.com')) {
    const gmailStyle = document.createElement('style');
    gmailStyle.id = 'dockit-gmail-patch';
    gmailStyle.textContent = `
      body:not(.dockit-full-width) #gb {
        width: calc(100% - 24px) !important;
        right: 24px !important;
      }
      body:not(.dockit-full-width) #gb + div,
      body:not(.dockit-full-width) #gb + .nH {
        width: calc(100% - ${SIDEBAR_WIDTH}px) !important;
        margin-right: ${SIDEBAR_WIDTH}px !important;
      }
      body:not(.dockit-full-width) .nH {
        max-width: 100% !important;
      }
    `;
    document.head.appendChild(gmailStyle);
  }

  //full viewport app targeted patches
  if (window.location.hostname.includes('stitch.withgoogle.com') || window.location.hostname.includes('chatgpt.com')) {
    const appStyle = document.createElement('style');
    appStyle.id = 'dockit-app-patch';
    appStyle.textContent = `
      body:not(.dockit-full-width) {
        overflow: hidden !important;
      }
      body:not(.dockit-full-width) > div {
        max-width: 100% !important;
        width: 100% !important;
      }
      body:not(.dockit-full-width) appcompanion-layout,
      body:not(.dockit-full-width) [class*="appcompanion-layout"],
      body:not(.dockit-full-width) [id*="appcompanion-layout"] {
        max-width: 100% !important;
        width: 100% !important;
      }
    `;
    document.head.appendChild(appStyle);
  }

  //reddit targeted patch
  if (window.location.hostname.includes('reddit.com')) {
    const redditStyle = document.createElement('style');
    redditStyle.id = 'dockit-reddit-patch';
    redditStyle.textContent = `
      body:not(.dockit-full-width) reddit-header-large *,
      body:not(.dockit-full-width) [class*="reddit-header"] * {
        max-width: 100% !important;
      }
      body:not(.dockit-full-width) #reddit-logo,
      body:not(.dockit-full-width) [id="reddit-logo"] {
        margin-left: 48px !important;
      }
      body:not(.dockit-full-width) #user-drawer-content,
      body:not(.dockit-full-width) [id="user-drawer-content"] {
        right: 64px !important;
        margin-left: -180px !important;
      }
    `;
    document.head.appendChild(redditStyle);
  }

  //linkedin targeted patch
  if (window.location.hostname.includes('linkedin.com')) {
    const linkedinStyle = document.createElement('style');
    linkedinStyle.id = 'dockit-linkedin-patch';
    linkedinStyle.textContent = `
      body:not(.dockit-full-width) .application-outlet__overlay-container,
      html:not(.dockit-full-width) .application-outlet__overlay-container {
        width: calc(100% - ${SIDEBAR_WIDTH}px) !important;
        max-width: calc(100% - ${SIDEBAR_WIDTH}px) !important;
        min-width: 0 !important;
      }
    `;
    document.head.appendChild(linkedinStyle);
  }

  //youtube targeted patch
  if (window.location.hostname.includes('youtube.com')) {
    const youtubeStyle = document.createElement('style');
    youtubeStyle.id = 'dockit-youtube-patch';
    youtubeStyle.textContent = `
      body:has(ytd-guide[opened]),
      body:has(tp-yt-app-drawer[opened]),
      body:has(tp-yt-iron-overlay-backdrop) {
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(youtubeStyle);
  }

  _indicator = document.createElement('div');
  _indicator.id = 'dockit-autohide-indicator';
  document.documentElement.appendChild(_indicator);

  _recoveryObserver = new MutationObserver(() => {
    if (!chrome.runtime?.id) {
      _destroy();
      return;
    }
    //verify tag and reinstate if mismatched or missing
    const existing = document.getElementById('dockit-host-root');
    if (!existing) {
      _createSidebar();
      return;
    }
    const shadow = existing.shadowRoot;
    const tagEl = shadow ? shadow.getElementById('dockit-tag') : null;
    const tagVal = tagEl ? tagEl.dataset.value : null;
    if (tagVal !== _currentTag) {
      _createSidebar();
      return;
    }

    if (_indicator && !_indicator.parentNode && document.documentElement) {
      document.documentElement.appendChild(_indicator);
    }
  });
  _recoveryObserver.observe(document.documentElement, { childList: true });

  _scrollListener = () => {
    window.dispatchEvent(new Event('scroll'));
    document.dispatchEvent(new Event('scroll'));
  };
  document.body?.addEventListener('scroll', _scrollListener);

  requestAnimationFrame(() => {
    _scanFixedElements();
    _startFixedObserver();
    setTimeout(() => { if (!_isSidebarHidden) _scanFixedElements(); }, 2000);
    setTimeout(() => { if (!_isSidebarHidden) _scanFixedElements(); }, 5000);
  });

  let currentWindowId = null;
  const _checkSidePanelStatus = () => {
    if (!chrome.runtime?.id) {
      _destroy();
      return;
    }
    if (!currentWindowId) return;
    try {
      chrome.runtime.sendMessage({ type: 'CHECK_SIDEPANEL_OPEN', windowId: currentWindowId }, (isOpen) => {
        if (chrome.runtime.lastError) {
          //handle extension reload
          return;
        }
        const actuallyOpen = !!isOpen;
        try { sessionStorage.setItem('dockit-sidepanel-open', actuallyOpen ? '1' : '0'); } catch (e) { }
        if (actuallyOpen !== _isSidebarHidden) {
          if (actuallyOpen) {
            _isSidebarHidden = true;
            _hostElement.style.display = 'none';
            document.documentElement.classList.add('dockit-full-width');
            document.body.classList.add('dockit-full-width');
            _removeFixedConstraints();
          } else {
            _isSidebarHidden = false;
            _hostElement.style.display = '';
            document.documentElement.classList.remove('dockit-full-width');
            document.body.classList.remove('dockit-full-width');
            requestAnimationFrame(() => _scanFixedElements());
            _sidebar.loadData();
          }
          chrome.storage.local.set({ [`sidePanelOpen_${currentWindowId}`]: actuallyOpen });
        }
      });
    } catch (err) {
      //handle context invalidated error
    }
  };

  //retrieve window id and panel status
  try {
    const winId = await new Promise((resolve) => {
      if (!chrome.runtime?.id) {
        resolve(null);
        return;
      }
      chrome.runtime.sendMessage({ type: 'GET_WINDOW_ID' }, (res) => {
        if (chrome.runtime.lastError) resolve(null);
        else resolve(res);
      });
    });
    currentWindowId = winId;
    if (winId) {
      const data = await chrome.storage.local.get(`sidePanelOpen_${winId}`);
      const isOpen = !!data[`sidePanelOpen_${winId}`];
      try { sessionStorage.setItem('dockit-sidepanel-open', isOpen ? '1' : '0'); } catch (e) { }
      if (isOpen) {
        _isSidebarHidden = true;
        document.documentElement.classList.add('dockit-full-width');
        document.body.classList.add('dockit-full-width');
      }
    }
  } catch (err) {
    //handle context invalidation
  }

  await _createSidebar();
  _checkSidePanelStatus();

  _focusListener = _checkSidePanelStatus;
  window.addEventListener('focus', _focusListener);
  _visibilityListener = () => {
    if (document.visibilityState === 'visible') {
      _checkSidePanelStatus();
    }
  };
  document.addEventListener('visibilitychange', _visibilityListener);
  _statusCheckInterval = setInterval(_checkSidePanelStatus, 10000);

  chrome.storage.onChanged.addListener((changes) => {
    if (currentWindowId && changes[`sidePanelOpen_${currentWindowId}`]) {
      const isOpen = !!changes[`sidePanelOpen_${currentWindowId}`].newValue;
      try { sessionStorage.setItem('dockit-sidepanel-open', isOpen ? '1' : '0'); } catch (e) { }
      if (isOpen) {
        _isSidebarHidden = true;
        _hostElement.style.display = 'none';
        document.documentElement.classList.add('dockit-full-width');
        document.body.classList.add('dockit-full-width');
        _removeFixedConstraints();
      } else {
        _isSidebarHidden = false;
        _hostElement.style.display = '';
        document.documentElement.classList.remove('dockit-full-width');
        document.body.classList.remove('dockit-full-width');
        requestAnimationFrame(() => _scanFixedElements());
        _sidebar.loadData();
      }
    }

    if (!_isSidebarHidden && (changes.pinnedApps || changes.temporaryApps || changes.lucideIcons)) {
      if (changes.lucideIcons) _sidebar.injectIcons();
      _sidebar.loadData();
    }

    if (changes.dockitAutoHide || changes.dockitForceAutohideList) {
      updateAutoHideState();
    }
  });

  initAutoHideTracking();
}

function _destroy() {
  if (_recoveryObserver) {
    _recoveryObserver.disconnect();
    _recoveryObserver = null;
  }
  if (_fixedObserver) {
    _fixedObserver.disconnect();
    _fixedObserver = null;
  }
  if (_statusCheckInterval) {
    clearInterval(_statusCheckInterval);
    _statusCheckInterval = null;
  }
  if (_autoHideCheckTimer) {
    clearInterval(_autoHideCheckTimer);
    _autoHideCheckTimer = null;
  }
  if (_scrollListener) {
    document.body?.removeEventListener('scroll', _scrollListener);
    _scrollListener = null;
  }
  if (_mouseMoveListener) {
    document.removeEventListener('mousemove', _mouseMoveListener);
    _mouseMoveListener = null;
  }
  if (_mouseLeaveListener) {
    document.removeEventListener('mouseleave', _mouseLeaveListener);
    _mouseLeaveListener = null;
  }
  if (_focusListener) {
    window.removeEventListener('focus', _focusListener);
    _focusListener = null;
  }
  if (_visibilityListener) {
    document.removeEventListener('visibilitychange', _visibilityListener);
    _visibilityListener = null;
  }
  window.removeEventListener('dockit-cleanup-old', _destroy);

  const existing = document.getElementById('dockit-host-root');
  if (existing) {
    existing.remove();
  }
  const indicator = document.getElementById('dockit-autohide-indicator');
  if (indicator) {
    indicator.remove();
  }
  const layoutStyles = document.getElementById('dockit-layout-styles');
  if (layoutStyles) {
    layoutStyles.remove();
  }
  const gmailStyles = document.getElementById('dockit-gmail-patch');
  if (gmailStyles) {
    gmailStyles.remove();
  }
  const appStyles = document.getElementById('dockit-app-patch');
  if (appStyles) {
    appStyles.remove();
  }
  const redditStyles = document.getElementById('dockit-reddit-patch');
  if (redditStyles) {
    redditStyles.remove();
  }
  const linkedinStyles = document.getElementById('dockit-linkedin-patch');
  if (linkedinStyles) {
    linkedinStyles.remove();
  }
  const youtubeStyles = document.getElementById('dockit-youtube-patch');
  if (youtubeStyles) {
    youtubeStyles.remove();
  }

  document.documentElement.classList.remove('dockit-autohide-active', 'dockit-full-width');
  document.body?.classList.remove('dockit-full-width');
  _removeFixedConstraints();
}

function _safeSetStyle(el, prop, val, priority = 'important') {
  if (el.style.getPropertyValue(prop) !== val) {
    el.style.setProperty(prop, val, priority);
  }
}

//constrain fixed/absolute elements
function _constrainFixedElement(el) {
  //skip extension elements
  if (_hostElement && (_hostElement === el || _hostElement.contains(el))) return;
  if (el.id === 'dockit-host-root') return;
  if (el.closest('#gb')) return;

  //skip youtube drawer and popup elements
  if (window.location.hostname.includes('youtube.com')) {
    if (el.closest('ytd-guide') || el.closest('tp-yt-app-drawer') || el.closest('ytd-popup-container') || el.closest('tp-yt-iron-overlay-backdrop') || el.tagName.toLowerCase().includes('iron-') || el.tagName.toLowerCase().includes('paper-')) return;
  }

  const totalOffset = SIDEBAR_WIDTH;
  const targetWidth = `calc(100vw - ${totalOffset}px)`;

  //re-check already-constrained elements for site js overrides
  if (el.dataset.dockitFixed) {
    //right-only constraints don't need re-checking
    if (!el.dataset.dockitWidth) return;
    //if our width constraint is still intact, skip
    if (el.style.getPropertyValue('width') === targetWidth) return;
    //site js overwrote our width, flow down to re-apply directly
  }

  const rect = el.getBoundingClientRect();
  const isOverlappingRight = rect.right > window.innerWidth - SIDEBAR_WIDTH;
  const isFullWidth = rect.width >= window.innerWidth - 1;
  const computed = getComputedStyle(el);
  const usesVw = computed.width.includes('vw') || computed.minWidth.includes('vw');

  if (!isOverlappingRight && !isFullWidth && !usesVw) return;

  if (el.dataset.dockitFixed !== '1') {
    el.dataset.dockitFixed = '1';
  }

  //clip children horizontally so vw-based descendants can't overflow
  _safeSetStyle(el, 'overflow-x', 'clip');

  //constrain vw-based widths to account for sidebar
  if (usesVw) {
    _safeSetStyle(el, 'width', targetWidth);
    _safeSetStyle(el, 'max-width', targetWidth);
    _safeSetStyle(el, 'min-width', '0');
    if (el.dataset.dockitWidth !== '1') {
      el.dataset.dockitWidth = '1';
    }
  }

  //offset right anchored elements
  const computedRight = parseFloat(computed.right);
  if (!isNaN(computedRight) && computedRight < totalOffset) {
    _safeSetStyle(el, 'right', (computedRight + totalOffset) + 'px');
  } else if (computed.right === 'auto' || isNaN(computedRight)) {
    const curRight = window.innerWidth - rect.right;
    _safeSetStyle(el, 'right', (curRight + totalOffset) + 'px');
  }

  //constrain full width elements
  if (isFullWidth) {
    _safeSetStyle(el, 'width', targetWidth);
    _safeSetStyle(el, 'max-width', targetWidth);
    _safeSetStyle(el, 'min-width', '0');
    if (el.dataset.dockitWidth !== '1') {
      el.dataset.dockitWidth = '1';
    }
    const computedLeft = parseFloat(computed.left);
    if (!isNaN(computedLeft) && computedLeft === 0) {
      _safeSetStyle(el, 'right', `${totalOffset}px`);
    }
  }
}

function _scanFixedElements() {
  if (_isAutoHideActive) return;
  const allElements = document.documentElement.querySelectorAll('*');
  for (const el of allElements) {
    if (_SKIPPED_TAGS.has(el.tagName.toLowerCase())) continue;
    const computed = getComputedStyle(el);
    if (computed.position === 'fixed' || computed.position === 'sticky' || (_shouldScanAbsolute && computed.position === 'absolute')) {
      _fixedElementsSet.add(el);
      _constrainFixedElement(el);
    }
  }
}

function _checkAndConstrain(el) {
  if (_isAutoHideActive) return;
  if (el.nodeType !== Node.ELEMENT_NODE) return;
  const tagName = el.tagName.toLowerCase();
  if (_SKIPPED_TAGS.has(tagName)) return;

  const computed = getComputedStyle(el);
  if (computed.position === 'fixed' || computed.position === 'sticky' || (_shouldScanAbsolute && computed.position === 'absolute')) {
    _fixedElementsSet.add(el);
    _constrainFixedElement(el);
  } else {
    if (_fixedElementsSet.has(el)) {
      _fixedElementsSet.delete(el);
      _removeConstraint(el);
    }
  }
  const children = el.querySelectorAll('*');
  for (const child of children) {
    if (_SKIPPED_TAGS.has(child.tagName.toLowerCase())) continue;
    const childComputed = getComputedStyle(child);
    if (childComputed.position === 'fixed' || childComputed.position === 'sticky' || (_shouldScanAbsolute && childComputed.position === 'absolute')) {
      _fixedElementsSet.add(child);
      _constrainFixedElement(child);
    } else {
      if (_fixedElementsSet.has(child)) {
        _fixedElementsSet.delete(child);
        _removeConstraint(child);
      }
    }
  }
}

function _queueCheckAndConstrain(node) {
  _pendingNodes.add(node);
  if (!_pendingTimeout) {
    _pendingTimeout = setTimeout(() => {
      for (const el of _pendingNodes) {
        if (document.documentElement.contains(el)) {
          _checkAndConstrain(el);
        }
      }
      _pendingNodes.clear();
      _pendingTimeout = null;
    }, 0);
  }
}

function _startFixedObserver() {
  if (_fixedObserver) return;
  _fixedObserver = new MutationObserver((mutations) => {
    if (!chrome.runtime?.id) {
      _destroy();
      return;
    }
    if (_isSidebarHidden || _isAutoHideActive) return;
    for (const m of mutations) {
      if (m.type === 'childList') {
        for (const node of m.addedNodes) {
          _queueCheckAndConstrain(node);
        }
      } else if (m.type === 'attributes') {
        _queueCheckAndConstrain(m.target);
      }
    }
  });
  _fixedObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });
}

function _removeConstraint(el) {
  if (el.style.getPropertyValue('right')) el.style.removeProperty('right');
  if (el.style.getPropertyValue('max-width')) el.style.removeProperty('max-width');
  if (el.style.getPropertyValue('min-width')) el.style.removeProperty('min-width');
  if (el.style.getPropertyValue('width')) el.style.removeProperty('width');
  if (el.style.getPropertyValue('overflow-x')) el.style.removeProperty('overflow-x');
  if (el.dataset.dockitFixed) delete el.dataset.dockitFixed;
  if (el.dataset.dockitWidth) delete el.dataset.dockitWidth;
}

function _removeFixedConstraints() {
  for (const el of _fixedElementsSet) {
    _removeConstraint(el);
  }
}

async function updateAutoHideState() {
  if (!chrome.runtime?.id) {
    _destroy();
    return;
  }
  const storage = await chrome.storage.local.get(['dockitAutoHide', 'dockitForceAutohideList']);
  const autoHideEnabled = !!storage.dockitAutoHide;
  const forceAutohideList = storage.dockitForceAutohideList || [];
  const currentHost = window.location.hostname.toLowerCase();
  const currentUrl = window.location.href.toLowerCase();

  const isForceAutoHideMatched = forceAutohideList.some((item) => {
    const cleanItem = item.toLowerCase().trim();
    if (!cleanItem) return false;
    return currentHost.includes(cleanItem) || currentUrl.includes(cleanItem);
  });

  const wasActive = _isAutoHideActive;
  _isAutoHideActive = autoHideEnabled || isForceAutoHideMatched;

  if (_isAutoHideActive) {
    document.documentElement.classList.add('dockit-autohide-active');
    _removeFixedConstraints();
    if (!wasActive) {
      hideSidebar();
    }
  } else {
    document.documentElement.classList.remove('dockit-autohide-active');
    if (wasActive) {
      showSidebar();
      _scanFixedElements();
    }
  }
}

function initAutoHideTracking() {
  _mouseMoveListener = (e) => {
    _lastMouseX = e.clientX;
    if (!_isAutoHideActive || _isSidebarHidden) return;

    const distance = window.innerWidth - e.clientX;
    if (!_isSidebarVisible) {
      if (distance <= 50 && distance >= 0) {
        startHoverTracking();
      } else {
        stopHoverTracking();
      }
    } else {
      if (distance > 48) {
        hideSidebar();
      }
    }
  };
  document.addEventListener('mousemove', _mouseMoveListener);

  _mouseLeaveListener = (e) => {
    if (_isAutoHideActive) {
      if (window.innerWidth - e.clientX <= 50) {
        return;
      }
      hideSidebar();
      stopHoverTracking();
    }
  };
  document.addEventListener('mouseleave', _mouseLeaveListener);
}

function startHoverTracking() {
  if (!_autoHideCheckTimer) {
    _hoverProgress = 0;
    _autoHideCheckTimer = setInterval(() => {
      if (_isSidebarVisible || !_isAutoHideActive || _isSidebarHidden) {
        stopHoverTracking();
        return;
      }

      const distance = window.innerWidth - _lastMouseX;
      if (distance > 50 || distance < 0) {
        stopHoverTracking();
        return;
      }

      const requiredDelay = 500 * Math.pow(60, distance / 50);
      _hoverProgress += 50 / requiredDelay;

      if (_indicator) {
        const progress = Math.min(_hoverProgress, 1);
        _indicator.style.opacity = Math.pow(progress, 4).toString();
      }

      if (_hoverProgress >= 1.0) {
        showSidebar();
        stopHoverTracking();
      }
    }, 50);
  }
}

function stopHoverTracking() {
  _hoverProgress = 0;
  if (_indicator && !_isSidebarVisible) {
    _indicator.style.opacity = '0';
  }
  if (_autoHideCheckTimer) {
    clearInterval(_autoHideCheckTimer);
    _autoHideCheckTimer = null;
  }
}

function showSidebar() {
  if (!_isSidebarVisible) {
    _isSidebarVisible = true;
    if (_hostElement) {
      _hostElement.classList.remove('dockit-autohide-hidden');
    }
    if (_indicator) {
      setTimeout(() => {
        if (_isSidebarVisible && _indicator) {
          _indicator.style.opacity = '0';
        }
      }, 250);
    }
  }
}

function hideSidebar() {
  if (_isSidebarVisible) {
    _isSidebarVisible = false;
    if (_hostElement) {
      _hostElement.classList.add('dockit-autohide-hidden');
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
