//content.js

const SIDEBAR_WIDTH = 48;
const _isGmail = window.location.hostname.includes('mail.google.com');
const _shouldScanAbsolute = _isGmail || window.location.hostname.includes('stitch.withgoogle.com');
let _hostElement = null;
let _sidebar = null;
let _isSidebarHidden = false;
let _fixedObserver = null;
const _fixedElementsSet = new Set();

//inject main world scroll interception
if (window === window.top) {
  const _injectScript = document.createElement('script');
  _injectScript.src = chrome.runtime.getURL('scroll.js');
  document.documentElement.appendChild(_injectScript);
  _injectScript.remove();
}

async function init() {
  if (window !== window.top) return;
  if (document.getElementById('dockit-host-root')) return;

  //create host element
  _hostElement = document.createElement('div');
  _hostElement.id = 'dockit-host-root';

  const shadowRoot = _hostElement.attachShadow({ mode: 'open' });

  //inject stylesheet via link tag to bypass csp
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = chrome.runtime.getURL('styles.css');
  shadowRoot.appendChild(cssLink);

  //inject cached fonts
  const storage = await chrome.storage.local.get(['fontCss']);
  if (storage.fontCss) {
    const fontStyle = document.createElement('style');
    fontStyle.textContent = storage.fontCss;
    shadowRoot.appendChild(fontStyle);
  }

  //render sidebar
  _sidebar = new DockitSidebar(false);
  const sidebarEl = await _sidebar.render();
  shadowRoot.appendChild(sidebarEl);

  //inject layout styles
  const layoutStyle = document.createElement('style');
  layoutStyle.id = 'dockit-layout-styles';
  layoutStyle.textContent = `
    html {
      overflow: hidden !important;
      height: 100% !important;
    }
    body {
      width: calc(100% - ${SIDEBAR_WIDTH}px) !important;
      height: 100% !important;
      overflow-y: auto !important;
      overflow-x: auto !important;
      position: relative !important;
      margin: 0 !important;
      box-sizing: border-box !important;
      transition: width 0.2s ease-in-out !important;
    }
    body.dockit-full-width {
      width: 100% !important;
    }
    #dockit-host-root {
      width: ${SIDEBAR_WIDTH}px;
      height: 100vh;
      position: fixed !important;
      top: 0 !important;
      right: 0 !important;
      z-index: 2147483647;
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

  //append sidebar host to html element
  document.documentElement.appendChild(_hostElement);

  //ensure sidebar host is permanent
  const _recoveryObserver = new MutationObserver(() => {
    if (_hostElement && !_hostElement.parentNode && document.documentElement) {
      document.documentElement.appendChild(_hostElement);
    }
  });
  _recoveryObserver.observe(document.documentElement, { childList: true });

  //forward scroll events from body to window
  document.body.addEventListener('scroll', () => {
    window.dispatchEvent(new Event('scroll'));
    document.dispatchEvent(new Event('scroll'));
  });

  //initial scan for fixed elements
  requestAnimationFrame(() => {
    _scanFixedElements();
    _startFixedObserver();
  });

  //check initial sidepanel state
  let currentWindowId = null;
  chrome.runtime.sendMessage({ type: 'GET_WINDOW_ID' }, (winId) => {
    currentWindowId = winId;
    if (winId) {
      chrome.storage.local.get(`sidePanelOpen_${winId}`, (data) => {
        if (data[`sidePanelOpen_${winId}`]) {
          _isSidebarHidden = true;
          _hostElement.style.display = 'none';
          document.body.classList.add('dockit-full-width');
          _removeFixedConstraints();
        }
      });
    }
  });

  //react to sidepanel open/close
  chrome.storage.onChanged.addListener((changes) => {
    if (currentWindowId && changes[`sidePanelOpen_${currentWindowId}`]) {
      if (changes[`sidePanelOpen_${currentWindowId}`].newValue) {
        _isSidebarHidden = true;
        _hostElement.style.display = 'none';
        document.body.classList.add('dockit-full-width');
        _removeFixedConstraints();
      } else {
        _isSidebarHidden = false;
        _hostElement.style.display = '';
        document.body.classList.remove('dockit-full-width');
        requestAnimationFrame(() => _scanFixedElements());
        _sidebar.loadData();
      }
    }

    if (!_isSidebarHidden && (changes.pinnedApps || changes.temporaryApps || changes.lucideIcons)) {
      if (changes.lucideIcons) _sidebar.injectIcons();
      _sidebar.loadData();
    }
  });
}

//constrain fixed/absolute elements
function _constrainFixedElement(el) {
  if (el.dataset.dockitFixed) return;
  //skip extension elements
  if (_hostElement && (_hostElement === el || _hostElement.contains(el))) return;
  if (el.id === 'dockit-host-root') return;
  if (el.closest('#gb')) return;

  const rect = el.getBoundingClientRect();
  const isOverlappingRight = rect.right > window.innerWidth - SIDEBAR_WIDTH;
  const isFullWidth = rect.width >= window.innerWidth - 1;

  if (!isOverlappingRight && !isFullWidth) return;

  el.dataset.dockitFixed = '1';
  const computed = getComputedStyle(el);

  const hasScrollbar = document.body.scrollHeight > window.innerHeight;
  const scrollbarGap = hasScrollbar ? 16 : 0;
  const totalOffset = SIDEBAR_WIDTH + scrollbarGap;

  //offset right anchored elements
  const computedRight = parseFloat(computed.right);
  if (!isNaN(computedRight) && computedRight < totalOffset) {
    el.style.setProperty('right', (computedRight + totalOffset) + 'px', 'important');
  } else if (computed.right === 'auto' || isNaN(computedRight)) {
    const curRight = window.innerWidth - rect.right;
    el.style.setProperty('right', (curRight + totalOffset) + 'px', 'important');
  }

  //constrain full width elements
  if (isFullWidth) {
    el.style.setProperty('max-width', `calc(100vw - ${totalOffset}px)`, 'important');
    const computedLeft = parseFloat(computed.left);
    if (!isNaN(computedLeft) && computedLeft === 0) {
      el.style.setProperty('right', `${totalOffset}px`, 'important');
    }
  }
}

//scan body for fixed elements
function _scanFixedElements() {
  const allElements = document.body.querySelectorAll('*');
  for (const el of allElements) {
    const computed = getComputedStyle(el);
    if (computed.position === 'fixed' || (_shouldScanAbsolute && computed.position === 'absolute')) {
      _fixedElementsSet.add(el);
      _constrainFixedElement(el);
    }
  }
}

function _checkAndConstrain(el) {
  if (el.nodeType !== Node.ELEMENT_NODE) return;
  const computed = getComputedStyle(el);
  if (computed.position === 'fixed' || (_shouldScanAbsolute && computed.position === 'absolute')) {
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
    const childComputed = getComputedStyle(child);
    if (childComputed.position === 'fixed' || (_shouldScanAbsolute && childComputed.position === 'absolute')) {
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

//start mutation observer
function _startFixedObserver() {
  if (_fixedObserver) return;
  _fixedObserver = new MutationObserver((mutations) => {
    if (_isSidebarHidden) return;
    for (const m of mutations) {
      if (m.type === 'childList') {
        for (const node of m.addedNodes) {
          _checkAndConstrain(node);
        }
      } else if (m.type === 'attributes') {
        _checkAndConstrain(m.target);
      }
    }
  });
  _fixedObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });
}

function _removeConstraint(el) {
  el.style.removeProperty('right');
  el.style.removeProperty('max-width');
  delete el.dataset.dockitFixed;
}

//remove constraints
function _removeFixedConstraints() {
  for (const el of _fixedElementsSet) {
    _removeConstraint(el);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
